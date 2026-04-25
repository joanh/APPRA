# Política de seguridad

## Reportar una vulnerabilidad

Si descubres una vulnerabilidad en APPRA, **NO** abras un issue público.

Escribe a **joseaheras@gmail.com** con:

- Descripción de la vulnerabilidad
- Pasos para reproducirla
- Impacto estimado (lectura/escritura no autorizada, exposición de datos,
  denegación de servicio, etc.)
- Tu identidad (opcional pero apreciado para crédito en el fix)

Compromiso de respuesta: 72 horas para acuse de recibo, máximo 30 días para
publicar un fix o explicar por qué no procede.

## Modelo de amenaza

APPRA gestiona los siguientes secretos y datos sensibles:

| Asset | Dónde vive | Riesgo si se filtra |
|---|---|---|
| `ANTHROPIC_API_KEY` | Netlify env var | Cargo fraudulento en la cuenta de Anthropic |
| `GITHUB_TOKEN` | Netlify env var | Escritura no autorizada en el repo APPRA |
| `ADMIN_PASSWORD` | Netlify env var | Modificación del estado oficial publicado |
| Contraseña admin (en cliente) | `sessionStorage` del navegador | Misma que `ADMIN_PASSWORD` durante esa sesión |
| Estado del usuario (CEs marcados) | `localStorage` por módulo | Sin riesgo (datos no sensibles) |

## Lo que NO consideramos vulnerabilidad

- Que cualquier usuario pueda **leer** el estado oficial publicado: es
  intencional (lectura pública, escritura solo admin).
- Que el chatbot devuelva respuestas incorrectas: el banner avisa de que
  pueden contener errores; verificar con un docente.
- Spam de uso del chatbot: hay coste asociado, pero no compromete datos.
  Si te preocupa el coste, mira "Mitigaciones futuras" más abajo.

## Buenas prácticas si despliegas tu propia copia

1. **Nunca** commitees `.env`. Está gitignored — si lo añades manualmente,
   está mal.
2. Crea **PATs específicos** (fine-grained, solo para el repo APPRA), no
   uses tokens classic con scope `repo` global.
3. Rota las credenciales periódicamente (90 días).
4. La `ADMIN_PASSWORD` no es la misma que cualquier otra contraseña tuya.
5. Si activas el chatbot de cara al público, considera limitar el coste:
   alerta de spend en la consola de Anthropic, rate-limiting al estilo
   Netlify Edge, o gating con contraseña pública.

## Mitigaciones futuras (roadmap)

- Rate-limiting por IP en el chatbot (Netlify Edge)
- Rotación automática del PAT de GitHub vía OIDC
- Auditoría WCAG completa
- Service Worker con caché de JSONs (PWA real)

## Histórico de vulnerabilidades

*(Vacío — todavía no se han reportado.)*
