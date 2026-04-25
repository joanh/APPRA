// Carga el índice de módulos (JSON/modulos/modulos.json), pinta el selector
// y dispara el render del módulo activo en RAManager. La selección actual se
// persiste en localStorage para que la app vuelva a abrirse en el mismo
// módulo en la siguiente visita.

const INDICE_URL = 'JSON/modulos/modulos.json';
const CLAVE_MODULO_ACTIVO = 'moduloActivo';

// Stopwords para extraer los términos más frecuentes de los CEs.
// Incluye conectores y los verbos en participio típicos del lenguaje del BOE
// ("Se han identificado...", "Se han caracterizado...") que aportan ruido.
const STOPWORDS = new Set([
  'para', 'como', 'entre', 'otros', 'otras', 'sobre', 'según', 'desde', 'hasta',
  'mediante', 'durante', 'cada', 'tanto', 'también', 'donde', 'cuando', 'aunque',
  'estos', 'estas', 'esos', 'esas', 'este', 'esta', 'aquel', 'aquella',
  'identificado', 'identificada', 'identificadas', 'identificados',
  'caracterizado', 'caracterizada', 'caracterizadas', 'caracterizados',
  'reconocido', 'reconocida', 'reconocidas', 'reconocidos',
  'utilizado', 'utilizada', 'utilizadas', 'utilizados',
  'aplicado', 'aplicada', 'aplicadas', 'aplicados',
  'analizado', 'analizada', 'analizadas', 'analizados',
  'realizado', 'realizada', 'realizadas', 'realizados',
  'descrito', 'descrita', 'descritas', 'descritos',
  'establecido', 'establecida', 'establecidas', 'establecidos',
  'verificado', 'verificada', 'verificadas', 'verificados',
  'comprobado', 'comprobada', 'comprobadas', 'comprobados',
  'valorado', 'valorada', 'valoradas', 'valorados',
  'evaluado', 'evaluada', 'evaluadas', 'evaluados',
  'documentado', 'documentada', 'documentadas', 'documentados',
  'clasificado', 'clasificada', 'clasificadas', 'clasificados',
  'seleccionado', 'seleccionada', 'seleccionadas', 'seleccionados',
  'diferenciado', 'diferenciada', 'diferenciadas', 'diferenciados',
  'sido', 'siendo', 'tiene', 'tienen', 'tener', 'haber', 'hacer',
  'distintos', 'distintas', 'diferentes', 'principales', 'mismas', 'mismos',
  'partir', 'través', 'forma', 'modo', 'caso', 'casos', 'tipo', 'tipos',
]);

function topTerminos(moduleData, n = 10) {
  const conteo = new Map();
  moduleData.resultadosAprendizaje.forEach((ra) => {
    ra.criteriosEvaluacion.forEach((ce) => {
      ce.descripcion
        .toLowerCase()
        .replace(/[.,;:()¿?¡!"«»\-—/]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 6 && !STOPWORDS.has(w))
        .forEach((w) => conteo.set(w, (conteo.get(w) || 0) + 1));
    });
  });
  return [...conteo.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

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
      window.searchSuggestions?.setTerms?.(topTerminos(datos));
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
