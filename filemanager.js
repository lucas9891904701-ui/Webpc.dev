/* ================= EXPLORADOR DE ARQUIVOS =================
   Sistema de arquivos simulado, salvo em localStorage.
============================================================ */

const FS_KEY = 'webpc-fs';

function fsDefault() {
  return {
    name: 'Raiz', type: 'folder',
    children: [
      { name: 'Documentos', type: 'folder', children: [
        { name: 'bem-vindo.txt', type: 'file', content: 'Bem-vindo ao WebPC!\n\nEste é um arquivo de exemplo.\nAbra com o Bloco de Notas para editar.' }
      ]},
      { name: 'Imagens', type: 'folder', children: [] }
    ]
  };
}

function fsLoad() {
  try {
    const raw = localStorage.getItem(FS_KEY);
    return raw ? JSON.parse(raw) : fsDefault();
  } catch (e) {
    return fsDefault();
  }
}

function fsSave(fs) {
  localStorage.setItem(FS_KEY, JSON.stringify(fs));
}

function fsFindFolder(fs, path) {
  let node = fs;
  for (const name of path) {
    node = node.children.find(c => c.name === name && c.type === 'folder');
    if (!node) return fs;
  }
  return node;
}

WebPC.apps.push({
  id: 'files',
  name: 'Explorador',
  icon: '📁',
  width: 560, height: 400,
  render(body) {
    let fs = fsLoad();
    let path = [];

    body.innerHTML = `
      <div class="app-files">
        <div class="files-toolbar">
          <button class="btn-back">⬅</button>
          <button class="btn-new-folder">+ Pasta</button>
          <button class="btn-new-file">+ Arquivo</button>
          <span class="files-path"></span>
        </div>
        <div class="files-grid"></div>
      </div>
    `;

    const grid = body.querySelector('.files-grid');
    const pathEl = body.querySelector('.files-path');

    function render() {
      fs = fsLoad();
      const folder = fsFindFolder(fs, path);
      pathEl.textContent = '/' + path.join('/');
      grid.innerHTML = '';
      folder.children
        .slice()
        .sort((a, b) => (a.type === b.type) ? a.name.localeCompare(b.name) : (a.type === 'folder' ? -1 : 1))
        .forEach(item => {
          const el = document.createElement('div');
          el.className = 'file-item';
          el.innerHTML = `<span class="icon-emoji">${item.type === 'folder' ? '📁' : '📄'}</span><span>${item.name}</span>`;
          el.ondblclick = () => {
            if (item.type === 'folder') {
              path.push(item.name);
              render();
            } else {
              WebPC.openNotepadWithFile(path.slice(), item.name);
            }
          };
          el.oncontextmenu = (e) => {
            e.preventDefault();
            if (confirm(`Excluir "${item.name}"?`)) {
              folder.children = folder.children.filter(c => c !== item);
              fsSave(fs);
              render();
            }
          };
          grid.appendChild(el);
        });
    }

    body.querySelector('.btn-back').onclick = () => {
      if (path.length) { path.pop(); render(); }
    };
    body.querySelector('.btn-new-folder').onclick = () => {
      const name = prompt('Nome da pasta:');
      if (!name) return;
      const folder = fsFindFolder(fs, path);
      folder.children.push({ name, type: 'folder', children: [] });
      fsSave(fs);
      render();
    };
    body.querySelector('.btn-new-file').onclick = () => {
      const name = prompt('Nome do arquivo (.txt):', 'novo.txt');
      if (!name) return;
      const folder = fsFindFolder(fs, path);
      folder.children.push({ name, type: 'file', content: '' });
      fsSave(fs);
      render();
    };

    render();
  }
});

// Helper global usado pelo explorador para abrir arquivos no bloco de notas
WebPC.openNotepadWithFile = function (path, fileName) {
  wm.open('notepad');
  setTimeout(() => {
    const evt = new CustomEvent('webpc-open-file', { detail: { path, fileName } });
    document.dispatchEvent(evt);
  }, 50);
};

WebPC._fs = { load: fsLoad, save: fsSave, findFolder: fsFindFolder };
