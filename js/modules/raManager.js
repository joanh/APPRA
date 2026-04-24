// Módulo para gestionar los RA y CE
export class RAManager {
  constructor() {
    this.initializeListeners();
    this.loadSavedStates();
    this.setupSearch();
    this.OFFICIAL_STATE_KEY = 'officialRAState';
    this.OFFICIAL_STATE_FILE = '/official-state.json';
    
    // Añadir esto al constructor para que se ejecute al iniciar
    this.updateTableHeaders();
  }

  initializeListeners() {
    // Si necesitas inicializar algo más
    this.updateProgress();
  }

  toggleStatus(btn) {
    const states = {
      'pending': { next: 'in-progress', text: 'En progreso' },
      'in-progress': { next: 'completed', text: 'Completado' },
      'completed': { next: 'pending', text: 'No iniciado' }
    };

    const currentStatus = btn.dataset.status;
    const nextState = states[currentStatus];
    
    btn.dataset.status = nextState.next;
    btn.querySelector('span').textContent = nextState.text;
    
    this.saveStatus(btn.dataset.ceId, nextState.next);
    this.updateProgress();
  }

  saveStatus(ceId, status) {
    const savedStates = JSON.parse(localStorage.getItem('ceStates') || '{}');
    savedStates[ceId] = status;
    localStorage.setItem('ceStates', JSON.stringify(savedStates));
  }

  loadSavedStates() {
    const savedStates = JSON.parse(localStorage.getItem('ceStates') || '{}');
    Object.entries(savedStates).forEach(([ceId, status]) => {
      const btn = document.querySelector(`button[data-ce-id="${ceId}"]`);
      if (btn) {
        const states = {
          'pending': 'No iniciado',
          'in-progress': 'En progreso',
          'completed': 'Completado'
        };
        btn.dataset.status = status;
        btn.querySelector('span').textContent = states[status];
      }
    });
    this.updateProgress();
  }

