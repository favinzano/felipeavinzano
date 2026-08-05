# Demo en vivo — Caso wow + paso a paso
## Sesión: "Build a proactive agent workflow with AI" · jue 6 ago, 8:00 PM EST

> **Regla del demo:** el agente corre **únicamente dentro de Claude Code / Cowork o ChatGPT / Codex**. Sin n8n, sin Make, sin orquestadores externos. Nada de "conecta 8 apps". El agente se **crea hablándole a la IA** y luego **se ejecuta solo en un horario** (tarea programada) — esa es la prueba viva de que es *proactivo*: nadie lo dispara a mano.

---

## 1. La idea que hace clic

Un agente proactivo, en estas herramientas, son **tres cosas** que ya viven dentro de Claude Cowork / ChatGPT, sin código:

1. **Un reloj propio** (tarea programada / *scheduled task* / *routine*): la IA se despierta sola cada hora / cada mañana. Ese reloj **es** el disparador. Nadie escribe un prompt cada vez.
2. **Conectores** (Gmail, Calendar, Slack, Drive…): le dan ojos y manos sobre tu mundo real.
3. **Criterio + acción**: la IA lee, decide y actúa (redacta, agenda, te avisa al teléfono).

La frase que lo resume para la audiencia:
> *"No voy a programar nada. Le voy a **decir** a Claude qué vigilar y cada cuándo. A partir de ahí, trabaja solo — aunque yo cierre la laptop."*

---

## 2. El caso wow — "El Centinela de Bandeja"

Le pides a Claude (o ChatGPT) que **cada hora en horario laboral**:
1. Revise los correos nuevos de tu bandeja (vía conector de Gmail).
2. Clasifique urgencia con tus reglas de negocio.
3. **Redacte el borrador de respuesta** de los urgentes.
4. Te mande al teléfono (push / Slack) un resumen de una línea + el borrador listo. Lo no urgente lo deja como borrador y no te interrumpe.

### Por qué es el caso correcto
- **Universal:** todos ahogados en la bandeja. La audiencia se ve reflejada.
- **Es tu tesis, hecha visible:** el agente actúa *antes* de que tú abras el correo.
- **100% dentro de la herramienta:** se crea con una instrucción en lenguaje natural; no hay stack que mostrar.
- **Mapea 1:1 a tu arquitectura** (lo usas para enseñar mientras lo creas).

### Cómo mapea a los 4 componentes
| Componente | En este agente |
|---|---|
| **Disparador** | La **tarea programada** (el reloj propio de Claude/ChatGPT). Se despierta solo. |
| **Contexto** | El **conector de Gmail**: los correos nuevos + remitente + tus reglas de "urgente". |
| **Decisión** | Claude/GPT clasifica urgencia y categoría, y decide si te interrumpe o no. |
| **Acción** | Redacta el borrador + manda la alerta al teléfono (push/Slack). |

---

## 3. Las 3 rutas (elige una; las tres cumplen la regla "sin orquestador")

| Ruta | Herramienta | Para quién | Nivel |
|---|---|---|---|
| **A — Recomendada** | **Claude Cowork / Claude Code** (tarea programada + conectores + notificación push) | Público mixto; máximo "sin código" | Cero técnico |
| **B** | **ChatGPT — Tasks** (tarea programada + conectores) | Quien ya vive en ChatGPT | Cero técnico |
| **C** | **Codex / Claude Code** escribe y corre un mini-agente en código (cron + API) | Audiencia técnica que quiere ver el motor | Técnico |

**Recomendación:** haz el demo con la **Ruta A**. Es la que mejor cuenta la historia "le hablo y trabaja solo", no expone nada técnico, y el disparador (la tarea programada) es exactamente el concepto que quieres enseñar. Deja la Ruta C como bonus para el Q&A si hay devs en la sala.

---

## 4. Paso a paso — Ruta A (Claude Cowork / Claude Code)

