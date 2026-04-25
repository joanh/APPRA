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
    this.moduleTitle = document.getElementById('moduleTitle');
    this.moduleSubtitle = document.getElementById('moduleSubtitle');
    this.moduleImage = document.getElementById('moduleImage');
  }

  async init() {
    document.body.dataset.mode = 'landing';

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
    if (this.indice.find((m) => m.id === guardado)) {
      this.selector.value = guardado;
      await this.cambiarModulo(guardado);
    }
  }

  poblarSelector() {
    const opciones = ['<option value="">— Selecciona un módulo —</option>']
      .concat(this.indice.map((m) =>
        `<option value="${m.id}">${m.curso} · ${m.nombre} (${m.abreviatura})</option>`
      ));
    this.selector.innerHTML = opciones.join('');
  }

  async cambiarModulo(id) {
    if (!id) {
      // Volver a la portada (usuario eligió placeholder).
      document.body.dataset.mode = 'landing';
      localStorage.removeItem(CLAVE_MODULO_ACTIVO);
      document.title = 'APPRA · Asistente de RAs y CEs para FP';
      return;
    }
    try {
      const res = await fetch(`JSON/modulos/${id}.json`);
      if (!res.ok) throw new Error(`Módulo ${id} no accesible (${res.status})`);
      const datos = await res.json();
      const meta = this.indice.find((m) => m.id === id);
      this.raManager.renderModule(datos);
      this.actualizarHero(datos, meta);
      document.body.dataset.mode = 'module';
      localStorage.setItem(CLAVE_MODULO_ACTIVO, id);
      document.title = `APPRA · ${datos.abreviatura} (${datos.curso})`;
    } catch (err) {
      this.mostrarError(`No se pudo cargar el módulo ${id}.`, err);
    }
  }

  actualizarHero(datos, meta) {
    if (this.moduleTitle) this.moduleTitle.textContent = datos.nombre;
    if (this.moduleSubtitle) {
      this.moduleSubtitle.textContent = `${datos.curso} · ${datos.ciclo}`;
    }
    if (this.moduleImage && meta?.imagen) {
      this.moduleImage.src = meta.imagen;
      this.moduleImage.alt = datos.nombre;
    }
  }

  mostrarError(mensaje, err) {
    console.error(mensaje, err);
    alert(mensaje);
  }
}
