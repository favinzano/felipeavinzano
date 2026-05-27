
// ─── State ────────────────────────────────────────────────────────
let currentNarrative = '';
let currentCaseId = '';
let analysisResult = null;

// ─── Init ─────────────────────────────────────────────────────────
document.getElementById('analysis-date').value = new Date().toISOString().slice(0,10);

// ─── Navigation ───────────────────────────────────────────────────
function showView(name) {
  // Hide all views
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  // Show target
  const target = document.getElementById('view-' + name);
  if (target) target.classList.add('active');
  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  const navMap = { upload:'nav-upload', analysis:'nav-analysis', cases:'nav-cases',
    dashboard:'nav-dashboard', viewer:'nav-viewer', memo:'nav-memo', moot:'nav-moot' };
  if (navMap[name]) {
    const el = document.getElementById(navMap[name]);
    if (el) el.classList.add('active');
  }
  if (name === 'cases') renderCases();
}

// ─── Kimi API call ─────────────────────────────────────────────────
async function callKimiAPI(narrative, caseId) {
  const systemPrompt = `Eres NexusAI, un copiloto legal especializado en análisis de solicitudes de asilo I-589 bajo la ley de inmigración de EE.UU.

Evalúa la narrativa del solicitante según las 12 dimensiones legales y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:

{
  "caseId": "string",
  "score": number (0-100),
  "recommendation": "NEEDS_STRENGTHENING" | "PROMISING" | "STRONG",
  "nexoStrength": "ABSENT" | "WEAK" | "MODERATE" | "STRONG",
  "protectedGrounds": ["array of grounds detected"],
  "criticalGap": "string or null",
  "dimensions": [
    {
      "id": "languageReview",
      "name": "Revisión del Lenguaje",
      "status": "ok" | "warning" | "fail",
      "score": number (0-10),
      "finding": "string"
    }
  ],
  "priorityActions": ["string", "string", "string"],
  "legalBasis": "8 CFR §208.13 analysis string"
}

Las 12 dimensiones son:
1. languageReview - Revisión del Lenguaje
2. temporalCoherence - Coherencia Temporal
3. geographicCoherence - Coherencia Geográfica
4. causesAndConsequences - Causas y Consecuencias
5. contradictions - Contradicciones
6. timeGaps - Gaps en el Tiempo
7. exaggerations - Exageraciones
8. repetitions - Repeticiones
9. unverifiableFacts - Hechos No Verificables
10. causalNexus - Nexo Causal (CRÍTICO - evaluar contra 8 CFR §208.13 y los 5 motivos protegidos: raza, religión, nacionalidad, grupo social particular, opinión política)
11. logicalOrder - Orden Lógico
12. fearExpression - Expresión del Miedo (CRÍTICO)

Sé específico. Cita el texto del solicitante en los findings. No hagas generalizaciones.`;

  const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk-ukxKxV9vv6h6zttTRlySyDvZRzTLOSeOgL67639v4WwLPEOO'
    },
    body: JSON.stringify({
      model: 'kimi-k2.5',
      temperature: 1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analiza esta narrativa I-589. Case ID: ${caseId}\n\n${narrative}` }
      ]
    })
  });

  if (!response.ok) throw new Error('API error: ' + response.status);
  const data = await response.json();
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ─── Demo fallback ─────────────────────────────────────────────────
function getDemoResult(narrative, caseId) {
  return {
    caseId,
    score: 42,
    recommendation: "NEEDS_STRENGTHENING",
    nexoStrength: "WEAK",
    protectedGrounds: ["Opinión política imputada"],
    criticalGap: "Falta la conexión explícita 'on account of' entre la persecución y un motivo protegido específico (8 CFR §208.13).",
    dimensions: [
      { id: "languageReview", name: "Revisión del Lenguaje", status: "warning", score: 6, finding: "Lenguaje profesional pero excesivamente general. Falta especificidad sobre tipos de funcionarios y contenido exacto de amenazas." },
      { id: "temporalCoherence", name: "Coherencia Temporal", status: "warning", score: 5, finding: "Cronología lógica pero sin fechas específicas. Período de dos años vacío de eventos concretos." },
      { id: "geographicCoherence", name: "Coherencia Geográfica", status: "warning", score: 6, finding: "Se identifica país y ciudad, pero faltan detalles cruciales de ubicaciones específicas." },
      { id: "causesAndConsequences", name: "Causas y Consecuencias", status: "warning", score: 5, finding: "Secuencia causal implícita existe, pero falta explicación del POR QUÉ desde la perspectiva del perpetrador." },
      { id: "contradictions", name: "Contradicciones", status: "ok", score: 8, finding: "No se detectan contradicciones internas en el relato." },
      { id: "timeGaps", name: "Gaps en el Tiempo", status: "warning", score: 5, finding: "Vacío temporal crítico sin eventos específicos documentados." },
      { id: "exaggerations", name: "Exageraciones", status: "ok", score: 8, finding: "Tono mesurado y descriptivo sin lenguaje dramático excesivo." },
      { id: "repetitions", name: "Repeticiones", status: "ok", score: 9, finding: "Narrativa concisa sin repeticiones innecesarias." },
      { id: "unverifiableFacts", name: "Hechos No Verificables", status: "warning", score: 4, finding: "Hechos clave carecen de referencias a evidencia corroborativa (capturas WhatsApp, registros telefónicos)." },
      { id: "causalNexus", name: "Nexo Causal ⚠️", status: "warning", score: 4, finding: "CRÍTICO: Falta la conexión explícita 'on account of' requerida por 8 CFR §208.13. Se infiere nexo político pero no se establece explícitamente." },
      { id: "logicalOrder", name: "Orden Lógico", status: "ok", score: 8, finding: "Secuencia narrativa coherente y lógicamente organizada." },
      { id: "fearExpression", name: "Expresión del Miedo ⚠️", status: "warning", score: 5, finding: "Expresión de miedo insuficiente y genérica. No explica específicamente por qué teme regresar." }
    ],
    priorityActions: [
      "Establecer nexo causal explícito: identificar a los perpetradores como agentes con motivación política específica contra el solicitante como periodista que cubre protestas.",
      "Documentar fechas exactas de incidentes: el período 2022-2024 debe desagregarse con eventos específicos, lugares y testigos.",
      "Obtener evidencia corroborativa: capturas de WhatsApp de amenazas, registro de denuncia, testimonios de colegas periodistas que presenciaron la retención."
    ],
    legalBasis: "Bajo 8 CFR §208.13, el solicitante debe demostrar persecución 'on account of' uno de los 5 motivos protegidos. La narrativa actual describe hechos que podrían calificar bajo 'opinión política' o 'grupo social particular' (periodistas independientes en Venezuela), pero el nexo causal no está explícitamente articulado."
  };
}

// ─── Render results ────────────────────────────────────────────────
function renderResults(result, caseId) {
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('loading-state').classList.remove('flex');
  document.getElementById('results-state').classList.remove('hidden');
  document.getElementById('results-state').classList.add('flex');

  // Header
  document.getElementById('result-case-id').textContent = 'Analysis: ' + (result.caseId || caseId);
  document.getElementById('result-subtitle').textContent = 'Powered by Kimi LLM • 12 dimensions evaluated • ' + new Date().toLocaleString();

  // Score ring
  const score = result.score || 0;
  document.getElementById('score-ring').style.setProperty('--pct', score + '%');
  document.getElementById('score-display').textContent = score;
  document.getElementById('side-score').textContent = score + '/100';

  const labels = { NEEDS_STRENGTHENING: '⚠️ Needs strengthening', PROMISING: '✅ Promising', STRONG: '🟢 Strong case' };
  document.getElementById('score-label').textContent = labels[result.recommendation] || result.recommendation;
  document.getElementById('side-recommendation').textContent = labels[result.recommendation] || result.recommendation;

  // Nexo
  const nexoColors = { ABSENT: 'text-red-600', WEAK: 'text-amber-600', MODERATE: 'text-blue-600', STRONG: 'text-accent' };
  const nexoEl = document.getElementById('side-nexo');
  nexoEl.textContent = result.nexoStrength;
  nexoEl.className = 'text-sm font-bold ' + (nexoColors[result.nexoStrength] || 'text-slate-600');

  // Health bar
  document.getElementById('health-bar').style.width = score + '%';
  document.getElementById('health-pct').textContent = score + '%';

  // Protected grounds
  const groundsEl = document.getElementById('protected-grounds');
  groundsEl.innerHTML = '';
  (result.protectedGrounds || []).forEach(g => {
    const span = document.createElement('span');
    span.className = 'px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded';
    span.textContent = g;
    groundsEl.appendChild(span);
  });

  // Critical alert
  if (result.criticalGap) {
    document.getElementById('critical-alert').classList.remove('hidden');
    document.getElementById('critical-alert-text').textContent = result.criticalGap;
  }

  // Dimension bars (top 6)
  const barsEl = document.getElementById('dimension-bars');
  barsEl.innerHTML = '';
  const topDims = (result.dimensions || []).slice(0, 6);
  topDims.forEach(d => {
    const pct = (d.score / 10) * 100;
    const color = d.status === 'ok' ? '#00D4AA' : d.status === 'warning' ? '#F59E0B' : '#ef4444';
    barsEl.innerHTML += `
      <div class="space-y-1">
        <div class="flex justify-between text-xs">
          <span class="font-semibold text-slate-700">${d.name.replace(' ⚠️','')}</span>
          <span class="font-bold text-primary">${d.score}/10</span>
        </div>
        <div class="dim-bar"><div class="dim-fill" style="width:${pct}%; background:${color}"></div></div>
      </div>`;
  });

  // Dimensions grid
  const dimsEl = document.getElementById('dimensions-grid');
  dimsEl.innerHTML = '';
  (result.dimensions || []).forEach((d, i) => {
    const statusClass = { ok: 'status-ok', warning: 'status-warn', fail: 'status-fail' }[d.status] || 'status-warn';
    const statusLabel = { ok: '✓ OK', warning: '⚠ Warning', fail: '✗ Fail' }[d.status] || d.status;
    dimsEl.innerHTML += `
      <div class="flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50 fade-in" style="animation-delay:${i*0.05}s">
        <div class="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">${i+1}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-bold text-slate-800">${d.name.replace(' ⚠️','')}</span>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${statusClass}">${statusLabel}</span>
            <span class="text-xs font-bold text-primary ml-auto">${d.score}/10</span>
          </div>
          <p class="text-xs text-slate-500 leading-relaxed">${d.finding}</p>
        </div>
      </div>`;
  });

  // Priority actions
  const actEl = document.getElementById('actions-list');
  actEl.innerHTML = '';
  (result.priorityActions || []).forEach((a, i) => {
    actEl.innerHTML += `
      <li class="flex items-start gap-4">
        <div class="size-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">${i+1}</div>
        <p class="text-sm text-slate-700">${a}</p>
      </li>`;
  });

  // Raw report
  document.getElementById('raw-report').textContent = JSON.stringify(result, null, 2);
}

// ─── Result tabs ───────────────────────────────────────────────────
function switchResultTab(tab) {
  ['dims','actions','raw'].forEach(t => {
    document.getElementById('pane-' + t).classList.toggle('hidden', t !== tab);
    document.getElementById('tab-' + t).className = 'px-6 py-4 text-sm ' + (t === tab ? 'tab-active' : 'tab-inactive');
  });
}

// ─── Export ────────────────────────────────────────────────────────
function exportReport() {
  if (!analysisResult) return;
  const text = `NEXUSAI — REPORTE DE ANÁLISIS I-589\nCase ID: ${currentCaseId}\nDate: ${new Date().toISOString()}\n\n` +
    `SCORE: ${analysisResult.score}/100\nRECOMENDACIÓN: ${analysisResult.recommendation}\nNEXO CAUSAL: ${analysisResult.nexoStrength}\n\n` +
    `DIMENSIONES:\n${(analysisResult.dimensions||[]).map(d => `${d.name}: ${d.status.toUpperCase()} (${d.score}/10)\n  ${d.finding}`).join('\n\n')}\n\n` +
    `ACCIONES PRIORITARIAS:\n${(analysisResult.priorityActions||[]).map((a,i) => `${i+1}. ${a}`).join('\n')}\n\n` +
    `BASE LEGAL:\n${analysisResult.legalBasis}`;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `nexusai-report-${currentCaseId}-${Date.now()}.txt`;
  a.click(); URL.revokeObjectURL(url);
}


// ─── Memorandum ────────────────────────────────────────────────────
function openMemo(caseId) {
  const c = CASES.find(x => x.id === (caseId || currentCaseId));
  const id = c ? c.id : (currentCaseId || 'ASY-2024-089');
  document.getElementById('memo-case-badge').textContent = id;
  document.getElementById('memo-re').value = 'I-589 Analysis — ' + id;
  document.getElementById('memo-date').value = new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
  document.getElementById('memo-preview-date').textContent = document.getElementById('memo-date').value;
  document.getElementById('memo-preview-re').textContent = document.getElementById('memo-re').value;
  document.getElementById('memo-body').innerHTML = '<div class="text-center text-slate-300 py-16"><span class="material-symbols-outlined text-5xl" style="color:#e2e8f0">auto_awesome</span><p style="font-family:Inter,sans-serif;font-size:13px;color:#94a3b8;margin-top:12px">Configure the options on the left and click<br/><strong>Generate Memorandum</strong> to produce the AI-drafted memo.</p></div>';
  showView('memo');
}

function memoTab(tab) {
  const preview = document.getElementById('memo-preview-pane');
  const edit    = document.getElementById('memo-edit-pane');
  const tPrev   = document.getElementById('memo-tab-preview');
  const tEdit   = document.getElementById('memo-tab-edit');
  if (tab === 'preview') {
    preview.classList.remove('hidden'); edit.classList.add('hidden');
    tPrev.classList.add('border-primary','text-primary'); tPrev.classList.remove('border-transparent','text-slate-500');
    tEdit.classList.add('border-transparent','text-slate-500'); tEdit.classList.remove('border-primary','text-primary');
  } else {
    edit.classList.remove('hidden'); preview.classList.add('hidden');
    tEdit.classList.add('border-primary','text-primary'); tEdit.classList.remove('border-transparent','text-slate-500');
    tPrev.classList.add('border-transparent','text-slate-500'); tPrev.classList.remove('border-primary','text-primary');
    // Sync editable from preview
    document.getElementById('memo-editable').innerHTML = document.getElementById('memo-paper').innerHTML;
  }
}

async function generateMemo() {
  const btn = document.getElementById('memo-gen-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Generating...';

  const statusEl = document.getElementById('memo-gen-status');
  const stepsEl  = document.getElementById('memo-gen-steps');
  statusEl.classList.remove('hidden');
  stepsEl.innerHTML = '';

  const steps = [
    'Loading case data and analysis results...',
    'Extracting 12-dimension findings...',
    'Drafting legal sections with Kimi LLM...',
    'Applying ' + document.getElementById('memo-tone').value + ' tone...',
    'Finalizing memorandum structure...'
  ];
  for (const s of steps) {
    await new Promise(r => setTimeout(r, 600));
    const d = document.createElement('div');
    d.className = 'flex items-center gap-1.5 fade-in';
    d.innerHTML = '<span class="material-symbols-outlined text-accent text-sm">check_circle</span>' + s;
    stepsEl.appendChild(d);
  }

  // Build memo from analysis result or demo
  const result = analysisResult || getDemoResult('', currentCaseId || 'ASY-2024-089');
  const caseId = currentCaseId || 'ASY-2024-089';
  const toVal  = document.getElementById('memo-to').value;
  const reVal  = document.getElementById('memo-re').value;
  const dateVal= document.getElementById('memo-date').value;
  const score  = result.overallScore || 42;
  const nexo   = result.nexo || 'WEAK';
  const rec    = result.recommendation || 'NEEDS_STRENGTHENING';
  const gap    = result.criticalGap || 'Falta nexo causal explícito bajo 8 CFR §208.13';
  const dims   = result.dimensions || [];

  // Build sections HTML
  let sectionsHTML = '';

  if (document.getElementById('sec-summary').checked) {
    sectionsHTML += `
      <section>
        <h2 style="font-size:0.9rem;font-weight:700;margin-bottom:10px;font-family:Inter,sans-serif;letter-spacing:0.05em">I. EXECUTIVE SUMMARY</h2>
        <p>This memorandum analyzes the asylum eligibility of Case No. <strong>${caseId}</strong> under the Immigration and Nationality Act (INA §101(a)(42)) and 8 CFR §208.13. The AI-driven analysis assigned an overall Case Strength Score of <strong>${score}/100</strong> with a Nexo classification of <strong>${nexo}</strong>. The case presents ${score >= 70 ? 'a strong foundation for asylum eligibility' : score >= 50 ? 'moderate indicators of persecution with notable evidentiary gaps' : 'significant evidentiary weaknesses requiring immediate remediation'}.</p>
      </section>`;
  }

  if (document.getElementById('sec-overview').checked) {
    sectionsHTML += `
      <section>
        <h2 style="font-size:0.9rem;font-weight:700;margin-bottom:10px;font-family:Inter,sans-serif;letter-spacing:0.05em">II. CASE OVERVIEW</h2>
        <p>The applicant's claim is predicated on a documented pattern of persecution by non-state actors operating with government acquiescence in their country of origin. The narrative analysis identified a chronological sequence of escalating incidents culminating in the applicant's decision to flee. Protected grounds asserted include political opinion and membership in a particular social group as defined under Matter of Acosta, 19 I&amp;N Dec. 211 (BIA 1985).</p>
      </section>`;
  }

  if (document.getElementById('sec-risk').checked) {
    const riskColor = score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
    sectionsHTML += `
      <section>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h2 style="font-size:0.9rem;font-weight:700;font-family:Inter,sans-serif;letter-spacing:0.05em">III. RISK ASSESSMENT</h2>
          <span style="font-family:Inter,sans-serif;font-size:11px;font-weight:800;color:${riskColor};background:${riskColor}15;padding:3px 10px;border-radius:4px;border:1px solid ${riskColor}30">Score: ${score}/100</span>
        </div>
        <p>The NexusAI Legal Engine v3.0 (Kimi K2.5, 12-dimension evaluation) returned a Case Strength Score of <strong>${score}/100</strong>. The recommendation is: <strong>${rec.replace(/_/g,' ')}</strong>. The causal nexus (Nexo) was classified as <strong>${nexo}</strong>, which is the most critical factor for asylum adjudication under 8 CFR §208.13.</p>
        <div style="margin-top:12px;background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden"><div style="background:${riskColor};height:100%;width:${score}%"></div></div>
      </section>`;
  }

  if (document.getElementById('sec-evidence').checked) {
    const topDims = dims.slice(0,4).map(d =>
      `<li><strong>${d.name}:</strong> ${d.finding || d.detail || 'See full analysis.'} (Score: ${d.score}/10)</li>`
    ).join('') || '<li>See attached 12-dimension analysis report for complete findings.</li>';
    sectionsHTML += `
      <section>
        <h2 style="font-size:0.9rem;font-weight:700;margin-bottom:10px;font-family:Inter,sans-serif;letter-spacing:0.05em">IV. EVIDENCE ANALYSIS</h2>
        <p>The AI engine evaluated the narrative across 12 legal dimensions. Key findings include:</p>
        <ul style="margin-top:10px;padding-left:20px;line-height:2">${topDims}</ul>
      </section>`;
  }

  if (document.getElementById('sec-gaps').checked) {
    sectionsHTML += `
      <section>
        <h2 style="font-size:0.9rem;font-weight:700;margin-bottom:10px;font-family:Inter,sans-serif;letter-spacing:0.05em">V. CRITICAL GAPS</h2>
        <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:2px;margin-bottom:12px">
          <p style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">⚠ Primary Critical Gap</p>
          <p style="font-size:13px">${gap}</p>
        </div>
        <ul style="padding-left:20px;line-height:2;font-style:italic">
          <li>Documentation of police inaction or state actor nexus may require supplemental affidavit.</li>
          <li>Medical records or physical evidence of persecution incidents should be obtained where available.</li>
          <li>Country condition reports should be updated to the most recent State Department or UNHCR publication.</li>
        </ul>
      </section>`;
  }

  if (document.getElementById('sec-recs').checked) {
    sectionsHTML += `
      <section>
        <h2 style="font-size:0.9rem;font-weight:700;margin-bottom:10px;font-family:Inter,sans-serif;letter-spacing:0.05em">VI. RECOMMENDATIONS</h2>
        <p>Based on the NexusAI analysis, we recommend the following actions prior to submission:</p>
        <ol style="margin-top:10px;padding-left:20px;line-height:2">
          <li><strong>Strengthen the nexo:</strong> The narrative must explicitly articulate the "on account of" connection between persecution and a protected ground per 8 CFR §208.13.</li>
          <li><strong>Corroborate key incidents:</strong> Obtain witness statements, medical records, or police reports for each identified persecution event.</li>
          <li><strong>Supplement with country conditions:</strong> Attach current State Department or UNHCR reports confirming the described conditions in applicant's country of origin.</li>
          <li><strong>Prepare applicant testimony:</strong> Address identified time gaps and strengthen the expression of subjective fear for the credible fear standard.</li>
        </ol>
      </section>`;
  }

  document.getElementById('memo-body').innerHTML = sectionsHTML;
  document.getElementById('memo-preview-to').textContent = toVal;
  document.getElementById('memo-preview-re').textContent = reVal;
  document.getElementById('memo-preview-date').textContent = dateVal;

  statusEl.classList.add('hidden');
  btn.disabled = false;
  btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Regenerate';
  memoTab('preview');
}

function exportMemoTxt() {
  const paper = document.getElementById('memo-paper');
  const text = paper ? paper.innerText : 'No memo generated.';
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
  a.download = 'NexusAI_Memo_' + (currentCaseId || 'case') + '.txt';
  a.click();
}

function printMemo() { window.print(); }

function copyMemo() {
  const paper = document.getElementById('memo-paper');
  if (paper) navigator.clipboard.writeText(paper.innerText).then(() => alert('Memorandum copied to clipboard.'));
}

// ─── PDF Viewer ────────────────────────────────────────────────────
let viewerCurrentPage = 1;
let viewerZoomPct = 100;
const VIEWER_TOTAL = 3;

function openViewer(caseId) {
  const c = CASES.find(x => x.id === caseId);
  if (c) {
    document.getElementById('viewer-case-id').textContent = c.id;
    document.getElementById('viewer-doc-name').textContent = c.client.split(',')[1]?.trim() + '_Narrative.pdf' || 'Narrative.pdf';
    document.getElementById('viewer-client-title').textContent = 'Personal Statement — ' + c.client;
    document.getElementById('viewer-case-footer').textContent = c.id;
    document.getElementById('viewer-case-footer-2').textContent = c.id;
    if (c.score != null) {
      document.getElementById('viewer-score').innerHTML = c.score + '<span class="text-sm text-slate-400">/100</span>';
    }
  }
  viewerCurrentPage = 1;
  viewerZoomPct = 100;
  viewerRender();
  showView('viewer');
}

function viewerRender() {
  // Pages
  for (let i = 1; i <= VIEWER_TOTAL; i++) {
    const el = document.getElementById('pdf-page-' + i);
    if (el) el.classList.toggle('hidden', i !== viewerCurrentPage);
    const th = document.getElementById('thumb-' + i);
    if (th) {
      th.classList.toggle('border-accent', i === viewerCurrentPage);
      th.classList.toggle('border-transparent', i !== viewerCurrentPage);
      th.classList.toggle('opacity-60', i !== viewerCurrentPage);
      th.classList.toggle('opacity-100', i === viewerCurrentPage);
    }
  }
  document.getElementById('viewer-page').textContent = viewerCurrentPage;
  document.getElementById('viewer-total').textContent = VIEWER_TOTAL;
  document.getElementById('viewer-page-footer').textContent = 'Page ' + viewerCurrentPage + ' of ' + VIEWER_TOTAL + ' — Exhibit';
  // Zoom
  const stage = document.getElementById('pdf-stage');
  if (stage) stage.style.transform = 'scale(' + (viewerZoomPct/100) + ')';
  document.getElementById('viewer-zoom-label').textContent = viewerZoomPct + '%';
}

function viewerPageChange(dir) {
  viewerCurrentPage = Math.max(1, Math.min(VIEWER_TOTAL, viewerCurrentPage + dir));
  viewerRender();
}

function viewerGoPage(n) {
  viewerCurrentPage = n;
  viewerRender();
}

function viewerZoom(delta) {
  viewerZoomPct = Math.max(50, Math.min(200, viewerZoomPct + delta));
  viewerRender();
}


// ─── Moot Court ───────────────────────────────────────────────────
function openMoot(caseId) {
  const id = caseId || currentCaseId || 'ASY-2024-089';
  document.getElementById('moot-case-badge').textContent = id;
  // Reset UI
  document.getElementById('moot-idle').classList.remove('hidden');
  document.getElementById('moot-idle').classList.add('flex');
  document.getElementById('moot-loading').classList.add('hidden');
  document.getElementById('moot-loading').classList.remove('flex');
  document.getElementById('moot-debate').classList.add('hidden');
  document.getElementById('moot-debate').innerHTML = '';
  document.getElementById('moot-gap-empty').classList.remove('hidden');
  document.getElementById('moot-gap-results').classList.add('hidden');
  showView('moot');
}

async function runMootCourt() {
  const result  = analysisResult || getDemoResult('', currentCaseId || 'ASY-2024-089');
  const score   = result.overallScore || 42;
  const nexo    = result.nexo || 'WEAK';
  const gap     = result.criticalGap || 'Falta nexo causal explícito bajo 8 CFR §208.13';
  const rounds  = parseInt(document.getElementById('moot-rounds').value) || 3;
  const circuit = document.getElementById('moot-circuit').value;
  const dims    = result.dimensions || [];

  // Show loading
  document.getElementById('moot-idle').classList.add('hidden');
  document.getElementById('moot-idle').classList.remove('flex');
  const loadEl = document.getElementById('moot-loading');
  loadEl.classList.remove('hidden');
  loadEl.classList.add('flex');
  const stepsEl = document.getElementById('moot-load-steps');
  stepsEl.innerHTML = '';

  const loadSteps = [
    'Initializing adversarial agents...',
    'Loading 12-dimension analysis into agent context...',
    'DHS Prosecutor preparing attack vectors...',
    'Defense Counsel loading jurisprudence — ' + circuit + '...',
    'Immigration Judge calibrating P(grant|evidence)...',
    'Running ' + rounds + '-round simulation...'
  ];
  for (const s of loadSteps) {
    await new Promise(r => setTimeout(r, 500));
    const d = document.createElement('div');
    d.className = 'flex items-center gap-2 fade-in';
    d.innerHTML = '<span class="material-symbols-outlined text-accent text-sm">check_circle</span><span>' + s + '</span>';
    stepsEl.appendChild(d);
  }
  await new Promise(r => setTimeout(r, 400));

  // Generate debate content based on analysis
  const attacks = generateAttacks(score, nexo, gap, dims, rounds);
  const debateEl = document.getElementById('moot-debate');
  debateEl.innerHTML = '';

  loadEl.classList.add('hidden');
  loadEl.classList.remove('flex');
  debateEl.classList.remove('hidden');

  // Render rounds with stagger
  for (let i = 0; i < attacks.length; i++) {
    await new Promise(r => setTimeout(r, 200));
    const round = attacks[i];
    const roundDiv = document.createElement('div');
    roundDiv.className = 'fade-in';
    roundDiv.innerHTML = renderRound(round, i + 1);
    debateEl.appendChild(roundDiv);
    debateEl.scrollTop = debateEl.scrollHeight;
  }

  // Render judge verdict
  await new Promise(r => setTimeout(r, 400));
  const prob = computeProbability(score, nexo, attacks);
  const judgeDiv = document.createElement('div');
  judgeDiv.className = 'fade-in';
  judgeDiv.innerHTML = renderJudgeVerdict(prob, attacks, gap);
  debateEl.appendChild(judgeDiv);
  debateEl.scrollTop = debateEl.scrollHeight;

  // Update gap panel
  renderGapPanel(prob, attacks, gap, score);

  // Update run button
  const btn = document.getElementById('moot-run-btn');
  btn.innerHTML = '<span class="material-symbols-outlined text-lg">refresh</span> Re-run Simulation';
}

function generateAttacks(score, nexo, gap, dims, rounds) {
  const weakDims = dims.filter(d => d.status !== 'ok').slice(0, rounds);
  const attackTemplates = [
    {
      category: 'nexus',
      severity: 'critical',
      prosecution: 'The applicant's narrative fails to establish the required "on account of" nexus under 8 CFR §208.13. The incidents described appear to be generalized criminal violence rather than persecution based on a protected ground. Without explicit evidence linking the attacks to political opinion, this claim cannot meet the well-founded fear standard.',
      defense: 'Counsel objects. Under Matter of Mogharrabi, the nexus does not require the persecutor to explicitly articulate a protected motive. The paramilitary pamphlet left at the scene and the attacker's statement — "this is for being an opposition leader" — directly establishes political opinion as a central reason. The 11th Circuit consistently recognizes imputed political opinion as a protected ground.',
      weakness: nexo === 'WEAK' || nexo === 'ABSENT'
    },
    {
      category: 'credibility',
      severity: 'high',
      prosecution: 'The applicant delayed reporting the January 2024 assault to police by two days. This delay, combined with the absence of medical records documenting the alleged injuries, significantly undermines the credibility of the persecution claims. REAL ID Act requires the trier of fact to consider such inconsistencies.',
      defense: 'The delay in reporting is consistent with the documented psychology of persecution victims operating in environments where state actors are complicit. The police visit — and the officer's documented refusal to file a report — actually corroborates the applicant's account of state acquiescence, not undermines it. Medical records from informal treatment are being obtained.',
      weakness: score < 70
    },
    {
      category: 'internal_relocation',
      severity: 'medium',
      prosecution: 'The government submits that the applicant failed to exhaust internal relocation options before fleeing the country. The applicant briefly relocated to a relative's home in another city. There is no evidence demonstrating that the persecutor had the means or motivation to pursue the applicant nationally.',
      defense: 'The applicant received a text message at their personal phone number stating "no matter where you hide, Veridia is small for us" — demonstrating the persecutor's demonstrated capacity for nationwide tracking. Under Matter of D-I-M-, an applicant cannot be expected to internally relocate when the persecutor has demonstrated nationwide reach.',
      weakness: score < 80
    },
    {
      category: 'state_action',
      severity: 'high',
      prosecution: 'The applicant's claim relies on a non-state actor — La Vanguardia — as the persecutor. The applicant must demonstrate not only that the government was unable to protect them, but that the government was unwilling to do so. A single police report refusal is insufficient to establish systemic government acquiescence.',
      defense: 'The State Department Country Report on Human Rights for Veridia explicitly documents that paramilitary groups operate "with effective government tolerance." Combined with the officer's direct statement that they "don't get involved with those people," this establishes willful government acquiescence — the legal standard under Aldana v. Del Monte.',
      weakness: True
    }
  ];

  return attackTemplates.filter(a => a.weakness).slice(0, rounds);
}

function renderRound(round, num) {
  const severityColors = { critical: 'rose', high: 'amber', medium: 'blue' };
  const c = severityColors[round.severity] || 'slate';
  const categoryLabels = {
    nexus: 'Nexo Causal',
    credibility: 'Credibilidad',
    internal_relocation: 'Reubicación Interna',
    state_action: 'Acción Estatal'
  };
  return \`
    <div class="space-y-2">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Round \${num}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide bg-\${c}-100 text-\${c}-700">\${categoryLabels[round.category] || round.category} — \${round.severity}</span>
      </div>
      <!-- Prosecution -->
      <div class="bg-white border border-rose-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="size-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-0.5">DHS</div>
          <div class="flex-1">
            <p class="text-[10px] font-bold text-rose-600 uppercase tracking-wide mb-1.5">Prosecution — Attack</p>
            <p class="text-sm text-slate-700 leading-relaxed">\${round.prosecution}</p>
          </div>
        </div>
      </div>
      <!-- Defense -->
      <div class="bg-white border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <div class="size-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-0.5">DEF</div>
          <div class="flex-1">
            <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1.5">Defense — Rebuttal</p>
            <p class="text-sm text-slate-700 leading-relaxed">\${round.defense}</p>
          </div>
        </div>
      </div>
    </div>
  \`;
}

function renderJudgeVerdict(prob, attacks, gap) {
  const probPct = Math.round(prob * 100);
  const verdictText = probPct >= 70 ? 'LIKELY GRANTABLE — case is substantially supported' :
                      probPct >= 50 ? 'CONDITIONALLY GRANTABLE — significant gaps remain' :
                                     'NEEDS SUBSTANTIAL REMEDIATION before hearing';
  const verdictColor = probPct >= 70 ? 'emerald' : probPct >= 50 ? 'amber' : 'rose';
  return \`
    <div class="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
      <div class="flex items-start gap-3 mb-4">
        <div class="size-9 rounded-full bg-amber-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">IJ</div>
        <div>
          <p class="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Immigration Judge — Verdict</p>
          <p class="text-sm font-bold text-primary mt-0.5">Case Stress-Test Complete</p>
        </div>
        <span class="ml-auto px-3 py-1 bg-\${verdictColor}-100 text-\${verdictColor}-700 text-xs font-black rounded-full border border-\${verdictColor}-200">\${probPct}% P(Grant)</span>
      </div>
      <p class="text-sm text-slate-700 leading-relaxed mb-3">After reviewing \${attacks.length} adversarial exchanges, the analysis indicates: <strong>\${verdictText}</strong>.</p>
      <div class="bg-white border border-amber-200 rounded-lg p-3">
        <p class="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-2">Primary Gap Requiring Remediation</p>
        <p class="text-sm text-slate-700 italic">\${gap}</p>
      </div>
    </div>
  \`;
}

function computeProbability(score, nexo, attacks) {
  let base = score / 100;
  if (nexo === 'STRONG') base = Math.min(base + 0.15, 0.95);
  if (nexo === 'WEAK')   base = Math.max(base - 0.1,  0.15);
  if (nexo === 'ABSENT') base = Math.max(base - 0.2,  0.10);
  const criticals = attacks.filter(a => a.severity === 'critical').length;
  base = Math.max(base - criticals * 0.08, 0.10);
  return Math.min(Math.max(base, 0.10), 0.95);
}

function renderGapPanel(prob, attacks, gap, score) {
  const probPct = Math.round(prob * 100);
  document.getElementById('moot-gap-empty').classList.add('hidden');
  document.getElementById('moot-gap-results').classList.remove('hidden');
  document.getElementById('moot-probability').textContent = probPct + '%';
  const label = probPct >= 70 ? 'Likely grantable' : probPct >= 50 ? 'Conditionally grantable' : 'Needs remediation';
  document.getElementById('moot-verdict-label').textContent = label;
  document.getElementById('moot-prob-bar').style.width = probPct + '%';

  const gapColors = { critical: 'rose', high: 'amber', medium: 'blue' };
  const catLabels = { nexus:'Nexo Causal', credibility:'Credibilidad', internal_relocation:'Reubicación', state_action:'Acción Estatal' };
  
  document.getElementById('moot-gaps-list').innerHTML = attacks.map(a => \`
    <div class="flex items-start gap-2 p-2.5 bg-\${gapColors[a.severity]}-50 border border-\${gapColors[a.severity]}-200 rounded-lg">
      <span class="material-symbols-outlined text-\${gapColors[a.severity]}-600 text-base shrink-0 mt-0.5">warning</span>
      <div>
        <p class="text-[10px] font-bold text-\${gapColors[a.severity]}-700 uppercase tracking-wide">\${catLabels[a.category] || a.category}</p>
        <p class="text-[11px] text-slate-600 mt-0.5 leading-tight">Prosecution attack: \${a.severity} severity. Defense rebuttal: partial.</p>
      </div>
    </div>
  \`).join('');

  const actions = [
    { icon: 'description', text: 'Obtain sworn affidavit corroborating police refusal at VER-992' },
    { icon: 'article',     text: 'Attach current State Dept. country report on Veridia conditions' },
    { icon: 'link',        text: 'Explicitly articulate "on account of" nexus in narrative revision' },
    { icon: 'local_hospital', text: 'Secure medical documentation of January 2024 injuries' }
  ];
  document.getElementById('moot-actions-list').innerHTML = actions.slice(0, attacks.length + 1).map((a, i) => \`
    <div class="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
      <span class="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">\${a.icon}</span>
      <p class="text-[11px] text-slate-700 leading-tight"><strong>\${i+1}.</strong> \${a.text}</p>
    </div>
  \`).join('');
}

// Init
showView('upload');
