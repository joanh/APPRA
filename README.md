# APPRA — Asistente de RAs y CEs para FP

> **Built with Claude Opus 4.7** · Hackathon [Cerebral Valley](https://cerebralvalley.ai/e/built-with-4-7-hackathon)

PWA educativa para profesores y alumnos de Formación Profesional (FP) en España. Gestiona y consulta los Resultados de Aprendizaje (RAs) y Criterios de Evaluación (CEs) de los módulos de la familia de Informática, con un asistente IA basado en Claude Opus 4.7 para resolver dudas en tiempo real.

**Demo en vivo:** https://entornocliente2daw.netlify.app/

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

- **Selector dinámico de módulo:** la web se auto-personaliza según el módulo de FP elegido (RAs, CEs, pesos, descripciones).
- **Asistente IA multi-rol:** chatbot con Claude Opus 4.7 que adapta sus respuestas según si quien pregunta es profesor, alumno o familia.
- **Seguimiento de progreso:** estados visuales (no iniciado / en progreso / completado) con barra de progreso global ponderada por pesos.
- **Búsqueda y filtrado:** búsqueda por texto en CEs, filtro por RA, sugerencias predefinidas.
- **Exportación múltiple:** JSON, CSV (disponibles), PDF y DOCX (en desarrollo).
- **PWA real:** instalable, funciona offline, manifest + iconos completos.
- **Modo profesor:** guardar/cargar estado oficial del curso, autenticado con token GitHub.
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
├── index.html                    Página principal
├── manifest.json                 Manifest PWA básico
├── site.webmanifest              Manifest PWA con iconos
├── netlify.toml                  Configuración Netlify + headers de seguridad
├── official-state.json           Estado oficial del curso (último guardado)
│
├── css/
│   ├── styles.css                Estilos principales (dark mode)
│   └── search-suggestions.css    Sugerencias del buscador
│
├── js/
│   ├── script.js                 Lógica principal del cliente
│   ├── constants.js              Configuración (partículas, etc.)
│   ├── search-suggestions.js     Sugerencias de búsqueda
│   └── modules/
│       └── raManager.js          Gestor central de RAs/CEs
│
├── netlify/functions/
│   ├── validateAdmin.js          Valida tokens GitHub del profesor
│   ├── saveState.js              Guarda estado oficial vía GitHub API
│   └── updateGitHub.js           Actualiza archivos en el repo
│
├── JSON/
│   └── modulos/                  Datos curriculares por módulo
│       ├── modulos.json          Índice de módulos disponibles
│       └── <id>.json             RAs y CEs de cada módulo
│
├── icon/, img/                   Recursos gráficos
├── lib/                          Librerías externas (particles.js)
└── prompts/                      Logs de sesiones con Claude (gitignored)
```

---

## Datos de los módulos

Los datos de cada módulo se extraen de **fuentes oficiales**:

- **BOE** (Real Decreto que establece el título y enseñanzas mínimas)
- **BOCM** (Decreto autonómico de Madrid que desarrolla el currículo)
- **Documentación de la Consejería de Educación** de la Comunidad de Madrid

El proceso de extracción se realiza con **Claude Opus 4.7**, parseando los PDFs oficiales y generando los JSONs estructurados.

### Esquema de un módulo

```json
{
  "id": "2daw-ie",
  "nombre": "Desarrollo Web en Entorno Cliente",
  "abreviatura": "IE",
  "curso": "2º DAW",
  "ciclo": "Desarrollo de Aplicaciones Web",
  "familia": "Informática y Comunicaciones",
  "grado": "Superior",
  "horas": 126,
  "resultadosAprendizaje": [
    {
      "id": "ra1",
      "numero": 1,
      "peso": 5,
      "descripcion": "...",
      "criteriosEvaluacion": [
        {
          "id": "1a",
          "descripcion": "...",
          "peso": 15,
          "ffe": false
        }
      ]
    }
  ]
}
```

**Convenciones del esquema:**

- `peso` de RAs suma 100 dentro del módulo.
- `peso` de CEs suma 100 dentro del RA.
- `ffe: true` marca criterios vinculados a la Formación en Centro de Trabajo (FCT).
- El `id` del CE (`"1a"`, `"7i"`...) es la clave que se usa en `localStorage` y en `official-state.json`.

---

## Ejecución local

### Requisitos

- Node.js 18+
- Netlify CLI (`npm install -g netlify-cli`)
- Cuenta en Anthropic con clave API
- (Opcional) Token de GitHub con permisos sobre el repo si quieres usar el modo profesor

### Variables de entorno (`.env`)

```bash
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...                  # solo modo profesor
GITHUB_OWNER=<tu-usuario>             # solo modo profesor
GITHUB_REPO=APPRA                     # solo modo profesor
ADMIN_GITHUB_USERNAME=<tu-usuario>    # solo modo profesor
```

### Arrancar el entorno

```bash
git clone https://github.com/<tu-usuario>/APPRA.git
cd APPRA
netlify dev
```

Esto arranca el servidor en `http://localhost:8888` con las Netlify Functions disponibles en `/.netlify/functions/`.

---

## Roadmap

### Hecho

- [x] Maquetación completa con dark mode
- [x] 7 RAs y 56 CEs del módulo "Desarrollo Web en Entorno Cliente" (2º DAW)
- [x] Seguimiento de estados con localStorage
- [x] Modo profesor con autenticación GitHub
- [x] Exportación a JSON y CSV
- [x] Búsqueda y filtros
- [x] Manifest PWA + iconos
- [x] Headers de seguridad

### En desarrollo (hackathon)

- [ ] Selector dinámico de módulo
- [ ] JSONs de 3-4 módulos FP de Informática (Madrid)
- [ ] Asistente IA con Claude Opus 4.7
- [ ] Prompts de sistema diferenciados por rol (profesor / alumno / familia)
- [ ] Documentación del proceso de extracción de datos con Claude

### Próximamente

- [ ] Service Worker (PWA offline real)
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
