# Demo en vivo — Caso wow + paso a paso
## Sesión: "Build a proactive agent workflow with AI" · jue 6 ago, 8:00 PM EST

> **Alineado al video oficial de Anthropic** ("Build a proactive agent workflow with Claude Code", Code w/ Claude 2026, por Maya). Usamos su **framework y mejores prácticas**, pero **NO su ejemplo** (ellos: leer repo → abrir PR). El nuestro: un **Radar de reuniones**. Todo corre **dentro de Claude Code Routines** — sin n8n, sin infraestructura propia.

---

## 1. El framework del video (nuestro hilo conductor)

Una **Routine** de Claude Code es una configuración guardada — **prompt + repos + conectores + disparador** — que corre **sola en la nube gestionada por Anthropic**. Se crea con el comando **`/schedule`**. Anthropic hostea, mantiene el estado y ejecuta; tú no montas nada.

Detrás de CUALQUIER rutina hay **3 decisiones** (así lo enseña el video):

| Decisión | Pregunta | En nuestro Radar de reuniones |
|---|---|---|
| **Trigger** *(disparador)* | ¿Qué la despierta? | Horario (cada mañana) **y** evento (nueva reunión agendada). |
| **Context** *(contexto)* | ¿Qué puede ver/alcanzar? | Conectores: Google Calendar + Gmail + Slack. |
| **Steering** *(conducción)* | ¿Cómo decide y qué es "listo"? | El prompt: reglas, qué conectores usar, qué es *done*, qué hacer si algo falla. |

> **La clave que repite el video:** la rutina corre **sin aprobación humana en cada paso**, así que **el prompt carga todo el peso**. Un agente proactivo es tan bueno como su *steering*.

---

## 2. El caso wow — "Radar de reuniones"

Le pides a Claude Code, una vez, que **cada mañana laboral a las 7:00**:
1. Lea **tus reuniones de hoy** (conector de Google Calendar).
2. Para cada reunión con externos, busque el **último hilo de correo** con esos asistentes (Gmail).
3. Redacte un **brief de preparación** por reunión: quién es cada quién, objetivo probable, 2 preguntas que deberías hacer.
4. Te lo mande **todo junto a Slack** (o push) antes de tu primer café.

**El pitch en una frase:** *"Antes de que yo despierte, ya alguien revisó mi día, investigó con quién me reúno y me dejó el brief listo. Y yo no le pedí nada hoy — se lo pedí una sola vez."*

### Por qué este caso
- **Confiable en vivo:** el calendario ya tiene datos (no depende de que llegue un correo justo en el momento).
- **Universal:** todos tienen reuniones y todos llegan sin prepararse.
- **Es tu tesis hecha visible:** trabaja *antes* de que abras la laptop.
- **Muestra los dos disparadores** (horario y evento) con naturalidad.

---

## 3. Los dos disparadores (lo que pediste)

**A) Horario — la base (para todo público).**
La rutina se despierta sola cada mañana. Es el concepto más limpio de "proactivo": un reloj que el agente se pone a sí mismo.

**B) Evento / webhook — el nivel avanzado (el wow más fuerte).**
Cuando se **agenda una reunión nueva** (tu sistema de reservas —Calendly/Cal.com— hace un POST al endpoint de la rutina), la rutina corre **al instante** y prepara el brief de ESA reunión. Reaccionar a un evento real, no a un reloj, es lo más impresionante de mostrar.

> El video lista 3 disparadores: **horario, evento de GitHub y webhook/API**. Nosotros usamos horario + webhook (más relevante que GitHub para tu audiencia). Si hubiera devs en la sala, el de GitHub es el bonus del Q&A.

---

## 4. Paso a paso con `/schedule` (en vivo, ~12 min)

### Paso 0 — Pre-vuelo (antes de la sesión)
- Claude Code (web) logueado, con **conectores de Google Calendar, Gmail y Slack** activados.
- Una **cuenta de demo con 2 reuniones HOY** ya sembradas (con asistentes externos y algún hilo de correo previo), para que el brief salga rico.
- Un **repo ligero** para apuntar la rutina (puede ser uno dedicado que contenga una Skill con tu formato de brief — ver §5).
- La **rutina ya creada, activa y probada** una vez con "ejecutar ahora" (plan B, §7).
- Canal de Slack **#mi-dia** listo, y la app de Slack/Claude en el teléfono con notificación.

