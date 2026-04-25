// Gestor de RAs y CEs. Renderiza las tarjetas a partir del JSON del módulo
// activo y mantiene su estado de progreso en localStorage, namespaceado por
// módulo (ceStates_<id>) para que cambiar de módulo no pise el progreso.

const ESTADOS = {
  pending: 'No iniciado',
  'in-progress': 'En progreso',
  completed: 'Completado',
};

// Etiquetas en español para los exports JSON/CSV.
const ESTADOS_EXPORT = {
  pending: 'Pendiente',
  'in-progress': 'En Progreso',
  completed: 'Completado',
};

const SIGUIENTE_ESTADO = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'pending',
};

export class RAManager {
  constructor() {
    this.moduleId = null;
    this.moduleData = null;
    this.setupSearch();
  }

  // --- Render ---------------------------------------------------------------

  renderModule(moduleData) {
    this.moduleData = moduleData;
    this.moduleId = moduleData.id;

    const contenedor = document.querySelector('.ra-container');
    if (!contenedor) return;
    contenedor.innerHTML = moduleData.resultadosAprendizaje
      .map((ra) => this.htmlRA(ra))
      .join('');

    this.poblarFiltroRAs(moduleData.resultadosAprendizaje);
    this.cargarEstadosGuardados();
    this.actualizarProgreso();
  }

