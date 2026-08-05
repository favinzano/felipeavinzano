# Demo en vivo — Caso wow + paso a paso
## Sesión: "Build a proactive agent workflow with AI" · jue 6 ago, 8:00 PM EST

> **Objetivo del demo:** que la audiencia *vea* —en tiempo real— un agente que trabaja **antes** de que se lo pidan. No una demo de juguete: un flujo que detecta, decide y actúa solo, mapeado a tu arquitectura **disparador → contexto → decisión → acción**. Y que el momento wow abra, sin esfuerzo, el puente al Bootcamp.

---

## 1. El caso wow — "El Centinela de Bandeja"

Un agente que **vigila una bandeja de entrada** (o un formulario de leads), y ante cada mensaje nuevo:
1. Lee el contenido y quién lo envía.
2. Decide si es urgente / qué tipo de acción requiere.
3. **Redacta el borrador de respuesta** ya listo.
4. Si es urgente, **te avisa al teléfono** (Telegram/Slack) con un resumen de una línea + el borrador para enviar con un toque.

**El pitch en una frase:** *"Mientras tú duermes o estás en otra reunión, este agente ya leyó, ya clasificó y ya escribió la respuesta. Tú solo apruebas."*

### Por qué es el caso correcto para ESTA sesión
- **Universal:** todos sufren la bandeja de entrada. La audiencia se ve reflejada al instante.
- **Es la tesis de la campaña, hecha visible:** un chatbot espera tu prompt; este agente actúa *antes*. El demo *es* el argumento.
- **Loop cerrado en tiempo real:** entra un mensaje → segundos después vibra tu teléfono con la respuesta escrita. Ahí está el wow.
- **Mapea 1:1 a tu arquitectura** (lo usas para enseñar mientras construyes).
- **Sin código y construible en vivo** en ~15 min.

### Cómo mapea a los 4 componentes (tu hilo conductor)
| Componente | En este agente |
|---|---|
| **Disparador** | Llega un mensaje nuevo (email o formulario). |
| **Contexto** | El texto del mensaje + remitente + tus reglas de negocio (qué cuenta como "urgente"). |
| **Decisión** | El modelo clasifica: urgente / normal / ignorar, y define el tono de la respuesta. |
| **Acción** | Redacta el borrador + si es urgente, dispara la alerta al teléfono. |

---

## 2. El momento wow — coreografía exacta

El wow no se explica, se **provoca en vivo**. Guion del momento (≈60 segundos):

1. Ya tienes el agente activo (lo acabas de construir en pantalla).
2. Dices: *"Vamos a probarlo con alguien real. ¿Quién me manda un mensaje ahora mismo?"* — y compartes en pantalla la dirección/el formulario.
3. Un asistente (o tu co-host "sembrado", como plan seguro) envía: asunto **"urgente"**, cuerpo *"Necesito la propuesta hoy, ¿me la pasas?"*.
4. Callas 10 segundos. Miras el canvas: el flujo se ejecuta nodo por nodo en vivo (verde, verde, verde).
5. **Tu teléfono vibra** (mostrado en pantalla vía Slack de escritorio, o el celular espejeado, o a cámara). Lees en voz alta la alerta:
   > 🔴 *URGENTE — [Nombre] pide la propuesta hoy. Borrador listo 👇*
   > *"Hola [Nombre], claro. Te comparto la propuesta hoy mismo antes de las 6 PM…"*
6. Cierre del momento: *"No le pedí nada. Ya leyó, ya decidió que era urgente, y ya escribió la respuesta. Eso es un agente proactivo."*

> **Regla de oro:** ten SIEMPRE un asistente cómplice listo para mandar el mensaje "urgente" en el segundo justo, aunque también invites a la audiencia. Nunca dependas de que un desconocido lo haga a tiempo.

---

## 3. Stack sin código

| Pieza | Recomendado | Alternativa |
|---|---|---|
| **Orquestador** | **n8n** (visual, tiene nodo *AI Agent* nativo, se ve "agente") | Make.com (aún más fácil para principiantes) |
| **Cerebro (LLM)** | OpenAI GPT‑4o o Claude (vía API) | Cualquiera con API; costo por corrida ≈ centavos |
| **Disparador** | Gmail Trigger *(narrativa "bandeja")* **o** formulario Tally/Typeform *(webhook instantáneo, más confiable en vivo)* | IMAP genérico |
| **Alerta al teléfono** | **Telegram** (bot gratis, se ve la notificación en el cel) | Slack (fácil de mostrar en pantalla de escritorio) |