### Paso 1 — Abre el creador de rutinas
En Claude Code escribe **`/schedule`**. Aparece el formulario: **nombre, instrucciones, disparador (dropdown), repos, conectores.** *Frase:* *"No voy a programar nada en código. Voy a llenar un formulario y a escribir instrucciones en lenguaje natural."*

### Paso 2 — Nombre + disparador *(Trigger)*
- **Nombre:** `Radar de reuniones — brief matutino`.
- **Disparador (dropdown):** elige **Horario** → todos los días L–V, **07:00 America/New_York**.
- *Frase:* *"Este es el disparador. La rutina se despierta sola. Nadie escribe un prompt cada mañana."*

### Paso 3 — Conectores *(Context)* — con mínimo privilegio
- Adjunta **solo** Google Calendar, Gmail y Slack. **Quita todo lo demás.**
- *Frase (best practice del video):* *"Por defecto se incluyen todos los conectores. Mala idea. Le doy exactamente tres — ni uno más. Un agente desatendido con demasiado acceso es un riesgo, no una comodidad."*

### Paso 4 — Instrucciones *(Steering)* — pega esto tal cual
El prompt aplica las 4 mejores prácticas del video: **nombra los conectores exactos, define qué es "done", maneja lo inesperado, y no inventa.**
```
Eres mi jefe de gabinete. Cuando corras:
1) Con Google Calendar, lista MIS reuniones de HOY (zona horaria America/New_York).
2) Para cada reunión con asistentes externos, con Gmail busca el último hilo con
   esos asistentes y resume en qué quedó.
3) Redacta un brief por reunión: hora, quién es cada asistente (cargo/empresa si
   aparece en su firma o en los hilos), el objetivo probable, y 2 preguntas que yo
   debería hacer.

QUÉ ES "DONE": enviar UN solo mensaje por Slack al canal #mi-dia con todos los
briefs. Si no hay reuniones con externos, enviar "Hoy sin reuniones que preparar"
y terminar.

CONECTORES: usa SOLO Google Calendar, Gmail y Slack. Ningún otro.

SI ALGO FALLA (un conector no responde, una reunión sin datos): incluye una línea
"⚠️ No pude preparar [reunión] porque [motivo]" y continúa con las demás. NUNCA
inventes datos que no estén en el calendario o los correos.
```
- *Frase:* *"Aquí está el criterio, el steering. Le digo qué usar, qué significa 'terminado', y qué hacer cuando algo sale mal — porque va a correr sin que yo apruebe cada paso."*

### Paso 5 — Repos + guardar
- Apunta la rutina a tu **repo ligero** (opcional para este caso; útil si guardas ahí una Skill con la plantilla del brief).
- Guarda. **Queda activa.** *Frase:* *"Ya está viva. Mañana a las 7 corre sola, aunque yo esté dormido."*

### Paso 6 — El disparador por evento (nivel avanzado)
- Duplica la rutina; cambia el disparador a **Webhook/API**.
- Conecta el webhook a tu sistema de reservas (Calendly/Cal.com): *"al agendarse una reunión → POST al endpoint → la rutina corre al instante y prepara el brief de esa reunión."*
- *Frase:* *"La primera reacciona al reloj. Esta reacciona a un evento real. En cuanto alguien agenda una reunión conmigo, el brief se prepara solo — sin esperar a mañana."*

---

## 5. Mejores prácticas del video (aplícalas y dilo en voz alta)

- **Mínimo privilegio:** adjunta solo los conectores que la rutina necesita.
- **Define qué es "done":** un mensaje de Slack, un borrador, un issue etiquetado — algo concreto.
- **Nombra los conectores exactos** dentro del prompt (no "usa lo que tengas").
- **Maneja lo inesperado** en el prompt (qué hacer si algo falla; no inventar).
- **Reserva rutinas para trabajo desatendido con valor claro.** Nada de disparadores ruidosos de alta frecuencia salvo que tu plan lo aguante.
- **(Tie-in de marca):** guarda tu formato de brief como una **Skill** en el repo de la rutina — así el "cómo se ve un buen brief" es reutilizable y versionado, no un prompt suelto.

