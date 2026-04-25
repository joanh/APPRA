// Valida la contraseña de admin contra la variable de entorno ADMIN_PASSWORD
// configurada en Netlify. Devuelve { isAdmin: true|false }.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  if (!process.env.ADMIN_PASSWORD) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Servidor mal configurado: falta ADMIN_PASSWORD' }),
    };
  }

  try {
    const { password } = JSON.parse(event.body || '{}');
    if (!password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Falta contraseña' }),
      };
    }

    const isAdmin = password === process.env.ADMIN_PASSWORD;
    return {
      statusCode: isAdmin ? 200 : 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error de validación' }),
    };
  }
};