**Recomendación para minimizar riesgo en vivo:** usa **n8n + formulario (Tally) como disparador + Telegram** para la alerta. El webhook del formulario dispara al instante (sin el retraso de polling de Gmail), y Telegram da el "vibró el teléfono" perfecto. Si prefieres la narrativa pura de "bandeja de entrada", usa Gmail Trigger con sondeo cada 1 min y cronometra el mensaje del cómplice ~40 s antes del reveal.

---

## 4. Paso a paso del build (en vivo, ~15 min)

Construye los 4 nodos **hablando cada uno como un componente de la arquitectura**. Así enseñas mientras armas.

### Paso 0 — Pre-vuelo (ya hecho antes de la sesión)
- Cuenta n8n (cloud o local) abierta y logueada.
- API key de OpenAI/Claude cargada como credencial en n8n.
- Bot de Telegram creado con **@BotFather** → token guardado como credencial; `chat_id` tuyo obtenido (mándale un mensaje al bot y léelo con getUpdates).
- Formulario Tally con 2 campos (nombre, mensaje) y su webhook copiado, **o** Gmail conectado.
- **Un flujo idéntico ya construido y probado en una pestaña oculta** (plan B, ver §6).

### Paso 1 — Disparador *(“qué lo despierta”)*
- n8n → nodo **Webhook** (si usas formulario) o **Gmail Trigger** (si usas bandeja).
- Formulario: pega la URL del webhook de n8n en Tally. Envía una prueba → verás llegar el payload.
- **Frase:** *"Primero, el disparador. El agente no hace nada hasta que pasa algo en el mundo real. Aquí, alguien manda un mensaje."*

### Paso 2 — Contexto *(“qué necesita saber para no equivocarse”)*
- Nodo **Set / Edit Fields**: mapea `nombre`, `mensaje`, `remitente` a variables limpias.
- **Frase:** *"El contexto. Sin esto, el agente responde en el vacío. Le damos quién escribe y qué dice — y en un caso real, también tus reglas de negocio."*

### Paso 3 — Decisión + redacción *(“actúo / no actúo, y cómo”)*
- Nodo **OpenAI / AI Agent** (Message → model, output en JSON).
- **System prompt (cópialo tal cual):**
  ```
  Eres el asistente de bandeja de [Felipe / la empresa]. Recibes un mensaje entrante.
  Devuelve SOLO un JSON con estas claves:
  {
    "urgencia": "alta" | "media" | "baja",
    "categoria": "venta" | "soporte" | "interno" | "spam",
    "resumen": "una frase de máximo 12 palabras",
    "borrador": "respuesta lista para enviar, tono profesional y cálido, en español, máx 4 líneas"
  }
  Reglas: 'urgencia alta' solo si el mensaje pide algo para hoy, menciona un problema
  que bloquea, o viene de un cliente esperando. No inventes datos que no estén en el mensaje.
  ```
- **Frase:** *"Aquí está la decisión. No es magia: es criterio codificado. Le dijimos qué es urgente para el negocio. El modelo clasifica y, de una vez, escribe la respuesta."*

### Paso 4 — Acción *(“qué ejecuta, y con qué límites”)*
- Nodo **IF**: ¿`urgencia == "alta"`?
  - **Sí →** nodo **Telegram** (Send Message) a tu `chat_id`:
    ```
    🔴 URGENTE — {{resumen}}

    Borrador listo 👇
    {{borrador}}
    ```
  - **No →** nodo Gmail "Create Draft" (guarda el borrador sin molestarte) — o simplemente lo registra.
- **Frase:** *"Y la acción. Ojo con el límite que le pusimos: lo urgente te interrumpe en el teléfono; lo demás lo deja como borrador y no te distrae. Un buen agente sabe cuándo NO actuar."*

### Paso 5 — Activar y probar
- Pon el flujo en **Active** (o Execute en modo escucha).
- → Pasa al **momento wow** (§2).

