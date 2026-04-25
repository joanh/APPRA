# Contribuir a APPRA

Gracias por tu interés. APPRA es un proyecto educativo abierto: cualquier
profesor, alumno o desarrollador puede aportar.

## Maneras de contribuir

| Tipo | Cómo |
|---|---|
| Reportar un bug | Abre un *issue* describiendo qué módulo, navegador y pasos para reproducir |
| Sugerir una mejora | Abre un *issue* con la etiqueta `enhancement` |
| Añadir un módulo nuevo | Ver "Añadir un módulo" más abajo |
| Mejorar el código | Pull request — primero abre un issue para coordinar |
| Mejorar la documentación | Pull request directo si es claro |

## Setup local

```bash
git clone https://github.com/joanh/APPRA.git
cd APPRA
npm install              # solo si vas a usar el extractor de módulos
netlify dev              # http://localhost:8888 con Netlify Functions
# o
python -m http.server 8000   # solo frontend, sin Netlify Functions
```

Para ejecutar el extractor de módulos necesitas un fichero `.env` (NO lo
commitees) con:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Para probar el modo profesor en local también necesitas en `.env`:

```bash
GITHUB_TOKEN=ghp_...
ADMIN_PASSWORD=lo-que-elijas
```

## Añadir un módulo nuevo

1. Descarga el Real Decreto correspondiente del BOE en `.Docs/` (`<CICLO>-BOE-RD<numero>-<año>.pdf`).
2. Edita `scripts/extraer-modulos.js` y añade una entrada al array `MODULOS`
   con el `id` (`<curso><ciclo>-<abreviatura>`), nombre exacto, curso, ciclo,
   familia, grado e imagen (`img/portadaN.png`).
3. Si la imagen es nueva, guárdala en `img/` (PNG ~750×600 funciona bien).
4. Ejecuta `npm run extraer-modulos` — el script genera el JSON del módulo
   y regenera `JSON/modulos/modulos.json`.
5. Verifica el JSON resultante: que los textos de RAs/CEs sean **literales**
   del BOE, no interpretados.
6. Pull request con: PDF nuevo en `.Docs/`, JSON nuevo en `JSON/modulos/`,
   imagen en `img/`, y el cambio en el extractor.

## Convenciones

- Código y comentarios en español (el público objetivo es FP española)
- JavaScript vanilla, sin frameworks (decisión arquitectural — es coherente
  con la audiencia educativa que está aprendiendo HTML/CSS/JS)
- Cada Netlify Function es independiente; usa `fetch` nativo, evita
  dependencias salvo el SDK oficial de Anthropic
- Mensajes de commit en español, breves, en imperativo. Ejemplo:
  `Añade módulo SAD a la extracción`

## Datos del BOE

Los Reales Decretos del BOE son **dominio público** (legislación española).
Los JSON extraídos pueden redistribuirse libremente. Si extraes módulos de
otra Comunidad Autónoma (BOJA, DOCM, etc.), verifica que la licencia del
boletín lo permite.

## Code of Conduct

Este proyecto sigue el [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
Sé respetuoso, paciente y constructivo.

## Reportar vulnerabilidades

Ver [SECURITY.md](SECURITY.md). Las vulnerabilidades **no** se reportan en
issues públicos.