---

## 6. El momento wow — coreografía (≈75 s)

1. Con la rutina ya activa, dices: *"No voy a esperar a mañana. Voy a pedirle que corra ahora."*
2. **Ejecutas la rutina bajo demanda** ("run now"). En pantalla se ve correr en la nube: lee calendario → busca correos → redacta.
3. **Tu teléfono/Slack suena** con el brief del día:
   > 📋 *Tu día — 2 reuniones que preparar*
   > *10:00 — [Nombre], Director de Ops en [Empresa]. Último correo: pidió propuesta. Objetivo: cerrar alcance. Pregunta clave: "¿Qué proceso duele más hoy?"*
4. **El golpe final (evento):** *"Y ahora miren esto."* Tu cómplice **agenda una reunión** en tu Calendly en vivo → segundos después **aparece en Slack** el brief de esa reunión recién creada.
5. Cierre: *"No le pedí nada en el momento. Le di instrucciones una vez. Ahora reacciona a mi reloj y a mis eventos, sola. Eso es un flujo agéntico proactivo."*

> **Regla de oro:** cómplice sembrado para agendar la reunión en el segundo justo. Nunca dependas del público.

---

## 7. Plan B — a prueba de fallos

- **Rutina espejo ya creada, activa y probada** ("run now" funciona) en otra sesión.
- **Cuenta de demo con reuniones y correos ya sembrados** hoy.
- **Screenshot/video de 20 s** del brief en Slack, por si la red muere.
- **Conectores reautenticados esa tarde** (Calendar/Gmail/Slack — los tokens caducan).
- **Endpoint del webhook probado** antes (haz un POST de prueba y verás correr la rutina).
- **Zoom:** comparte pantalla específica, navegador a 125%, silencia otras notificaciones.
- **Ensaya el flujo completo ×2** cronometrado, incluyendo "run now" y la llegada del mensaje.

---

## 8. Checklist pre-vuelo

- [ ] Claude Code (web) logueado; conectores **Calendar + Gmail + Slack** activados y **reautenticados hoy**.
- [ ] Cuenta de demo con **2 reuniones HOY** + hilos de correo sembrados.
- [ ] Canal **#mi-dia** en Slack; push en el teléfono probado.
- [ ] Repo ligero para la rutina (opcional: Skill con la plantilla del brief).
- [ ] Rutina por **horario** creada, activa y probada con "run now" (plan B).
- [ ] Rutina por **webhook** conectada a Calendly y probada con un POST.
- [ ] Cómplice briefeado para agendar la reunión en vivo.
- [ ] Backup: screenshot/video del brief.
- [ ] Ensayo cronometrado ×2.

---

## 9. El puente al upsell (desde el wow, sin fricción)

> *"Lo que viste es UNA rutina, para UN proceso: preparar mis reuniones. Tu operación tiene decenas de procesos así — seguimiento, cobranza, reportes, onboarding — que podrían correr solos, con criterio y con límites. Diseñar cada uno, decidir dónde sí y dónde no, es exactamente lo que hacemos paso a paso en el **Bootcamp AI: Zero to Pro** (US$257.00). Ocho sesiones en vivo, de cero a tus propias rutinas proactivas. El link está en el chat."*

Reversión de riesgo: *"La sesión de hoy te dio valor completo, compres o no. Si te encajó, el siguiente paso está en el link. Sin prisa artificial."*

---

### Notas de honestidad
- **Disponibilidad:** Routines, `/schedule` y los conectores dependen de tu plan de Claude. Verifica **el mismo día** que tu cuenta tenga Routines habilitadas, los tres conectores disponibles y las notificaciones funcionando.
- **En vivo no esperas al horario:** la rutina queda *activa y programada* (eso prueba que es proactiva), pero para el momento wow usas **"run now"** y el **webhook**. Deja claro a la audiencia que el valor real es que corre **sola** después.
- **Fidelidad al video:** tomamos su framework (Trigger · Context · Steering), su mecanismo (Routines / `/schedule` en nube gestionada) y sus 5 mejores prácticas — con un ejemplo propio (Radar de reuniones), no el suyo (repo → PR).
