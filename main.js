/* ================= MAIN =================
   Inicializa desktop, ícones, menu iniciar e relógio.
=========================================== */

document.addEventListener('DOMContentLoaded', () => {
  applySavedPreferences();
  buildDesktopIcons();
  buildStartMenu();
  wireStartButton();
  startClock();
});

function applySavedPreferences() {
  const theme = localStorage.getItem('webpc-theme') || 'dark';
  document.body.dataset.theme = theme;

  const wpIdx = localStorage.getItem('webpc-wallpaper');
  if (wpIdx !== null && WALLPAPERS && WALLPAPERS[wpIdx]) {
    const wp = WALLPAPERS[wpIdx];
    document.documentElement.style.setProperty('--wallpaper-1', wp.c1);
    document.documentElement.style.setProperty('--wallpaper-2', wp.c2);
  }
}

function buildDesktopIcons() {
  const container = document.getElementById('icons');
  container.innerHTML = '';
  WebPC.apps.forEach(app => {
    const el = document.createElement('div');
    el.className = 'desktop-icon';
    el.innerHTML = `<span class="icon-emoji">${app.icon}</span><span class="icon-label">${app.name}</span>`;
    el.addEventListener('dblclick', () => wm.open(app.id));

    // suporte a toque duplo em celulares
    let lastTap = 0;
    el.addEventListener('touchend', () => {
      const now = Date.now();
      if (now - lastTap < 350) wm.open(app.id);
      lastTap = now;
    });

    container.appendChild(el);
  });
}

function buildStartMenu() {
  const list = document.getElementById('start-apps');
  list.innerHTML = '';
  WebPC.apps.forEach(app => {
    const item = document.createElement('div');
    item.className = 'start-app-item';
    item.innerHTML = `<span class="icon-emoji">${app.icon}</span><span>${app.name}</span>`;
    item.onclick = () => {
      wm.open(app.id);
      toggleStartMenu(false);
    };
    list.appendChild(item);
  });
}

function wireStartButton() {
  const btn = document.getElementById('start-btn');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
      toggleStartMenu(false);
    }
  });
}

function toggleStartMenu(force) {
  const menu = document.getElementById('start-menu');
  const shouldShow = force !== undefined ? force : menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !shouldShow);
}

function startClock() {
  const clockEl = document.getElementById('clock');
  function update() {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('pt-BR');
    clockEl.innerHTML = `${time}<br>${date}`;
  }
  update();
  setInterval(update, 1000 * 10);
}
