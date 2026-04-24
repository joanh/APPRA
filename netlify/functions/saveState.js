exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { state, token } = JSON.parse(event.body);
        
        if (!token || !state) {
            throw new Error('Token y estado son requeridos');
        }

        // Verificar usuario
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!userResponse.ok) throw new Error('Token inválido');

        const userData = await userResponse.json();
        if (userData.login !== 'joanh') throw new Error('Usuario no autorizado');

        // Obtener SHA del archivo existente
        const fileResponse = await fetch('https://api.github.com/repos/2DAWIE/sandbox/contents/official-state.json', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha;
        if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            sha = fileData.sha;
        }

        // Preparar y enviar actualización
        const content = Buffer.from(JSON.stringify(state, null, 2)).toString('base64');
        const updateBody = {
            message: 'Actualización del estado oficial',
            content: content,
            ...(sha && { sha })
        };

        const updateResponse = await fetch('https://api.github.com/repos/2DAWIE/sandbox/contents/official-state.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateBody)
        });

        if (!updateResponse.ok) throw new Error('Error al guardar en GitHub');

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true,
                message: 'Estado guardado correctamente'
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}; 