import { PARTICLE_CONFIG } from "./constants.js";
import { RAManager } from './modules/raManager.js';
import { ModuleLoader } from './modules/moduleLoader.js';

// Gestor de acceso administrativo
const AdminManager = {
    isAdmin: false,
    adminToken: null,

    requestAccess: async function() {
        const respuesta = await Swal.fire({
            title: 'Acceso de administrador',
            text: 'Introduce tu token:',
            input: 'password',
            inputAttributes: { autocapitalize: 'off', autocorrect: 'off' },
            showCancelButton: true,
            confirmButtonText: 'Acceder',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2196F3',
            background: '#2d2d2d',
            color: '#fff',
        });
        if (!respuesta.isConfirmed || !respuesta.value) return false;
        const token = respuesta.value;

        try {
            const response = await fetch('/.netlify/functions/validateAdmin', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Content-Type-Options': 'nosniff'  // Previene MIME-sniffing
                },
                body: JSON.stringify({ token })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.isAdmin) {
                this.isAdmin = true;
                this.adminToken = token;
                
                Swal.fire({
                    icon: 'success',
                    title: 'Acceso Concedido',
                    text: 'Autenticado como administrador',
                    background: '#2d2d2d',
                    color: '#fff',
                    confirmButtonColor: '#2196F3'
                });
                return true;
            }
        } catch (error) {
            console.error('Error específico:', error.message);
            console.error('Error validando token:', error);
        }

        this.isAdmin = false;
        this.adminToken = null;
        return false;
    },

    clearAccess: function() {
        this.isAdmin = false;
        this.adminToken = null;
    }
};

// Inicializar el fondo de partículas
particlesJS("particles-js", PARTICLE_CONFIG);

// Crear instancia global del gestor de RAs y cargador de módulos
window.raManager = new RAManager();
window.moduleLoader = new ModuleLoader(window.raManager);
window.moduleLoader.init();

// Volver a la portada (cambia el modo a landing y scrollea arriba).
window.irAInicio = function() {
    const selector = document.getElementById('moduleSelector');
    if (selector) selector.value = '';
    window.moduleLoader?.cambiarModulo('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Configurar el enlace de email (codificado por seguridad)
const emailForm = document.getElementById("emailLinkID");
const email = "joseaheras@protonmail.com"
const encodedEmail = email.split('').map(char => char.charCodeAt(0).toString(16)).join('');
emailForm?.setAttribute("href", "mailto:".concat(window.atob(window.btoa("joseaheras@protonmail.com"))));

// Función para expandir/colapsar RAs
window.toggleRA = function(raId) {
    const content = document.getElementById(raId + "-content");
    if (content) {
        content.classList.toggle("w3-hide");
    }
};

// Clase para gestionar la navegación en dispositivos móviles
class MobileNavigation {
    constructor() {
        this.init();
    }

    init() {
        this.addEventListeners();
    }

    addEventListeners() {
        const links = document.querySelectorAll('.mobile-nav-link');
        links.forEach(link => {
            link.addEventListener('click', this.handleClick.bind(this));
        });
    }

    handleClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const targetId = button.dataset.target;
        const element = document.getElementById(targetId);
        
        if (element) {
            const headerOffset = 60;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Configurar navegación móvil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView();
                const navbar = document.getElementById('myNavbar');
                if (navbar) navbar.classList.remove('w3-show');
            }
        });
    });
});

// Configurar botón de scroll to top
const scrollButton = document.getElementById('scrollToTop');
window.addEventListener('scroll', () => {
    scrollButton.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });
scrollButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Ventana modal de información sobre RAs y CEs
window.showRAInfo = function() {
    Swal.fire({
        title: '¿Qué son los RAs y CEs?',
        icon: 'info',
        html: '<b>Resultados de Aprendizaje (RA)</b>: descripciones claras y específicas de lo que los estudiantes deben saber y ser capaces de hacer al final de una unidad de enseñanza o curso.<br><br>' +
              '<b>Criterios de evaluación (CE)</b>: Métodos utilizados para evaluar si los estudiantes han alcanzado los RA.',
        background: '#2d2d2d',
        color: '#fff',
        confirmButtonColor: '#2196F3',
        iconHtml: '<i class="fa fa-info-circle" style="font-size: 0.5em;"></i>',
        customClass: { icon: 'small-icon' }
    });
};

