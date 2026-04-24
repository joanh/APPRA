const { Octokit } = require("@octokit/rest");

exports.handler = async function(event, context) {
    // Log inmediato al inicio
    console.log('====== FUNCIÓN INICIADA ======');
    console.log('Método HTTP:', event.httpMethod);
    console.log('Headers:', event.headers);
    
    // Verificar método
    if (event.httpMethod !== "POST") {
        console.log('Método no permitido:', event.httpMethod);
        return { 
            statusCode: 405, 
            body: JSON.stringify({
                error: "Method Not Allowed",
                method: event.httpMethod
            })
        };
    }

    // Log de variables de entorno
    console.log('Variables de entorno:', {
        hasToken: !!process.env.GITHUB_TOKEN,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO
    });

    try {
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        // Verificar la autenticación
        try {
            const { data: user } = await octokit.users.getAuthenticated();
            console.log('Autenticado como:', user.login);
            
            // Verificar permisos en la organización
            const { data: orgMembership } = await octokit.orgs.getMembershipForAuthenticatedUser({
                org: process.env.GITHUB_OWNER
            });
            console.log('Membresía en organización:', orgMembership);
            
            // Verificar permisos en el repositorio
            const { data: repoPermissions } = await octokit.repos.getCollaboratorPermissionLevel({
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO,
                username: user.login
            });
            console.log('Permisos en repositorio:', repoPermissions);
            
        } catch (authError) {
            console.error('Error de autenticación detallado:', authError);
            throw new Error(`Error de autenticación con GitHub: ${authError.message}`);
        }

        const content = event.body;
        const contentBase64 = Buffer.from(content).toString('base64');

        console.log('Intentando acceder al repositorio:', {
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO
        });

        // Verificar acceso al repositorio
        try {
            const { data: repo } = await octokit.repos.get({
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO
            });
            console.log('Repositorio accesible:', repo.full_name);
        } catch (repoError) {
            console.error('Error accediendo al repositorio:', repoError);
            throw new Error('No se puede acceder al repositorio');
        }

        const { data: currentFile } = await octokit.repos.getContent({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: 'official-state.json'
        });

        await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: 'official-state.json',
            message: 'Update official state via Netlify function',
            content: contentBase64,
            sha: currentFile.sha,
            branch: 'main'
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Estado actualizado correctamente" })
        };
    } catch (error) {
        console.error('ERROR:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                details: {
                    owner: process.env.GITHUB_OWNER,
                    repo: process.env.GITHUB_REPO,
                    hasToken: !!process.env.GITHUB_TOKEN,
                    errorStack: error.stack
                }
            })
        };
    }
}; 