### Paso 0 — Pre-vuelo (antes de la sesión)
- Sesión de Claude (Cowork/Code) abierta y logueada.
- **Conector de Gmail activado** (Configuración → Conectores). Opcional: Slack y/o Calendar.
- **App de Claude en el teléfono** con notificaciones push activadas (para el "vibró el teléfono").
- Una **cuenta de correo de demo** con 2 correos de prueba ya redactados para enviar (uno "urgente", uno normal).
- **La tarea ya creada y probada una vez** en una sesión espejo (plan B, §7).

### Paso 1 — Disparador *(“qué lo despierta”)*
Le dices a Claude, en lenguaje natural:
> *"Crea una tarea programada que se ejecute **cada hora en horario laboral (L–V, 9–18 h)**."*

Claude crea la *routine* / tarea programada. **Frase:** *"Esto es el disparador. No es un botón que aprieto: es un reloj que la IA se pone a sí misma. Se despierta sola."*

### Paso 2 — Contexto *(“qué necesita saber”)*
Sigues la instrucción:
> *"…que revise los **correos nuevos de mi Gmail** de las últimas 2 horas: quién escribe y qué dice."*

**Frase:** *"El contexto llega por el conector de Gmail. Sin esto, la IA responde en el vacío. Con esto, ve tu mundo real."*

### Paso 3 — Decisión *(“actúo / no actúo, y cómo”)*
> *"Clasifica cada correo en urgencia **alta/media/baja**. Urgencia alta = pide algo para hoy, un cliente espera, o algo está bloqueado. Para los de urgencia alta, redacta un borrador de respuesta profesional y cálido, máximo 4 líneas, en español. No inventes datos que no estén en el correo."*

**Frase:** *"Aquí está la decisión. No es magia: es criterio de negocio que le dicté. Y de una vez escribe la respuesta."*

### Paso 4 — Acción *(“qué ejecuta, y con qué límites”)*
> *"Para los urgentes: mándame una **notificación** con un resumen de una línea y el borrador listo. Para los no urgentes: guárdalos como borrador en Gmail y **no me interrumpas**."*

**Frase:** *"Y la acción, con su límite: lo urgente me busca al teléfono; lo demás lo deja listo y me deja en paz. Un buen agente sabe cuándo NO actuar."*

### Paso 5 — Activar y probar en vivo
- La tarea queda **activa y programada**. Muéstralo: *"Ya está viva. Se ejecutará sola cada hora — aunque yo cierre esto."*
- Como no vas a esperar una hora en vivo, dile a Claude: **"ejecútala ahora"** (correr bajo demanda). Eso corre el mismo agente al instante para el momento wow.

---

## 5. El momento wow — coreografía exacta (≈60 s)

1. Con la tarea ya activa, dices: *"Vamos a probarla con un correo real, ahora."*
2. Tu cómplice (o tú desde otro dispositivo) envía a la bandeja de demo: asunto **"urgente"**, cuerpo *"Necesito la propuesta hoy, ¿me la pasas?"*.
3. Le dices a Claude **"ejecuta la tarea ahora"** (o esperas el tick si lo tienes afinado).
4. En pantalla, Claude reporta paso a paso: leyó la bandeja → clasificó → redactó.
5. **Tu teléfono vibra** con la notificación (mostrada en pantalla o a cámara):
   > 🔴 *URGENTE — [Nombre] pide la propuesta hoy. Borrador listo 👇*
   > *"Hola [Nombre], claro. Te comparto la propuesta hoy mismo antes de las 6 PM…"*
6. Cierre: *"No le pedí nada. Le dije UNA vez qué vigilar. Ya leyó, decidió que era urgente y escribió la respuesta. Y va a seguir haciéndolo sola cada hora. Eso es un agente proactivo."*

> **Regla de oro:** ten SIEMPRE un cómplice listo para mandar el correo "urgente" en el segundo justo. Nunca dependas de un desconocido.

---

## 6. Ruta B (ChatGPT Tasks) y Ruta C (Codex / código) — resumen