  updateProgress() {
    const buttons = document.querySelectorAll('.ce-status-btn');
    let total = 0;
    let completed = 0;

    buttons.forEach(btn => {
      const weight = parseInt(btn.closest('tr').dataset.weight) || 1;
      total += weight;
      
      switch(btn.dataset.status) {
        case 'completed':
          completed += weight;
          break;
        case 'in-progress':
          completed += weight * 0.5;
          break;
      }
    });

    const progress = (completed / total) * 100;
    const progressBar = document.getElementById('globalProgress');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${Math.round(progress)}%`;
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('searchCE');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.handleSearch(searchInput.value));
    }
  }

  handleSearch(query) {
    // Normalizar la búsqueda
    query = query.toLowerCase().trim();
    
    // Obtener todas las tarjetas RA y filas CE
    const raCards = document.querySelectorAll('.ra-card');
    
    raCards.forEach(card => {
      const rows = card.querySelectorAll('tbody tr');
      let hasMatch = false;

      rows.forEach(row => {
        const ceId = row.dataset.ce || '';
        const description = row.querySelector('td:nth-child(2)').textContent || '';
        const matches = ceId.toLowerCase().includes(query) || 
                      description.toLowerCase().includes(query);

        // Mostrar/ocultar la fila según coincidencia
        row.style.display = matches ? '' : 'none';
        if (matches) hasMatch = true;
      });

      // Mostrar/ocultar la tarjeta RA y expandirla si hay coincidencias
      card.style.display = hasMatch ? '' : 'none';
      if (hasMatch) {
        const content = card.querySelector('.ra-content');
        if (content) content.classList.remove('w3-hide');
      }
    });
  }

  async saveOfficialState() {
    const state = this.getCurrentState();
    const officialState = {
      lastUpdate: new Date().toISOString(),
      globalProgress: this.calculateGlobalProgress(),
      state: state
    };

    try {
      // Primero guardamos en localStorage como respaldo
      localStorage.setItem('officialStateBackup', JSON.stringify(officialState));

      // Intentamos actualizar el archivo en GitHub usando la función serverless
      const response = await fetch('/.netlify/functions/updateGitHub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(officialState)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Estado oficial guardado correctamente en GitHub');
      } else {
        throw new Error('No se pudo guardar en GitHub');
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback: Descarga manual
      const blob = new Blob([JSON.stringify(officialState, null, 2)], 
                          { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'official-state.json';
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Error al guardar en GitHub. Se ha descargado el archivo para actualización manual.');
    }
  }

  calculateGlobalProgress() {
    const buttons = document.querySelectorAll('.ce-status-btn');
    let total = 0;
    let completed = 0;

    buttons.forEach(btn => {
      const weight = parseInt(btn.closest('tr').dataset.weight) || 1;
      total += weight;
      
      switch(btn.dataset.status) {
        case 'completed':
          completed += weight;
          break;
        case 'in-progress':
          completed += weight * 0.5;
          break;
      }
    });

    return Math.round((completed / total) * 100);
  }

  async loadOfficialState() {
    try {
      console.log('Intentando cargar desde:', this.OFFICIAL_STATE_FILE); // Debug
      const response = await fetch(this.OFFICIAL_STATE_FILE);
      console.log('Response status:', response.status); // Debug
      
      if (response.ok) {
        const data = await response.json();
        console.log('Estado oficial cargado:', data);
        this.loadState(data.state);
        alert(`Estado oficial cargado (última actualización: ${new Date(data.lastUpdate).toLocaleString()})`);
      } else {
        throw new Error(`Error al cargar el estado oficial: ${response.status}`);
      }
    } catch (error) {
      console.error('Error cargando estado oficial:', error);
      alert('Error al cargar el estado oficial. Revisa la consola para más detalles.');
    }
  }

  getCurrentState() {
    const state = {};
    const buttons = document.querySelectorAll('.ce-status-btn');
    
    buttons.forEach(btn => {
      const ceId = btn.dataset.ceId;
      const status = btn.dataset.status;
      const weight = parseInt(btn.closest('tr').dataset.weight) || 1;
      
      // Calcular el porcentaje basado en el estado
      let percentage = 0;
      switch(status) {
        case 'completed':
          percentage = 100;
          break;
        case 'in-progress':
          percentage = 50;
          break;
        case 'pending':
          percentage = 0;
          break;
      }

      state[ceId] = {
        status: status,
        percentage: percentage,
        weight: weight,
        lastUpdate: new Date().toISOString()
      };
    });
    return state;
  }

  loadState(state) {
    console.log('Cargando estado:', state);
    Object.entries(state).forEach(([ceId, data]) => {
        const btn = document.querySelector(`[data-ce-id="${ceId}"]`);
        if (btn) {
            // Compatibilidad con formato antiguo
            const status = typeof data === 'object' ? data.status : data;
            
            btn.dataset.status = status;
            const span = btn.querySelector('span');
            if (span) {
                const states = {
                    'pending': 'No iniciado',
                    'in-progress': 'En progreso',
                    'completed': 'Completado'
                };
                span.textContent = states[status];
            }
        }
    });
    this.updateProgress();
  }

  // Exportar a JSON
  exportToJSON() {
    const state = this.getCurrentState();
    const dataStr = JSON.stringify(state, null, 2);
    this.downloadFile(dataStr, 'estado_ras.json', 'application/json');
  }

  // Exportar a CSV
  exportToCSV() {
    const state = this.getCurrentState();
    let csv = 'CE,Estado\n';
    Object.entries(state).forEach(([ce, status]) => {
      csv += `${ce},${status}\n`;
    });
    this.downloadFile(csv, 'estado_ras.csv', 'text/csv');
  }

  // Utilidad para descargar archivos
  downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Reset
  resetAll() {
    if (confirm('¿Estás seguro de que quieres resetear todos los estados?')) {
      document.querySelectorAll('.ce-status-btn').forEach(btn => {
        btn.dataset.status = 'pending';
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = 'No iniciado';
        }
      });
      localStorage.clear();
      this.updateProgress();
    }
  }

  // Añadir este nuevo método a la clase RAManager
  updateTableHeaders() {
    // Cambiar los encabezados de "Criterio" a "CE"
    document.querySelectorAll('tr.w3-blue th').forEach(th => {
        if (th.textContent === 'Criterio') {
            th.textContent = 'CE';
        }
    });

    // Eliminar "CE " del inicio de cada celda en la primera columna
    document.querySelectorAll('tbody tr td:first-child').forEach(td => {
        if (td.textContent.startsWith('CE ')) {
            td.textContent = td.textContent.replace('CE ', '');
        }
    });
  }
}