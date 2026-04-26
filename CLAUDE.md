# APPRA — Asistente de RAs y CEs para FP

## Descripción
PWA educativa para profesores, alumnos y familias de Formación Profesional (FP) en España.
Permite consultar los Resultados de Aprendizaje (RAs) y Criterios de Evaluación (CEs) de los
módulos de la familia de Informática, con un chatbot Claude Opus 4.7 que adapta sus respuestas
al rol del usuario.

## Stack tecnológico
- Frontend: HTML5, CSS3, JavaScript vanilla (sin frameworks)
- UI utilitaria: W3.CSS, Font Awesome 6, SweetAlert2, particles.js
- Backend serverless: Netlify Functions (Node.js)
- IA: Anthropic Claude API (`claude-opus-4-7`) vía `@anthropic-ai/sdk`
- Almacenamiento: localStorage (cliente) + GitHub API (estado oficial del curso)
- Despliegue: Netlify
- Licencia: MIT (Open Source)

## Estructura del proyecto
- `index.html` — landing + vista de módulo
- `css/` — `styles.css`, `search-suggestions.css`
- `js/` — `script.js`, `constants.js`, `search-suggestions.js` + `js/modules/` (`raManager`, `moduleLoader`, `chatWidget`)
- `netlify/functions/` — `validateAdmin.js`, `saveState.js`, `chatbot.mjs` (cada función es independiente)
- `JSON/modulos/` — RAs y CEs por módulo (fuente de verdad)
- `JSON/oficiales/` — estado oficial publicado por el profesor (commit-driven)
- `scripts/` — `extraer-modulos.js` (CLI con Claude para regenerar JSONs desde PDFs del BOE)
- `.Docs/` — PDFs oficiales del BOE/BOCM (fuente de los JSONs)
- `img/`, `icon/`, `lib/` — recursos gráficos y `particles.min.js`

## Modo profesor (estado oficial del curso)
- El **PAT de GitHub** vive en `GITHUB_TOKEN` (Netlify env var) — nunca expuesto al cliente.
- El admin se autentica con una contraseña corta validada contra `ADMIN_PASSWORD` (otra env var).
- `saveState.js` actúa como relé: si la contraseña coincide, hace commit a `JSON/oficiales/<moduleId>.json`.
- Cualquier usuario puede leer el estado oficial sin contraseña.

## Convenciones
- Código y comentarios en español (audiencia: FP española)
- Sin frameworks frontend — vanilla JS, coherente con el público que está aprendiendo HTML/CSS/JS
- Cada Netlify Function es independiente; `fetch` nativo donde sea posible. Única dependencia tolerada: SDK oficial de Anthropic.
- Mensajes de commit en español, breves, en imperativo
- Datos de los módulos: literales del BOE, no interpretados
