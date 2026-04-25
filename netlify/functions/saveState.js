// Guarda el estado oficial de un módulo concreto en JSON/oficiales/<moduleId>.json
// del repositorio joanh/APPRA, usando el token GitHub del admin.
//
// Diseño Opción A: el token NO se almacena en variables de entorno del servidor;
// viaja en cada petición, se valida que pertenece a `joanh` y se descarta tras
// la operación. Mínima superficie de exposición del lado servidor.

const REPO_OWNER = 'joanh';
const REPO_NAME = 'APPRA';
const ADMIN_LOGIN = 'joanh';
const MODULE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,40}$/;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { state, token, moduleId } = JSON.parse(event.body);

    if (!token) throw new Error('Falta token de GitHub');
    if (!state) throw new Error('Falta el estado a guardar');
    if (!moduleId) throw new Error('Falta moduleId');
    if (!MODULE_ID_PATTERN.test(moduleId)) throw new Error('moduleId con formato inválido');

    // 1. Verificar quién es el portador del token.
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'APPRA-Netlify-Function',
      },
    });
    if (!userResponse.ok) throw new Error('Token de GitHub inválido o sin permisos');
    const userData = await userResponse.json();
    if (userData.login !== ADMIN_LOGIN) {
      throw new Error(`Usuario no autorizado: ${userData.login}`);
    }

    const path = `JSON/oficiales/${moduleId}.json`;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

    // 2. Obtener SHA del archivo si ya existe (para sobrescribir).
    let sha;
    const existing = await fetch(apiUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'APPRA-Netlify-Function',
      },
    });
    if (existing.ok) {
      sha = (await existing.json()).sha;
    } else if (existing.status !== 404) {
      throw new Error(`No se pudo consultar el estado actual (HTTP ${existing.status})`);
    }

    // 3. Hacer commit del nuevo estado.
    const content = Buffer.from(JSON.stringify(state, null, 2)).toString('base64');
    const updateBody = {
      message: `Update official state — ${moduleId}`,
      content,
      ...(sha && { sha }),
    };

    const updateResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'APPRA-Netlify-Function',
      },
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
