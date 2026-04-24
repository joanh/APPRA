class SearchSuggestions {
    constructor() {
        this.searchInput = document.getElementById('searchCE');
        this.suggestionsDiv = document.getElementById('searchSuggestions');
        this.suggestionsContainer = this.suggestionsDiv.querySelector('.suggestion-tags');
        
        // Los 10 términos más frecuentes
        this.commonTerms = [
            'objetos', 'eventos', 'funciones', 'documentos', 'aplicaciones',
            'estructuras', 'navegador', 'formularios', 'métodos', 'propiedades'
        ];

        this.init();
    }

    init() {
        this.createSuggestionTags();
        this.setupEventListeners();
    }

    createSuggestionTags() {
        this.commonTerms.forEach(term => {
            const tag = document.createElement('span');
            tag.className = 'suggestion-tag';
            tag.textContent = term;
            tag.onclick = () => this.handleTagClick(term);
            this.suggestionsContainer.appendChild(tag);
        });
    }

    handleTagClick(term) {
        this.searchInput.value = term;
        this.hideSuggestions();
        // Disparar el evento input para activar la búsqueda
        this.searchInput.dispatchEvent(new Event('input'));
    }

    showSuggestions() {
        this.suggestionsDiv.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestionsDiv.style.display = 'none';
    }

    setupEventListeners() {
        // Mostrar sugerencias al hacer clic en el input
        this.searchInput.addEventListener('click', () => this.showSuggestions());

        // Ocultar sugerencias cuando se hace clic fuera
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.suggestionsDiv.contains(e.target)) {
                this.hideSuggestions();
            }
        });

        // Ocultar sugerencias cuando se empieza a escribir
        this.searchInput.addEventListener('input', () => {
            if (this.searchInput.value.length > 0) {
                this.hideSuggestions();
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SearchSuggestions();
}); 