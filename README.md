[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status: WIP](https://img.shields.io/badge/status-WIP-orange.svg)](#roadmap)
<a href="https://www.anthropic.com/claude" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Built%20with-Claude%20Opus%204.7-D97757?logo=anthropic&logoColor=white" alt="Built with Claude Opus 4.7"></a>
<a href="https://cerebralvalley.ai/e/built-with-4-7-hackathon" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Hackathon-Cerebral%20Valley-7B61FF" alt="Hackathon: Cerebral Valley"></a>
<a href="https://web.dev/progressive-web-apps/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white" alt="PWA"></a>
<a href="https://appra.netlify.app/" target="_blank" rel="noopener noreferrer"><img src="https://api.netlify.com/api/v1/badges/c73dbfa1-e7ad-4e5e-a743-65f2eaf63972/deploy-status" alt="Netlify Status"></a>

# APPRA — Asistente de RAs y CEs para FP

PWA educativa para profesores y alumnos de Formación Profesional (FP) en España. Gestiona y consulta los Resultados de Aprendizaje (RAs) y Criterios de Evaluación (CEs) de los módulos de la familia de Informática, con un asistente IA basado en Claude Opus 4.7 para resolver dudas en tiempo real.

**Demo en vivo:** https://appra.netlify.app/

---

## ¿Qué problema resuelve?

La normativa educativa de FP define cada módulo mediante un conjunto de **Resultados de Aprendizaje (RAs)** y **Criterios de Evaluación (CEs)** publicados en el BOE y los boletines autonómicos (BOCM en Madrid). Profesores, alumnos y familias necesitan acceder a esta información para:

- **Profesores:** estructurar la programación didáctica, llevar el seguimiento del avance del curso, evaluar.
- **Alumnos:** entender qué van a aprender, en qué se les va a evaluar, qué nivel se les exige.
- **Familias:** comprender los contenidos del ciclo y el progreso de sus hijos.

APPRA centraliza esta información, la hace accesible desde cualquier dispositivo (PWA offline) y añade un asistente IA que responde dudas adaptando la respuesta al rol del usuario.

---

## Hackathon — Built with Opus 4.7

Proyecto presentado al hackathon **Built with Opus 4.7** organizado por [Cerebral Valley](https://cerebralvalley.ai/e/built-with-4-7-hackathon) en abril de 2026.

- **Modelo:** Claude Opus 4.7 (`claude-opus-4-7`)
- **Repositorio:** [github.com/joanh/APPRA](https://github.com/joanh/APPRA) — Open Source ([MIT](LICENSE))
- **Demo:** [appra.netlify.app](https://appra.netlify.app/)

### Por qué encaja en el hackathon

APPRA es un caso de uso real de Claude aplicado a la **educación pública española**: extrae datos de documentos oficiales (PDFs del BOE/BOCM), los estructura como JSON consultable, y ofrece un asistente conversacional que adapta sus respuestas al rol del usuario (profesor, alumno, familia). El propio proceso de extracción de los datos curriculares se realiza con Claude Opus 4.7, así que el ciclo es coherente: Claude genera los datos, Claude los consume.

---

## Características

- **Página de portada (landing):** logo, intro y selector de módulo. La app no carga ningún módulo hasta que el usuario lo elige; "Página Inicio" siempre vuelve aquí.
- **Selector dinámico de módulo:** la web se auto-personaliza según el módulo elegido (título, imagen, RAs, CEs, pesos, descripciones).
- **Datos auténticos del BOE:** los RAs y CEs se extraen de los Reales Decretos oficiales del BOE con Claude Opus 4.7 (`scripts/extraer-modulos.js`), no se redactan manualmente. El proceso es reproducible y auditable.
- **Asistente IA multi-rol** _(en desarrollo)_: chatbot con Claude Opus 4.7 que adapta sus respuestas según el rol (profesor, alumno, familia).
- **Seguimiento de progreso:** estados visuales (No iniciado / En progreso / Completado) con barra de progreso global ponderada. El estado de cada módulo se guarda independientemente en `localStorage` (`ceStates_<moduleId>`), así cambiar de módulo no pisa el progreso.
- **Búsqueda y filtrado:** búsqueda por texto en CEs, filtro por RA, sugerencias dinámicas (los términos más frecuentes se recalculan por módulo).
- **Exportación múltiple:** JSON y CSV con etiquetas en español (Pendiente / En Progreso / Completado). PDF y DOCX en el roadmap.
- **Modo profesor — estado oficial del curso:** el admin (`joanh`) puede guardar el estado en el repo de GitHub vía Netlify Function. Lectura pública para el resto.
- **Diálogos unificados:** todos los avisos, confirmaciones y prompts usan SweetAlert2 con tema oscuro coherente.
- **PWA** _(parcial)_: manifest + iconos. Service worker en el roadmap.
- **Accesibilidad y responsive:** dark mode, navegable por teclado, adaptado a móvil y escritorio.

---

## Cómo probar la app

### Sin instalar nada — desde el navegador

1. Abre [https://appra.netlify.app/](https://appra.netlify.app/). Aterrizas en la **portada**: logo APPRA, intro y un único selector de módulo en el centro.
2. **Elige un módulo** del desplegable. La página se transforma: aparece el título del módulo, su imagen propia y todas las tarjetas de RAs con sus CEs literales del BOE.
3. **Despliega un RA** haciendo click en su cabecera para ver la tabla de CEs (descripción, peso e icono FCT cuando aplique).
4. **Marca tu progreso** clicando en el botón *No iniciado* → cicla a *En progreso* → *Completado*. La barra global se actualiza ponderada por pesos. Cada estado se guarda en `localStorage` namespaceado por módulo (`ceStates_<id>`), así que cambiar de módulo y volver mantiene tu progreso.
5. **Busca CEs** desde el cuadro de búsqueda. Al hacer click en el input aparecen *chips* con los términos más frecuentes — específicos del módulo activo (los términos de DWEC son distintos de los de SAD).
6. **Carga el Estado Oficial** desde el panel del profesor para ver el avance publicado por el docente del curso.
7. **Cambia de módulo** desde el selector cuando quieras, o vuelve a la portada con *Página Inicio* en el menú lateral / móvil.
8. **Exporta tu progreso** a JSON o CSV (etiquetas en español: Pendiente / En Progreso / Completado).

### Modo profesor (admin)

Para publicar el estado oficial del curso necesitas la contraseña que el admin configuró como `ADMIN_PASSWORD` en Netlify:

1. Sobre un módulo, marca el avance real del curso (qué CEs se han trabajado, en qué punto están).
2. Click en *Guardar Estado Oficial* → introduce la contraseña en el SweetAlert.
3. Si es correcta, aparece un commit nuevo en [`joanh/APPRA`](https://github.com/joanh/APPRA/commits/main) bajo `JSON/oficiales/<moduleId>.json`.
4. La contraseña se cachea en `sessionStorage` — no se te volverá a pedir mientras la pestaña esté abierta.
5. Si la contraseña ha rotado entre sesiones, la siguiente acción de guardado devolverá *401* y limpiará la caché automáticamente.

### Atajos útiles

| Acción | Dónde |
|---|---|
| Volver a la portada | *Página Inicio* en el sidebar / *Inicio* en navbar móvil |
| Resetear el progreso del módulo actual | Panel del profesor → *Reset* (solo borra `localStorage`, no toca el estado oficial) |
| Expandir / colapsar todos los RAs | Botón *Expandir todos* sobre el listado |
| Limpiar la búsqueda | Click en la *X* dentro del input |

### Edge cases que te puedes encontrar

- **"Sin estado oficial"** al cargar → ese módulo aún no tiene `JSON/oficiales/<id>.json` publicado por el profesor. Es informativo, no un fallo.
- **"Selecciona un módulo"** al guardar/cargar → estás en la portada; elige un módulo desde el selector primero.
- **"Sesión expirada"** al guardar → la contraseña ha cambiado en Netlify; pulsa *Guardar* otra vez para introducir la nueva.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript vanilla (sin frameworks) |
| Backend serverless | Netlify Functions (Node.js) |
| IA | Anthropic Claude API — `claude-opus-4-7` |
| Almacenamiento | localStorage (cliente) + GitHub API (estado oficial del curso) |
| Despliegue | Netlify |
| PWA | Manifest + Service Worker (en desarrollo) |
| Animación | particles.js |
| UI utilitaria | W3.CSS, Font Awesome 6, SweetAlert2 |

**Decisión de diseño:** sin frameworks frontend. El proyecto debe ser auditable, ligero, y aprendible por estudiantes de FP que están justamente aprendiendo HTML, CSS y JavaScript vanilla. Es coherente con su misión educativa.

---

## Arquitectura

```
┌───────────────────────┐         ┌────────────────────────┐
│      Cliente PWA      │         │    Netlify Functions   │
│                       │         │                        │
│  index.html           │ ◄─────► │  validateAdmin.js      │
│  js/raManager.js      │  HTTPS  │  saveState.js          │
│  js/chatWidget.js     │         │  chatbot.mjs           │
│  JSON/modulos/*.json  │         │                        │
│  localStorage         │         │                        │
└───────────────────────┘         └────────────────────────┘
                                            │
                                            ▼
                                  ┌────────────────────────┐
                                  │   Servicios externos   │
                                  │                        │
                                  │  Anthropic Claude API  │
                                  │  GitHub API            │
                                  └────────────────────────┘
```

Los datos curriculares (`JSON/modulos/*.json`) son la fuente de verdad: se cargan dinámicamente al cambiar de módulo y se sincronizan con el estado del usuario (localStorage). El estado oficial del profesor se persiste vía GitHub API (commits sobre `official-state.json`).

---

## Estructura del proyecto

```
APPRA/
├── index.html                       Página principal (landing + vista módulo)
├── site.webmanifest                 Manifest PWA + iconos
├── netlify.toml                     Configuración Netlify + headers de seguridad
│
├── .Docs/                           PDFs oficiales fuente (BOE / BOCM)
│
├── css/
│   ├── styles.css                   Estilos (dark mode, landing/módulo)
│   └── search-suggestions.css       Sugerencias del buscador
│
├── js/
│   ├── script.js                    Bootstrap + admin + UI global
│   ├── constants.js                 Configuración (partículas, etc.)
│   ├── search-suggestions.js        Chips de términos frecuentes (dinámicos)
│   └── modules/
│       ├── raManager.js             Render de RAs/CEs + estado por módulo
│       └── moduleLoader.js          Selector + carga JSON + landing/módulo
│
├── netlify/functions/
│   ├── validateAdmin.js             Valida la contraseña admin contra ADMIN_PASSWORD
│   ├── saveState.js                 Guarda estado oficial por módulo (commit a GitHub)
│   └── chatbot.mjs                  Chatbot multi-rol con Claude Opus 4.7 (streaming SSE)
│
├── scripts/
│   ├── extraer-modulos.js           Extrae RAs/CEs de los PDFs con Claude
│   └── verificar-pdfs.js            Sanity check: módulos por PDF
│
├── JSON/
│   ├── modulos/
│   │   ├── modulos.json             Índice de módulos (id, nombre, imagen, ...)
│   │   └── <id>.json                RAs y CEs de cada módulo
│   └── oficiales/
│       └── <id>.json                Estado oficial publicado por el profesor
│
├── icon/, img/                      Recursos gráficos
├── lib/                             Librerías externas (particles.js)
└── prompts/                         Logs de sesiones con Claude (gitignored)
```

---

## Datos de los módulos

Los datos de cada módulo se extraen de **fuentes oficiales**:

- **BOE** (Real Decreto que establece el título y enseñanzas mínimas)
- **BOCM** (Decreto autonómico de Madrid que desarrolla el currículo)
- **Documentación de la Consejería de Educación** de la Comunidad de Madrid

El proceso de extracción se realiza con **Claude Opus 4.7**, parseando los PDFs oficiales y generando los JSONs estructurados.

### Módulos extraídos

| ID | Módulo | Curso | RAs | CEs | Fuente |
|---|---|---|---|---|---|
| `2daw-dwec` | Desarrollo Web en Entorno Cliente | 2º DAW | 7 | 56 | RD 686/2010 (BOE) |
| `1daw-ed` | Entornos de Desarrollo | 1º DAW | 6 | 43 | RD 686/2010 (BOE) |
| `2asir-sad` | Seguridad y Alta Disponibilidad | 2º ASIR | 7 | 58 | RD 1629/2009 (BOE) |

> **Nota sobre fuentes:** los Reales Decretos del BOE definen los RAs y CEs (válidos para todo el Estado). El Decreto autonómico (BOCM en Madrid) solo amplía las horas y los contenidos didácticos, sin redefinir RAs/CEs. Por eso APPRA toma los RAs/CEs del BOE y, en una iteración futura, podrá superponer las horas autonómicas correspondientes.

### Esquema de un módulo

```json
{
  "id": "2daw-dwec",
  "nombre": "Desarrollo Web en Entorno Cliente",
  "abreviatura": "DWEC",
  "curso": "2º DAW",
  "ciclo": "Desarrollo de Aplicaciones Web",
  "familia": "Informática y Comunicaciones",
  "grado": "Superior",
  "horas": 80,
  "descripcionBreve": "...",
  "resultadosAprendizaje": [
    {
      "id": "ra1",
      "numero": 1,
      "peso": 16,
      "descripcion": "...",
      "criteriosEvaluacion": [
        {
          "id": "1a",
          "descripcion": "...",
          "peso": 20,
          "ffe": false
        }
      ]
    }
  ]
}
```

El **índice** (`JSON/modulos/modulos.json`) es ligero, solo lo necesario para el selector e identificar la imagen de cada módulo:

```json
[
  { "id": "2daw-dwec", "nombre": "...", "abreviatura": "DWEC",
    "curso": "2º DAW", "ciclo": "...", "imagen": "img/portada.png" }
]
```

**Convenciones del esquema:**

- `peso` de RAs suma 100 dentro del módulo (distribución equitativa por defecto, ajustable).
- `peso` de CEs suma 100 dentro del RA.
- `ffe: true` marca criterios vinculados a la Formación en Centro de Trabajo (FCT) — se renderizan con un icono distintivo.
- El `id` del CE (`"1a"`, `"7i"`...) es la clave que se usa en `localStorage` (`ceStates_<moduleId>[ceId]`) y en `JSON/oficiales/<id>.json`.

---

## Ejecución local

### Requisitos

- Node.js 18+
- (Para el extractor) cuenta en Anthropic con clave API
- (Para servir las Netlify Functions en local) Netlify CLI (`npm install -g netlify-cli`)

### Variables de entorno (`.env`)

```bash
# Para el chatbot (servidor) y para regenerar los JSONs con scripts/extraer-modulos.js
ANTHROPIC_API_KEY=sk-ant-...

# Solo si quieres probar el modo profesor en local (Netlify Functions)
GITHUB_TOKEN=ghp_...
ADMIN_PASSWORD=lo-que-elijas
```

> En producción, estas variables viven como *Environment variables* en Netlify.
> Nunca commitees el `.env` — está gitignored.

### Arrancar el entorno

```bash
git clone https://github.com/joanh/APPRA.git
cd APPRA
npm install                 # solo si vas a usar el extractor
netlify dev                 # http://localhost:8888 con Netlify Functions
# alternativamente, si solo quieres ver el frontend:
python -m http.server 8000  # http://localhost:8000 (sin functions)
```

### Regenerar los JSONs de los módulos

```bash
npm run extraer-modulos
```

Esto lee los PDFs de `.Docs/`, llama a Claude Opus 4.7 con el `output_config.format: json_schema` para forzar respuestas estructuradas, y escribe los JSONs en `JSON/modulos/`. Hace caché del PDF (`cache_control: ephemeral`) cuando se extraen varios módulos del mismo documento, para abaratar coste.

---

## Modo profesor — Estado oficial del curso

El profesor puede **publicar** un estado oficial (qué CEs ha cubierto el curso, qué nivel se ha alcanzado, etc.) que el resto de usuarios puede **cargar**. Por debajo, esto se persiste como un commit en el repositorio (`JSON/oficiales/<moduleId>.json`).

### Diseño elegido (Opción B — token en servidor + contraseña corta)

- El **PAT de GitHub** vive como variable de entorno en Netlify (`GITHUB_TOKEN`). El usuario nunca lo ve.
- El admin se autentica introduciendo una **contraseña corta** que se compara contra `ADMIN_PASSWORD` (otra env var).
- La Netlify Function actúa como relé: si la contraseña coincide, hace el commit a GitHub usando el token del servidor.
- La contraseña se cachea en `sessionStorage` durante la sesión de la pestaña — el admin la introduce una vez y se reutiliza para sucesivos guardados.
- Cualquier usuario puede **cargar** el estado oficial sin contraseña (es lectura pública del JSON).

✅ **Ventajas:** UX cómoda (contraseña corta, una vez por sesión) · token GitHub nunca expuesto al cliente · ideal para demos en hackathon.

⚠️ **A tener en cuenta:** hay un secreto que custodiar en Netlify (`ADMIN_PASSWORD`). Si se filtra, hay que rotarlo y redeploy.

### Setup en Netlify (admin, una sola vez)

1. **Crear un PAT classic** en [GitHub → Settings → Developer settings → Personal access tokens (classic)](https://github.com/settings/tokens/new):
   - *Note:* `APPRA - Netlify State Manager`
   - *Expiration:* 90 days
   - *Scopes:* `repo` (basta para escribir)
   - *Generate token* → copiar el `ghp_...` a un gestor de contraseñas

2. **Añadir variables de entorno** en Netlify (*Site settings → Environment variables*):
   - `GITHUB_TOKEN` = el `ghp_...` que acabas de generar
   - `ADMIN_PASSWORD` = una contraseña memorable (única, mínimo 8 caracteres)

3. **Redeploy** del sitio (basta con un `git push` o un *Deploy → Trigger deploy*) para que las nuevas env vars cojan efecto.

### Flujo de uso

| Acción | Quién | Auth |
|---|---|---|
| Cargar estado oficial | Cualquier usuario | Pública (lectura del JSON) |
| Guardar estado oficial | Admin | Contraseña → cachée en `sessionStorage` |

### Rotar / revocar credenciales

- **PAT GitHub:** desde [tu lista de tokens](https://github.com/settings/tokens). Tras rotar, actualiza `GITHUB_TOKEN` en Netlify y redeploy.
- **Contraseña admin:** cambia `ADMIN_PASSWORD` en Netlify y redeploy. Las pestañas con sessionStorage cacheada empezarán a recibir 401 y se limpiarán solas pidiendo la nueva.

---

## Roadmap

### Hecho

- [x] Maquetación completa con dark mode
- [x] **Página de portada (landing)** — logo, intro, selector centrado, banner del hackathon
- [x] **Selector dinámico de módulo** — el frontend se auto-personaliza al elegir
- [x] **3 módulos extraídos del BOE** con Claude Opus 4.7: DWEC (2º DAW), ED (1º DAW), SAD (2º ASIR)
- [x] **Hero por módulo** — título + curso/ciclo + imagen propia (`portada.png`, `portada2.png`, `portada3.png`)
- [x] Seguimiento de estados con `localStorage` namespaceado por módulo (`ceStates_<id>`)
- [x] Búsqueda en CEs + chips de términos frecuentes recalculados por módulo
- [x] Exportación a JSON y CSV con etiquetas en español
- [x] Diálogos unificados con SweetAlert2 (alerts, confirms y prompts)
- [x] **Modo profesor — token GitHub en servidor + contraseña admin corta** (Opción B)
- [x] **Asistente IA con Claude Opus 4.7** + system prompts diferenciados por rol (profesor / alumno / familia)
- [x] **Estado oficial por módulo** (`saveState.js` → `JSON/oficiales/<id>.json`)
- [x] Manifest PWA + iconos
- [x] Headers de seguridad

### Pendiente

- [ ] Service Worker (PWA offline real)

### Próximamente

- [ ] Más módulos (resto de DAW, ASIR completo, DAM)
- [ ] Override de horas por comunidad autónoma (Madrid usa BOCM)
- [ ] Exportación a PDF
- [ ] Exportación a DOCX
- [ ] Auditoría WCAG completa
- [ ] Soporte para módulos de otras familias profesionales
- [ ] Soporte para ESO y Bachillerato

---

## Créditos

- **Autor:** Jose Angel Heras ([@joanh](https://github.com/joanh)) — joseaheras@pm.me
- **IA:** [Anthropic Claude Opus 4.7](https://www.anthropic.com/claude) — usado tanto para construir el proyecto como para alimentar el chatbot.
- **Hackathon:** [Built with Opus 4.7 · Cerebral Valley](https://cerebralvalley.ai/e/built-with-4-7-hackathon)
- **Datos curriculares:** BOE, BOCM y Consejería de Educación de la Comunidad de Madrid.

## Licencia

[MIT](LICENSE). Libre uso, modificación y redistribución del código y de los JSON de los módulos. Los Reales Decretos del BOE incluidos en `.Docs/` son legislación española y por tanto dominio público.