// Ventana modal de información sobre el panel del profesor
window.showPanelInfo = function() {
    Swal.fire({
        title: 'Panel del Profesor',
        html: `
            <div style="text-align: left; padding: 10px;">
                <p><strong>Guardado y Carga:</strong> Permite guardar el estado actual de evaluación y recuperarlo posteriormente. Los datos se almacenan de forma segura en GitHub.</p>
                <p><strong>Exportación:</strong> Puedes exportar los datos en formato JSON (para respaldo) o CSV (para hojas de cálculo).</p>
                <p><strong>Filtrado de RAs:</strong> Usa el selector superior para filtrar y visualizar RAs específicos.</p>
                <p><strong>Barra de Progreso:</strong> Muestra el porcentaje global de criterios de evaluación completados en el módulo.</p>
                <p><strong>Reset:</strong> Permite reiniciar todos los estados de evaluación (¡usar con precaución!).</p>
            </div>
        `,
        icon: 'info',
        background: '#2d2d2d',
        color: '#fff',
        confirmButtonColor: '#2196F3',
        iconHtml: '<i class="fa fa-info-circle" style="font-size: 0.5em;"></i>',
        customClass: { icon: 'small-icon' }
    });
};

// Función para limpiar el campo de búsqueda
window.clearSearch = function() {
    const searchInput = document.getElementById('searchCE');
    const clearIcon = document.querySelector('.clear-search');
    searchInput.value = '';
    clearIcon.style.display = 'none';

    document.querySelectorAll('.ra-card').forEach(card => card.style.display = '');
    document.querySelectorAll('.ra-card tbody tr').forEach(row => row.style.display = '');

    searchInput.dispatchEvent(new Event('input'));
};

// Configurar búsqueda inteligente cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchCE');
    const clearIcon = document.querySelector('.clear-search');

    // Gestionar icono de limpiar búsqueda
    searchInput.addEventListener('input', function() {
        clearIcon.style.display = this.value ? 'block' : 'none';
    });

    // Configurar autocompletado inteligente
    const searchTerms = new Set();
    document.querySelectorAll('.ce-text').forEach(ce => {
        const text = ce.textContent.toLowerCase();
        const words = text.split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['para', 'como', 'entre', 'otros', 'estas', 'estos'].includes(word));
        words.forEach(word => searchTerms.add(word));
    });

    // Crear y añadir datalist para autocompletado
    const datalist = document.createElement('datalist');
    datalist.id = 'searchTerms';
    Array.from(searchTerms).sort().forEach(term => {
        const option = document.createElement('option');
        option.value = term;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);
    searchInput.setAttribute('list', 'searchTerms');
});

// Función para expandir/colapsar todos los RAs
window.toggleAllCEs = function() {
    const button = document.getElementById('toggleAllCEs');
    const isExpanding = button.innerHTML.includes('Expandir');
    
    document.querySelectorAll('.ra-card').forEach(section => {
        const content = section.querySelector('.ra-content');
        const header = section.querySelector('.ra-header');
        
        if (isExpanding) {
            if (content?.classList.contains('w3-hide') && header) header.click();
        } else {
            if (content && !content.classList.contains('w3-hide') && header) header.click();
        }
    });

    button.innerHTML = isExpanding ? 
        '<i class="fa fa-chevron-up"></i> Colapsar todos' : 
        '<i class="fa fa-chevron-down"></i> Expandir todos';
};

// Función para guardar el estado oficial (requiere autenticación)
raManager.saveOfficialState = async function() {
    if (!AdminManager.isAdmin) {
        const authorized = await AdminManager.requestAccess();
        if (!authorized) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: 'Solo el administrador puede guardar el estado oficial',
                background: '#2d2d2d',
                color: '#fff',
                confirmButtonColor: '#2196F3'
            });
            return;
        }
    }

    try {
        const state = {
            lastUpdate: new Date().toISOString(),
            globalProgress: this.calculateGlobalProgress(),
            state: this.getCurrentState()
        };

        const response = await fetch('/.netlify/functions/saveState', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                state: state,
                token: AdminManager.adminToken
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al guardar el estado');

        Swal.fire({
            icon: 'success',
            title: 'Estado Guardado',
            text: 'El estado oficial se ha guardado correctamente',
            background: '#2d2d2d',
            color: '#fff',
            confirmButtonColor: '#2196F3'
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el Estado Oficial',
            background: '#2d2d2d',
            color: '#fff',
            confirmButtonColor: '#2196F3'
        });
    }
};

// Agregar políticas de seguridad
if (window.trustedTypes && trustedTypes.createPolicy) {
    trustedTypes.createPolicy('default', {
        createHTML: string => string,
        createScriptURL: string => string,
        createScript: string => string
    });
}

