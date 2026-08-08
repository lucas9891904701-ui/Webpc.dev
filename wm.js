/* ================= WINDOW MANAGER =================
   Cria, arrasta, minimiza, maximiza e fecha janelas.
   Cada app é registrado em WebPC.apps e renderizado
   dentro de uma janela via app.render(bodyEl, winApi)
===================================================== */

window.WebPC = window.WebPC || { apps: [] };

class WindowManager {
  constructor() {
    this.layer = document.getElementById('windows-layer');
    this.taskbarApps = document.getElementById('taskbar-apps');
    this.windows = new Map(); // id -> {el, app, minimized}
    this.zTop = 100;
    this.counter = 0;
  }

  registerApp(app) {
    WebPC.apps.push(app);
  }

  open(appId) {
    const app = WebPC.apps.find(a => a.id === appId);
    if (!app) return;

    // Se já está aberto e não permite múltiplas instâncias, foca nele
    if (!app.multiInstance) {
      const existing = [...this.windows.values()].find(w => w.app.id === appId);
      if (existing) {
        this.restore(existing.winId);
        this.focus(existing.winId);
        return;
      }
    }

    const winId = 'win-' + (++this.counter);
    const win = document.createElement('div');
    win.className = 'window';
    win.style.width = (app.width || 480) + 'px';
    win.style.height = (app.height || 360) + 'px';
    win.style.left = (40 + (this.counter % 6) * 30) + 'px';
    win.style.top = (40 + (this.counter % 6) * 26) + 'px';
    win.dataset.winId = winId;

    win.innerHTML = `
      <div class="window-header">
        <div class="window-title"><span>${app.icon}</span><span>${app.name}</span></div>
        <div class="window-controls">
          <button class="win-btn min" title="Minimizar">─</button>
          <button class="win-btn max" title="Maximizar">▢</button>
          <button class="win-btn close" title="Fechar">✕</button>
        </div>
      </div>
      <div class="window-body"></div>
    `;

    this.layer.appendChild(win);
    const body = win.querySelector('.window-body');

    const winApi = {
      close: () => this.close(winId),
      setTitle: (t) => { win.querySelector('.window-title span:last-child').textContent = t; }
    };

    if (app.render) app.render(body, winApi);

    this.windows.set(winId, { el: win, app, minimized: false });

    this._makeDraggable(win);
    this._wireControls(win, winId);
    this._addTaskbarBtn(winId, app);

    win.addEventListener('mousedown', () => this.focus(winId));
    this.focus(winId);
  }

  _wireControls(win, winId) {
    win.querySelector('.win-btn.close').onclick = () => this.close(winId);
    win.querySelector('.win-btn.min').onclick = () => this.minimize(winId);
    win.querySelector('.win-btn.max').onclick = () => this.toggleMaximize(winId);
    win.querySelector('.window-header').ondblclick = (e) => {
      if (e.target.closest('.window-controls')) return;
      this.toggleMaximize(winId);
    };
  }

  _makeDraggable(win) {
    const header = win.querySelector('.window-header');
    let offX, offY, dragging = false;

    const start = (clientX, clientY) => {
      if (win.classList.contains('maximized')) return;
      dragging = true;
      const rect = win.getBoundingClientRect();
      offX = clientX - rect.left;
      offY = clientY - rect.top;
    };
    const move = (clientX, clientY) => {
      if (!dragging) return;
      let x = clientX - offX;
      let y = clientY - offY;
      y = Math.max(0, y);
      win.style.left = x + 'px';
      win.style.top = y + 'px';
    };
    const end = () => dragging = false;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return;
      start(e.clientX, e.clientY);
    });
    document.addEventListener('mousemove', (e) => move(e.clientX, e.clientY));
    document.addEventListener('mouseup', end);

    header.addEventListener('touchstart', (e) => {
      if (e.target.closest('.window-controls')) return;
      const t = e.touches[0];
      start(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchend', end);
  }

  _addTaskbarBtn(winId, app) {
    const btn = document.createElement('button');
    btn.className = 'taskbar-app-btn';
    btn.dataset.winId = winId;
    btn.innerHTML = `<span>${app.icon}</span><span>${app.name}</span>`;
    btn.onclick = () => {
      const w = this.windows.get(winId);
      if (!w) return;
      if (w.minimized) {
        this.restore(winId);
        this.focus(winId);
      } else if (w.el.classList.contains('focused')) {
        this.minimize(winId);
      } else {
        this.focus(winId);
      }
    };
    this.taskbarApps.appendChild(btn);
  }

  focus(winId) {
    for (const [id, w] of this.windows) {
      w.el.classList.toggle('focused', id === winId);
      w.el.style.zIndex = id === winId ? ++this.zTop : w.el.style.zIndex;
    }
    document.querySelectorAll('.taskbar-app-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.winId === winId);
    });
  }

  minimize(winId) {
    const w = this.windows.get(winId);
    if (!w) return;
    w.el.style.display = 'none';
    w.minimized = true;
  }

  restore(winId) {
    const w = this.windows.get(winId);
    if (!w) return;
    w.el.style.display = 'flex';
    w.minimized = false;
  }

  toggleMaximize(winId) {
    const w = this.windows.get(winId);
    if (!w) return;
    const el = w.el;
    if (el.classList.contains('maximized')) {
      el.classList.remove('maximized');
      const s = el.dataset.prevStyle ? JSON.parse(el.dataset.prevStyle) : null;
      if (s) Object.assign(el.style, s);
    } else {
      el.dataset.prevStyle = JSON.stringify({
        left: el.style.left, top: el.style.top,
        width: el.style.width, height: el.style.height
      });
      el.classList.add('maximized');
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.width = '100%';
      el.style.height = '100%';
    }
  }

  close(winId) {
    const w = this.windows.get(winId);
    if (!w) return;
    w.el.remove();
    this.windows.delete(winId);
    const btn = this.taskbarApps.querySelector(`[data-win-id="${winId}"]`);
    if (btn) btn.remove();
  }
}

const wm = new WindowManager();