**Ruta B — ChatGPT Tasks:**
- ChatGPT → activa el conector de Gmail → crea una **Task** programada con el mismo texto de los pasos 1–4.
- ChatGPT ejecuta en su horario y te notifica. Mismo guion, misma arquitectura.

**Ruta C — Codex / Claude Code escribe el agente (para técnicos):**
- Le pides a Codex/Claude Code: *"Escribe un agente en Python que cada 10 min consulte la API de Gmail, use el modelo para clasificar y redactar, y me avise por Telegram si hay algo urgente. Déjalo corriendo con un cron aquí."*
- El agente de código **lo escribe y lo corre en su propio entorno**. Muestras el código + el cron (el disparador) + el mensaje que llega. Wow más técnico: "el agente construyó al agente".
- Úsalo solo si la sala es técnica; para público mixto, quédate en A.

---

## 7. Plan B — a prueba de fallos

- **Tarea espejo ya creada, probada y activa** en otra sesión: si el armado en vivo se traba, cambias y ejecutas la que ya funciona.
- **Cómplice sembrado** para el correo "urgente".
- **Screenshot / video de 20 s** de la notificación en el teléfono, listo si la red muere.
- **Conector de Gmail reautenticado esa tarde** (los tokens caducan y matan el demo).
- **Correos de prueba ya escritos** para copiar-pegar.
- **Zoom:** comparte *pantalla específica*, navegador a 125%, silencia otras notificaciones.
- **Ensaya el flujo completo ×2** cronometrado antes del jueves — incluyendo "ejecútala ahora" y la llegada del push.

---

## 8. Checklist pre-vuelo

- [ ] Sesión de Claude Cowork/Code (o ChatGPT) lista y logueada.
- [ ] Conector de Gmail activado y **reautenticado hoy**.
- [ ] App de Claude/ChatGPT en el teléfono con **push activado** y probado.
- [ ] Cuenta de correo de demo + 2 correos de prueba escritos.
- [ ] Tarea programada creada, activa y **probada con "ejecutar ahora"** (plan B).
- [ ] Cómplice briefeado para el correo "urgente".
- [ ] Backup: screenshot/video de la notificación.
- [ ] Ensayo cronometrado ×2.
- [ ] Navegador a 125%; notificaciones ajenas silenciadas.

---

## 9. Caso alterno — "Radar de reuniones" (si prefieres algo aún más limpio en vivo)

Mismo patrón, disparador = **el calendario**:
- **Disparador:** tarea programada cada mañana a las 7:00.
- **Contexto:** conector de Google Calendar (las reuniones de hoy) + Gmail (hilos con esos asistentes).
- **Decisión:** por cada reunión, qué necesitas saber antes de entrar.
- **Acción:** te manda un **brief de preparación** por push/correo, con quién es cada quién y el último contexto.

Ventaja: no depende de que llegue un correo justo en el momento — el calendario ya tiene datos. Muy confiable en vivo y con efecto "trabajó mientras dormías".

---

## 10. El puente al upsell (desde el wow, sin fricción)

> *"Lo que viste es UN agente vigilando UN proceso. Tu operación tiene decenas: cobranza, seguimiento, reportes, onboarding. Diseñar cada uno con criterio —dónde sí, dónde no, con qué límites— es exactamente lo que hacemos, paso a paso, en el **Bootcamp AI: Zero to Pro** (US$257.00). Ocho sesiones en vivo, de cero a tus propios agentes. El link está en el chat."*

Reversión de riesgo: *"La sesión de hoy te dio valor completo, compres o no. Si te encajó, el siguiente paso está en el link. Sin prisa artificial."*

---

### Nota de honestidad para el demo
Los conectores y las tareas programadas dependen del plan de Claude/ChatGPT que tengas activo. Verifica **el mismo día** que tu cuenta tenga: (1) conector de Gmail disponible, (2) tareas programadas / *routines* habilitadas, (3) notificaciones push funcionando. Si tu plan no expone tareas programadas, usa la Ruta C (Codex/Claude Code con cron en su entorno), que no depende de esa función.
