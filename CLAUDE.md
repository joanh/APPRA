# APPRA - Asistente de RAs y CEs para FP

## Descripción
PWA educativa para profesores y alumnos de FP (Formación Profesional) en España.
Permite gestionar y consultar Resultados de Aprendizaje (RAs) y Criterios de Evaluación (CEs)
de los módulos de Informática, con un agente IA para resolver dudas.

## Stack tecnológico
- Frontend: HTML5, CSS3, JavaScript vanilla (sin frameworks)
- Despliegue: Netlify (con Netlify Functions para el backend serverless)
- IA: Anthropic Claude API (claude-opus-4-7 via Netlify Functions)
- Control de versiones: GitHub (repo privado → Open Source al final)
- Objetivo final: Progressive Web App (PWA)

## Estructura del proyecto
- `index.html` — página principal
- `netlify/functions/` — funciones serverless (saveState.js, updateGithub.js, validateAdmin.js)
- `css/` — estilos
- `js/` — lógica cliente
- `img/` — recursos gráficos

## Objetivos del Hackathon (Built with Opus 4.7 - Cerebral Valley)
1. Selector de módulo dinámico: la web se auto-personaliza según el módulo FP seleccionado
2. Agente IA: resuelve dudas a alumnos sobre RAs y CEs del módulo activo
3. Actualización de tokens GitHub via interfaz
4. PWA: manifest.json + service worker básico

## Convenciones
- Código y comentarios en español
- Sin frameworks frontend (vanilla JS)
- Cada Netlify Function es independiente y sin dependencias externas (usar fetch nativo)
- Los datos de los módulos se cargan desde JSON externos