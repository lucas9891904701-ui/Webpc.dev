/* ================= CONFIGURAÇÕES ================= */

const WALLPAPERS = [
  { name: 'Azul', c1: '#1e3c72', c2: '#2a5298' },
  { name: 'Roxo', c1: '#5f2c82', c2: '#49a09d' },
  { name: 'Pôr do sol', c1: '#ee9ca7', c2: '#ffdde1' },
  { name: 'Verde', c1: '#134e5e', c2: '#71b280' },
  { name: 'Escuro', c1: '#232526', c2: '#414345' }
];

WebPC.apps.push({
  id: 'settings',
  name: 'Configurações',
  icon: '⚙️',
  width: 420, height: 420,
  render(body) {
    const theme = localStorage.getItem('webpc-theme') || 'dark';
    const wallpaperIdx = parseInt(localStorage.getItem('webpc-wallpaper') || '0', 10);

    body.innerHTML = `
      <div class="app-settings">
        <div class="settings-row">
          <span>Modo escuro</span>
          <label class="switch">
            <input type="checkbox" class="theme-toggle" ${theme === 'dark' ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:10px;">
          <span>Papel de parede</span>
          <div class="wallpaper-options"></div>
        </div>
        <div class="settings-row">
          <span>Limpar dados salvos (arquivos, notas, tema)</span>
          <button class="btn-reset" style="padding:8px 12px;border-radius:6px;cursor:pointer;">Limpar</button>
        </div>
      </div>
    `;

    const toggle = body.querySelector('.theme-toggle');
    toggle.onchange = () => {
      const t = toggle.checked ? 'dark' : 'light';
      document.body.dataset.theme = t;
      localStorage.setItem('webpc-theme', t);
    };

    const wallpaperBox = body.querySelector('.wallpaper-options');
    WALLPAPERS.forEach((wp, i) => {
      const el = document.createElement('div');
      el.className = 'wallpaper-swatch' + (i === wallpaperIdx ? ' selected' : '');
      el.style.background = `linear-gradient(135deg, ${wp.c1}, ${wp.c2})`;
      el.title = wp.name;
      el.onclick = () => {
        document.documentElement.style.setProperty('--wallpaper-1', wp.c1);
        document.documentElement.style.setProperty('--wallpaper-2', wp.c2);
        localStorage.setItem('webpc-wallpaper', i);
        wallpaperBox.querySelectorAll('.wallpaper-swatch').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
      };
      wallpaperBox.appendChild(el);
    });

    body.querySelector('.btn-reset').onclick = () => {
      if (confirm('Isso vai apagar todos os arquivos, notas e preferências salvas. Continuar?')) {
        localStorage.clear();
        location.reload();
      }
    };
  }
});
