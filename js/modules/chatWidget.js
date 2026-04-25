// Widget de chat con Claude Opus 4.7. Botón flotante (FAB) que solo aparece
// cuando hay módulo activo. Al abrirse pide el rol (profesor/alumno/familia).
// Conversaciones persistidas en localStorage por moduleId+rol.

const ROLES = [
  { id: 'profesor', label: 'Profesor', icon: 'fa-chalkboard-teacher' },
  { id: 'alumno', label: 'Alumno', icon: 'fa-user-graduate' },
  { id: 'familia', label: 'Familia', icon: 'fa-people-roof' },
];

const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.id, r.label]));
const STORAGE_PREFIX = 'chat_';
const ROLE_PREFIX = 'chatRole_';

export class ChatWidget {
  constructor() {
    this.moduleData = null;
    this.role = null;
    this.messages = [];
    this.streaming = false;

    this.fab = document.getElementById('chatFab');
    this.panel = document.getElementById('chatPanel');
    this.heading = document.getElementById('chatHeading');
    this.rolePicker = document.getElementById('chatRolePicker');
    this.body = document.getElementById('chatBody');
    this.messagesEl = document.getElementById('chatMessages');
    this.input = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('chatSendBtn');
    this.closeBtn = document.getElementById('chatCloseBtn');
    this.clearBtn = document.getElementById('chatClearBtn');
    this.changeRoleBtn = document.getElementById('chatChangeRoleBtn');
    this.currentRoleLabel = document.getElementById('chatCurrentRole');

    this.bindEvents();
  }

  bindEvents() {
    this.fab?.addEventListener('click', () => this.abrir());
    this.closeBtn?.addEventListener('click', () => this.cerrar());
    this.clearBtn?.addEventListener('click', () => this.limpiarConversacion());
    this.changeRoleBtn?.addEventListener('click', () => this.cambiarRol());
    this.sendBtn?.addEventListener('click', () => this.enviar());
    this.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.enviar();
      }
    });

    this.rolePicker?.querySelectorAll('button[data-role]').forEach((btn) => {
      btn.addEventListener('click', () => this.elegirRol(btn.dataset.role));
    });
  }

  setModule(moduleData) {
    this.moduleData = moduleData;
    if (!moduleData) {
      this.role = null;
      this.messages = [];
      this.cerrar();
      return;
    }
    this.role = sessionStorage.getItem(ROLE_PREFIX + moduleData.id) || null;
    this.messages = this.cargarConversacion();
    this.render();
  }

  abrir() {
    if (!this.moduleData) return;
    this.panel.classList.add('open');
    this.render();
    if (this.role) this.input.focus();
  }

  cerrar() {
    this.panel?.classList.remove('open');
  }

  cambiarRol() {
    this.role = null;
    if (this.moduleData) sessionStorage.removeItem(ROLE_PREFIX + this.moduleData.id);
    this.render();
  }

  elegirRol(role) {
    if (!ROLE_LABEL[role]) return;
    this.role = role;
    sessionStorage.setItem(ROLE_PREFIX + this.moduleData.id, role);
    this.messages = this.cargarConversacion();
    this.render();
    this.input.focus();
  }

  claveConversacion() {
    return `${STORAGE_PREFIX}${this.moduleData.id}_${this.role}`;
  }

  cargarConversacion() {
    if (!this.moduleData || !this.role) return [];
    try {
      return JSON.parse(localStorage.getItem(this.claveConversacion()) || '[]');
    } catch {
      return [];
    }
  }

  guardarConversacion() {
    if (!this.moduleData || !this.role) return;
    localStorage.setItem(this.claveConversacion(), JSON.stringify(this.messages));
  }

  async limpiarConversacion() {
    if (this.messages.length === 0) return;
    const respuesta = await Swal.fire({
      icon: 'warning',
      title: '¿Limpiar conversación?',
      text: 'Se perderán los mensajes con el asistente para este módulo y rol.',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2196F3',
      background: '#2d2d2d',
      color: '#fff',
    });
    if (!respuesta.isConfirmed) return;
    this.messages = [];
    this.guardarConversacion();
    this.render();
  }

  render() {
    if (!this.moduleData) {
      if (this.fab) this.fab.style.display = 'none';
      this.cerrar();
      return;
    }
    if (this.fab) this.fab.style.display = '';
    this.heading.textContent = `Asistente · ${this.moduleData.abreviatura}`;

    if (!this.role) {
      this.rolePicker.style.display = '';
      this.body.style.display = 'none';
      return;
    }

    this.rolePicker.style.display = 'none';
    this.body.style.display = '';
    this.currentRoleLabel.textContent = ROLE_LABEL[this.role];
    this.renderMensajes();
  }

  renderMensajes() {
    this.messagesEl.innerHTML = '';
    if (this.messages.length === 0) {
      const intro = document.createElement('div');
      intro.className = 'chat-intro';
      intro.innerHTML = `Hola. Pregúntame lo que quieras sobre <strong>${this.escapar(this.moduleData.nombre)}</strong>.`;
      this.messagesEl.appendChild(intro);
      return;
    }
    this.messages.forEach((m) => this.appendMensaje(m.role, m.content));
    this.scrollAlFinal();
  }

  appendMensaje(role, contenido) {
    const burbuja = document.createElement('div');
    burbuja.className = `chat-msg chat-msg-${role}`;
    burbuja.textContent = contenido;
    this.messagesEl.appendChild(burbuja);
    this.scrollAlFinal();
    return burbuja;
  }

  scrollAlFinal() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  escapar(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async enviar() {
    if (this.streaming || !this.role || !this.moduleData) return;
    const texto = this.input.value.trim();
    if (!texto) return;

    this.input.value = '';
    this.messages.push({ role: 'user', content: texto });
    this.appendMensaje('user', texto);

    const burbujaAsistente = this.appendMensaje('assistant', '');
    burbujaAsistente.classList.add('streaming');
    this.streaming = true;
    this.sendBtn.disabled = true;

    let textoAsistente = '';

    try {
      const res = await fetch('/.netlify/functions/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: this.role,
          moduleData: this.moduleData,
          messages: this.messages,
        }),
      });

      if (!res.ok) {
        const detalle = await res.json().catch(() => ({}));
        throw new Error(detalle.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const partes = buffer.split('\n\n');
        buffer = partes.pop();

        for (const parte of partes) {
          if (!parte.startsWith('data: ')) continue;
          let data;
          try {
            data = JSON.parse(parte.slice(6));
          } catch {
            continue;
          }
          if (data.type === 'delta') {
            textoAsistente += data.text;
            burbujaAsistente.textContent = textoAsistente;
            this.scrollAlFinal();
          } else if (data.type === 'error') {
            throw new Error(data.message);
          } else if (data.type === 'done' && data.usage) {
            console.log('Chat usage:', data.usage);
          }
        }
      }

      if (!textoAsistente) throw new Error('Respuesta vacía del asistente');
      this.messages.push({ role: 'assistant', content: textoAsistente });
      this.guardarConversacion();
    } catch (err) {
      console.error('Error en chat:', err);
      burbujaAsistente.classList.add('error');
      burbujaAsistente.textContent = `Error: ${err.message}`;
      // Quita el último mensaje de usuario para que pueda reintentar.
      this.messages.pop();
    } finally {
      burbujaAsistente.classList.remove('streaming');
      this.streaming = false;
      this.sendBtn.disabled = false;
      this.input.focus();
    }
  }
}
