// Carga el índice de módulos (JSON/modulos/modulos.json), pinta el selector
// y dispara el render del módulo activo en RAManager. La selección actual se
// persiste en localStorage para que la app vuelva a abrirse en el mismo
// módulo en la siguiente visita.

const INDICE_URL = 'JSON/modulos/modulos.json';
const CLAVE_MODULO_ACTIVO = 'moduloActivo';

export class ModuleLoader {
  constructor(raManager) {
    this.raManager = raManager;
    this.indice = [];
    this.selector = document.getElementById('moduleSelector');
    this.info = document.getElementById('moduleInfo');
  }

  async init() {
    try {
      const res = await fetch(INDICE_URL);
      if (!res.ok) throw new Error(`Índice de módulos no accesible (${res.status})`);
      this.indice = await res.json();
    } catch (err) {
      this.mostrarError('No se pudo cargar el índice de módulos.', err);
      return;
    }

    this.poblarSelector();
    this.selector.addEventListener('change', () => this.cambiarModulo(this.selector.value));

    const guardado = localStorage.getItem(CLAVE_MODULO_ACTIVO);
    const inicial = this.indice.find((m) => m.id === guardado) ? guardado : this.indice[0]?.id;
    if (inicial) {
      this.selector.value = inicial;
      await this.cambiarModulo(inicial);
    }
  }

  poblarSelector() {
    this.selector.innerHTML = this.indice
      .map((m) => `<option value="${m.id}">${m.curso} · ${m.nombre} (${m.abreviatura})</option>`)
      .join('');
  }

  async cambiarModulo(id) {
    if (!id) return;
    try {
      const res = await fetch(`JSON/modulos/${id}.json`);
      if (!res.ok) throw new Error(`Módulo ${id} no accesible (${res.status})`);
      const datos = await res.json();
      this.raManager.renderModule(datos);
      this.actualizarInfo(datos);
      localStorage.setItem(CLAVE_MODULO_ACTIVO, id);
      document.title = `APPRA · ${datos.abreviatura} (${datos.curso})`;
    } catch (err) {
      this.mostrarError(`No se pudo cargar el módulo ${id}.`, err);
    }
  }

  actualizarInfo(m) {
    if (!this.info) return;
    const totalCEs = m.resultadosAprendizaje.reduce((acc, ra) => acc + ra.criteriosEvaluacion.length, 0);
    this.info.innerHTML =
      `<strong>${m.nombre}</strong> · ${m.ciclo} · ${m.grado} · ` +
      `${m.horas}h · ${m.resultadosAprendizaje.length} RAs · ${totalCEs} CEs`;
  }

  mostrarError(mensaje, err) {
    console.error(mensaje, err);
    if (this.info) this.info.innerHTML = `<span class="w3-text-red">${mensaje}</span>`;
  }
}