---

## 5. Guion del demo, minuto a minuto (~18 min dentro de la sesión)

| Min | Qué haces | Qué dices (idea) |
|---|---|---|
| 0–2 | Planteas el dolor | "Todos abrimos el mail y ya vamos tarde. ¿Y si alguien ya lo hubiera leído y contestado por ti?" |
| 2–4 | Muestras el lienzo vacío | "No voy a mostrarte 10 apps. Voy a mostrarte una arquitectura: disparador, contexto, decisión, acción." |
| 4–14 | Construyes los 4 nodos (§4) | Una frase por componente, atando cada uno a la arquitectura. |
| 14–15 | Activas | "Está vivo. No le he pedido nada aún." |
| 15–16 | **Momento wow** (§2) | Provocas el mensaje y dejas que vibre el teléfono. |
| 16–18 | Cierras el bucle | "Esto es UN proceso. Tu operación tiene 20 así. Ahí es donde esto deja de ser un truco y se vuelve un sistema." → **puente al upsell**. |

---

## 6. Plan B — a prueba de fallos

En vivo, algo falla. Prepara esto y no sudas:

- **Flujo espejo pre-construido y probado** en otra pestaña: si el build en vivo se traba, cambias de pestaña y ejecutas el que ya funciona ("aquí está el mismo, ya activo").
- **Cómplice sembrado** para el mensaje "urgente" (nunca dependas del público).
- **Screenshot / video de 20 s** del resultado (la alerta en el teléfono), listo para mostrar si la red muere.
- **Datos de prueba fijos**: un mensaje "urgente" y uno "normal" ya escritos para copiar-pegar.
- **API con saldo verificado** esa misma tarde (una corrida cuesta centavos, pero una key sin saldo mata el demo).
- **Zoom:** comparte *pantalla específica*, no toda; ten el navegador a 125% para que se lea; silencia notificaciones ajenas.
- **Ensaya el build completo 2 veces** cronometrado antes del jueves.

---

## 7. Checklist pre-vuelo

- [ ] Cuenta n8n (o Make) lista y logueada.
- [ ] Credencial de OpenAI/Claude cargada y con **saldo verificado hoy**.
- [ ] Bot de Telegram creado (@BotFather), token + `chat_id` guardados y probados.
- [ ] Formulario Tally (o Gmail) conectado; webhook probado de punta a punta.
- [ ] Flujo espejo construido, activo y probado (plan B).
- [ ] Cómplice briefeado para mandar el mensaje "urgente" en el momento.
- [ ] Backup: screenshot/video de la alerta.
- [ ] Ensayo cronometrado ×2.
- [ ] Notificaciones del sistema silenciadas; navegador a 125%.

---

## 8. Caso alterno — "Vigía de Leads" (si quieres sabor B2B/ventas)

Misma arquitectura, disparador = **formulario de contacto/lead**:
- **Disparador:** nuevo lead entra al formulario.
- **Contexto:** respuestas del lead (+ enriquecimiento opcional: dominio, empresa).
- **Decisión:** puntúa **caliente / tibio / frío** según reglas.
- **Acción:** si es caliente → borrador de respuesta personalizada + alerta a ventas: *"🔥 Lead caliente: [nombre], [empresa] — borrador listo, ¿lo envío?"*

Ventaja: el webhook del formulario dispara **al instante** (el más confiable en vivo) y es oro para tu audiencia B2B. Desventaja: menos universal que la bandeja para un público mixto. Elige según quién se conecte.

---

## 9. El puente al upsell (desde el wow, sin fricción)

El demo hace el trabajo de venta solo. En el minuto 16–18:

> *"Lo que acabas de ver es UN proceso, atendido por UN agente. Tu operación tiene decenas: cobranza, seguimiento, reportes, onboarding. Diseñar cada uno con criterio —dónde sí, dónde no, con qué límites— es exactamente lo que hacemos, paso a paso, en el **Bootcamp AI: Zero to Pro** (US$257.00). Ocho sesiones en vivo, de cero a tus propios sistemas. El link está en el chat."*

Reversión de riesgo: *"La sesión de hoy te dio valor completo, compres o no. Si te encajó, el siguiente paso está en el link. Sin prisa artificial."*
