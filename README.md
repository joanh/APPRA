# APPRA — Asistente de RAs y CEs para FP

> **Built with Claude Opus 4.7** · Hackathon [Cerebral Valley](https://cerebralvalley.ai/e/built-with-4-7-hackathon)

PWA educativa para profesores y alumnos de Formación Profesional (FP) en España. Gestiona y consulta los Resultados de Aprendizaje (RAs) y Criterios de Evaluación (CEs) de los módulos de la familia de Informática, con un asistente IA basado en Claude Opus 4.7 para resolver dudas en tiempo real.

**Demo en vivo:** https://appra.netlify.app/ _(despliegue del hackathon, en curso)_

---

## ¿Qué problema resuelve?

La normativa educativa de FP define cada módulo mediante un conjunto de **Resultados de Aprendizaje (RAs)** y **Criterios de Evaluación (CEs)** publicados en el BOE y los boletines autonómicos (BOCM en Madrid). Profesores, alumnos y familias necesitan acceder a esta información para:

- **Profesores:** estructurar la programación didáctica, llevar el seguimiento del avance del curso, evaluar.
- **Alumnos:** entender qué van a aprender, en qué se les va a evaluar, qué nivel se les exige.
- **Familias:** comprender los contenidos del ciclo y el progreso de sus hijos.

APPRA centraliza esta información, la hace accesible desde cualquier dispositivo (PWA offline) y añade un asistente IA que responde dudas adaptando la respuesta al rol del usuario.

---

## Hackathon — Built with Opus 4.7

Este proyecto se presenta al hackathon **Built with Opus 4.7** organizado por Cerebral Valley.

<!-- TODO: completar con la información oficial de https://cerebralvalley.ai/e/built-with-4-7-hackathon/details -->

- **Plazo de entrega:** _por confirmar_
- **Modelo requerido:** Claude Opus 4.7 (`claude-opus-4-7`)
- **Formato de entrega:** _por confirmar_
- **Criterios de evaluación:** _por confirmar_
- **Premios:** _por confirmar_

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
│  JSON/modulos/*.json  │         │  updateGitHub.js       │
│  localStorage         │         │  chatbot.js (próx.)    │
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
├── manifest.json, site.webmanifest  Manifest PWA + iconos
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
│   ├── validateAdmin.js             Valida tokens GitHub (admin = joanh)
│   └── saveState.js                 Guarda estado oficial por módulo
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
# Solo necesario para regenerar los JSONs de los módulos con scripts/extraer-modulos.js
ANTHROPIC_API_KEY=sk-ant-...
```

> **Nota:** APPRA **no necesita variables de entorno con tokens de GitHub** en el servidor.
> El modo profesor (Opción A) usa el PAT del propio admin desde el navegador — ver más abajo.

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

### Diseño elegido (Opción A — PAT del usuario)

- El admin (`joanh`) introduce su **Personal Access Token** de GitHub la primera vez en cada sesión.
- El token se valida contra `https://api.github.com/user` (Netlify Function `validateAdmin.js`) y se confirma que el `login` corresponde al admin autorizado.
- El token viaja a `saveState.js` que escribe en el repo vía la API de GitHub.
- El token **nunca** se almacena ni en localStorage ni en variables de entorno del servidor; vive en memoria del navegador y se pierde al cerrar pestaña.

✅ **Ventajas:** sin secretos en Netlify · sin riesgo de filtración del lado servidor · cualquier admin (con permisos en el repo) puede publicar.

⚠️ **A tener en cuenta:** el admin tiene que introducir el token cada sesión.

### Crear el PAT (admin)

1. Ir a [GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/personal-access-tokens/new).
2. Configurar el token:
   - **Resource owner:** tu usuario (`joanh` para el repo oficial)
   - **Repository access:** *Only select repositories* → `joanh/APPRA`
   - **Repository permissions:**
     - `Contents`: **Read and write**
     - `Metadata`: Read-only (se asigna solo)
   - **Expiration:** la que prefieras (90 días razonable para hackathon)
3. **Copiar el token** en cuanto se muestre — no se vuelve a ver. Guardarlo en un gestor de contraseñas, no en archivos de texto.

### Flujo de uso

| Acción | Quién | Auth |
|---|---|---|
| Cargar estado oficial | Cualquier usuario | Pública (lectura del JSON) |
| Guardar estado oficial | Solo admin (`joanh`) | PAT introducido por SweetAlert |

### Rotar / revocar el token

- En cualquier momento desde [tu lista de tokens fine-grained](https://github.com/settings/personal-access-tokens).
- Si revocas, la siguiente acción de "Guardar Estado Oficial" devolverá un error 401 y pedirá un token nuevo.

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
- [x] Modo profesor — autenticación con PAT de GitHub (Opción A)
- [x] Manifest PWA + iconos
- [x] Headers de seguridad

### En desarrollo (hackathon)

- [ ] Adaptación de `saveState.js` al repo `joanh/APPRA` y a estado por módulo (`JSON/oficiales/<id>.json`)
- [ ] Asistente IA con Claude Opus 4.7
- [ ] Prompts de sistema diferenciados por rol (profesor / alumno / familia)
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

- **Autor:** Jose Angel Heras ([@joanh](https://github.com/joanh)) — joseaheras@gmail.com
- **IA:** [Anthropic Claude Opus 4.7](https://www.anthropic.com/claude) — usado tanto para construir el proyecto como para alimentar el chatbot.
- **Hackathon:** [Built with Opus 4.7 · Cerebral Valley](https://cerebralvalley.ai/e/built-with-4-7-hackathon)
- **Datos curriculares:** BOE, BOCM y Consejería de Educación de la Comunidad de Madrid.

## Licencia

Proyecto en proceso de apertura como **Open Source** tras el hackathon. Licencia pendiente de definir (probablemente MIT o GPL-3.0).