  htmlRA(ra) {
    const filas = ra.criteriosEvaluacion.map((ce) => this.htmlCE(ra.numero, ce)).join('');
    const resumen = ra.descripcion.length > 110
      ? ra.descripcion.slice(0, 107) + '...'
      : ra.descripcion;
    return `
      <div class="ra-card w3-card w3-round-large" data-ra="ra${ra.numero}" data-weight="${ra.peso}">
        <div class="ra-header w3-bar w3-black w3-padding" onclick="toggleRA('ra${ra.numero}')">
          <div class="w3-bar-item" style="width:90%">
            <h3>
              RA${ra.numero}
              <span class="w3-tag w3-round w3-blue">${ra.peso}%</span>
              <span class="w3-small w3-opacity">${this.escapar(resumen)}</span>
            </h3>
          </div>
          <div class="w3-bar-item"><i class="fa fa-chevron-down"></i></div>
        </div>
        <div class="ra-content w3-hide" id="ra${ra.numero}-content">
          <div class="w3-responsive w3-padding">
            <table class="w3-table-all w3-hoverable">
              <thead>
                <tr class="w3-blue">
                  <th>CE</th><th>Descripción</th><th>Peso</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  htmlCE(numeroRA, ce) {
    const ffe = ce.ffe
      ? ' <i class="fa fa-building w3-text-amber" title="Criterio cursado en FCT"></i>'
      : '';
    const claseFila = ce.ffe ? ' class="ffe-criteria"' : '';
    const letra = ce.id.replace(/^\d+/, '');
    return `
      <tr data-ce="${ce.id}" data-weight="${ce.peso}"${claseFila}>
        <td>${numeroRA}.${letra}${ffe}</td>
        <td>${this.escapar(ce.descripcion)}</td>
        <td>${ce.peso}%</td>
        <td>
          <button class="ce-status-btn" data-ce-id="${ce.id}" data-status="pending"
                  onclick="raManager.toggleStatus(this)">
            <i class="fa fa-circle"></i>
            <span>No iniciado</span>
          </button>
        </td>
      </tr>`;
  }

  poblarFiltroRAs(ras) {
    const select = document.getElementById('raFilter');
    if (!select) return;
    const opciones = ['<option value="all">Todos los RA</option>']
      .concat(ras.map((ra) => `<option value="ra${ra.numero}">RA${ra.numero}</option>`));
    select.innerHTML = opciones.join('');
  }

  escapar(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  // --- Estado de los CEs ----------------------------------------------------

  claveEstados() {
    return `ceStates_${this.moduleId}`;
  }

  toggleStatus(btn) {
    const actual = btn.dataset.status;
    const siguiente = SIGUIENTE_ESTADO[actual];
    btn.dataset.status = siguiente;
    btn.querySelector('span').textContent = ESTADOS[siguiente];
    this.guardarEstado(btn.dataset.ceId, siguiente);
    this.actualizarProgreso();
  }

  guardarEstado(ceId, status) {
    const estados = JSON.parse(localStorage.getItem(this.claveEstados()) || '{}');
    estados[ceId] = status;
    localStorage.setItem(this.claveEstados(), JSON.stringify(estados));
  }

  cargarEstadosGuardados() {
    const estados = JSON.parse(localStorage.getItem(this.claveEstados()) || '{}');
    Object.entries(estados).forEach(([ceId, status]) => {
      const btn = document.querySelector(`button[data-ce-id="${ceId}"]`);
      if (btn) {
        btn.dataset.status = status;
        const span = btn.querySelector('span');
        if (span) span.textContent = ESTADOS[status] || ESTADOS.pending;
      }
    });
  }

  actualizarProgreso() {
    const buttons = document.querySelectorAll('.ce-status-btn');
    let total = 0;
    let hechos = 0;
    buttons.forEach((btn) => {
      const peso = parseInt(btn.closest('tr').dataset.weight) || 1;
      total += peso;
      if (btn.dataset.status === 'completed') hechos += peso;
      else if (btn.dataset.status === 'in-progress') hechos += peso * 0.5;
    });
    const pct = total > 0 ? (hechos / total) * 100 : 0;
    const barra = document.getElementById('globalProgress');
    if (barra) {
      barra.style.width = `${pct}%`;
      barra.textContent = `${Math.round(pct)}%`;
    }
  }

  // --- Búsqueda -------------------------------------------------------------

  setupSearch() {
    const input = document.getElementById('searchCE');
    if (input) input.addEventListener('input', () => this.handleSearch(input.value));
  }

  handleSearch(query) {
    query = query.toLowerCase().trim();
    document.querySelectorAll('.ra-card').forEach((card) => {
      const filas = card.querySelectorAll('tbody tr');
      let hay = false;
      filas.forEach((row) => {
        const ceId = row.dataset.ce || '';
        const descr = row.querySelector('td:nth-child(2)')?.textContent || '';
        const matches = ceId.toLowerCase().includes(query) || descr.toLowerCase().includes(query);
        row.style.display = matches ? '' : 'none';
        if (matches) hay = true;
      });
      card.style.display = hay ? '' : 'none';
      if (hay) {
        const content = card.querySelector('.ra-content');
        if (content) content.classList.remove('w3-hide');
      }
    });
  }

  // --- Importar / exportar / reset -----------------------------------------

  getCurrentState() {
    const estado = {};
    document.querySelectorAll('.ce-status-btn').forEach((btn) => {
      const ceId = btn.dataset.ceId;
      const status = btn.dataset.status;
      const peso = parseInt(btn.closest('tr').dataset.weight) || 1;
      const pct = status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0;
      estado[ceId] = { status, percentage: pct, weight: peso, lastUpdate: new Date().toISOString() };
    });
    return estado;
  }

  loadState(state) {
    Object.entries(state).forEach(([ceId, data]) => {
      const btn = document.querySelector(`[data-ce-id="${ceId}"]`);
      if (btn) {
        const status = typeof data === 'object' ? data.status : data;
        btn.dataset.status = status;
        const span = btn.querySelector('span');
        if (span) span.textContent = ESTADOS[status] || ESTADOS.pending;
      }
    });
    this.actualizarProgreso();
  }

  calculateGlobalProgress() {
    const buttons = document.querySelectorAll('.ce-status-btn');
    let total = 0;
    let hechos = 0;
    buttons.forEach((btn) => {
      const peso = parseInt(btn.closest('tr').dataset.weight) || 1;
      total += peso;
      if (btn.dataset.status === 'completed') hechos += peso;
      else if (btn.dataset.status === 'in-progress') hechos += peso * 0.5;
    });
    return Math.round((hechos / total) * 100);
  }

  exportToJSON() {
    const interno = this.getCurrentState();
    const traducido = {};
    Object.entries(interno).forEach(([ce, data]) => {
      traducido[ce] = {
        estado: ESTADOS_EXPORT[data.status] || data.status,
        porcentaje: data.percentage,
        peso: data.weight,
        actualizado: data.lastUpdate,
      };
    });
    const datos = JSON.stringify(traducido, null, 2);
    this.descargar(datos, `estado_${this.moduleId}.json`, 'application/json');
  }

  exportToCSV() {
    const estado = this.getCurrentState();
    let csv = 'CE,Estado,Porcentaje,Peso\n';
    Object.entries(estado).forEach(([ce, data]) => {
      const etiqueta = ESTADOS_EXPORT[data.status] || data.status;
      csv += `${ce},${etiqueta},${data.percentage},${data.weight}\n`;
    });
    this.descargar(csv, `estado_${this.moduleId}.csv`, 'text/csv');
  }

  descargar(contenido, nombre, mime) {
    const blob = new Blob([contenido], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async resetAll() {
    const respuesta = await Swal.fire({
      icon: 'warning',
      title: '¿Resetear todos los estados?',
      text: 'Se borrará el progreso del módulo actual.',
      showCancelButton: true,
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2196F3',
      background: '#2d2d2d',
      color: '#fff',
    });
    if (!respuesta.isConfirmed) return;
    document.querySelectorAll('.ce-status-btn').forEach((btn) => {
      btn.dataset.status = 'pending';
      const span = btn.querySelector('span');
      if (span) span.textContent = ESTADOS.pending;
    });
    localStorage.removeItem(this.claveEstados());
    this.actualizarProgreso();
  }

  // saveOfficialState vive en script.js (necesita el AdminManager con el PAT).
  // loadOfficialState es lectura pública: el JSON publicado por el profesor
  // está en el propio sitio (Netlify lo sirve desde el repo desplegado).
  async loadOfficialState() {
    if (!this.moduleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un módulo',
        text: 'Antes de cargar, elige un módulo desde el selector.',
        background: '#2d2d2d', color: '#fff', confirmButtonColor: '#2196F3',
      });
      return;
    }

    try {
      const url = `JSON/oficiales/${this.moduleId}.json?ts=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (res.status === 404) {
        Swal.fire({
          icon: 'info',
          title: 'Sin estado oficial',
          text: 'Este módulo aún no tiene un estado oficial publicado.',
          background: '#2d2d2d', color: '#fff', confirmButtonColor: '#2196F3',
        });
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      this.loadState(data.state);

      Swal.fire({
        icon: 'success',
        title: 'Estado oficial cargado',
        text: `Última actualización: ${new Date(data.lastUpdate).toLocaleString()}`,
        background: '#2d2d2d', color: '#fff', confirmButtonColor: '#2196F3',
      });
    } catch (err) {
      console.error('Error cargando estado oficial:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: err.message,
        background: '#2d2d2d', color: '#fff', confirmButtonColor: '#2196F3',
      });
    }
  }
}
