// Sugerencias de términos para la búsqueda de CEs.
// Los términos se recalculan cada vez que se carga un módulo (ver moduleLoader.js)
// extrayendo las palabras más frecuentes de las descripciones de los CEs.

class SearchSuggestions {
    constructor() {
        this.searchInput = document.getElementById('searchCE');
        this.suggestionsDiv = document.getElementById('searchSuggestions');
        this.suggestionsContainer = this.suggestionsDiv?.querySelector('.suggestion-tags');
        this.setupEventListeners();
    }

    setTerms(terms) {
        if (!this.suggestionsContainer) return;
        this.suggestionsContainer.innerHTML = '';
        terms.forEach((term) => {
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
        this.searchInput.dispatchEvent(new Event('input'));
    }

    showSuggestions() {
        if (this.suggestionsDiv) this.suggestionsDiv.style.display = 'block';
    }

    hideSuggestions() {
        if (this.suggestionsDiv) this.suggestionsDiv.style.display = 'none';
    }

    setupEventListeners() {
        if (!this.searchInput || !this.suggestionsDiv) return;
        this.searchInput.addEventListener('click', () => this.showSuggestions());
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.suggestionsDiv.contains(e.target)) {
                this.hideSuggestions();
            }
        });
        this.searchInput.addEventListener('input', () => {
            if (this.searchInput.value.length > 0) this.hideSuggestions();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.searchSuggestions = new SearchSuggestions();
});
