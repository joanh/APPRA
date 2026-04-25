// Guarda el estado oficial de un módulo en JSON/oficiales/<moduleId>.json
// del repositorio joanh/APPRA.
//
// Diseño Opción B: el token de GitHub vive como variable de entorno en Netlify
// (`GITHUB_TOKEN`). El admin se autentica con una contraseña corta que se
// compara contra `ADMIN_PASSWORD`. Si coincide, la function actúa como relé
// hacia la API de GitHub usando el token del servidor — el usuario nunca ve
// ni manipula el PAT.

const REPO_OWNER = 'joanh';
const REPO_NAME = 'APPRA';
const MODULE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,40}$/;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Servidor mal configurado: faltan variables de entorno' }),
    };
  }

  try {
    const { state, password, moduleId } = JSON.parse(event.body);

    if (!password) throw new Error('Falta contraseña');
    if (!state) throw new Error('Falta estado');
    if (!moduleId) throw new Error('Falta moduleId');
    if (!MODULE_ID_PATTERN.test(moduleId)) throw new Error('moduleId con formato inválido');

    if (password !== process.env.ADMIN_PASSWORD) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Contraseña incorrecta' }),
      };
    }

    const token = process.env.GITHUB_TOKEN;
    const path = `JSON/oficiales/${moduleId}.json`;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    const ghHeaders = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'APPRA-Netlify-Function',
    };

    // Recuperar SHA del archivo si ya existe (necesario para sobrescribir).
    let sha;
    const existing = await fetch(apiUrl, { headers: ghHeaders });
    if (existing.ok) {
      sha = (await existing.json()).sha;
    } else if (existing.status !== 404) {
      throw new Error(`Consulta a GitHub falló (HTTP ${existing.status})`);
    }

    const content = Buffer.from(JSON.stringify(state, null, 2)).toString('base64');
    const updateBody = {
      message: `Update official state — ${moduleId}`,
      content,
      ...(sha && { sha }),
    };

    const updateResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(updateBody),
    });

    if (!updateResponse.ok) {
      const detalle = await updateResponse.text();
      throw new Error(`GitHub respondió ${updateResponse.status}: ${detalle}`);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, path, message: `Estado guardado en ${path}` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
