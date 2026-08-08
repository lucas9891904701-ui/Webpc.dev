/* ================= BLOCO DE NOTAS ================= */

const NOTEPAD_AUTOSAVE_KEY = 'webpc-notepad-autosave';

WebPC.apps.push({
  id: 'notepad',
  name: 'Bloco de Notas',
  icon: '📝',
  width: 520, height: 420,
  render(body, winApi) {
    body.innerHTML = `
      <div class="app-notepad">
        <div class="app-toolbar">
          <button class="np-new">Novo</button>
          <button class="np-save">Salvar</button>
          <span class="np-filename" style="align-self:center;font-size:12px;opacity:.7;"></span>
        </div>
        <textarea placeholder="Digite aqui..."></textarea>
      </div>
    `;

    const textarea = body.querySelector('textarea');
    const filenameEl = body.querySelector('.np-filename');
    let currentFile = null; // { path, fileName }

    // Restaura rascunho automático se existir
    textarea.value = localStorage.getItem(NOTEPAD_AUTOSAVE_KEY) || '';
    textarea.addEventListener('input', () => {
      localStorage.setItem(NOTEPAD_AUTOSAVE_KEY, textarea.value);
    });

    function updateTitle() {
      const name = currentFile ? currentFile.fileName : 'sem título';
      filenameEl.textContent = name;
      winApi.setTitle(`Bloco de Notas - ${name}`);
    }

    body.querySelector('.np-new').onclick = () => {
      currentFile = null;
      textarea.value = '';
      updateTitle();
    };

    body.querySelector('.np-save').onclick = () => {
      if (currentFile) {
        const fs = WebPC._fs.load();
        const folder = WebPC._fs.findFolder(fs, currentFile.path);
        const fileNode = folder.children.find(c => c.name === currentFile.fileName && c.type === 'file');
        if (fileNode) {
          fileNode.content = textarea.value;
          WebPC._fs.save(fs);
          alert('Arquivo salvo!');
          return;
        }
      }
      // Sem arquivo associado: salva na raiz do explorador
      const name = prompt('Salvar como (nome do arquivo):', 'novo.txt');
      if (!name) return;
      const fs = WebPC._fs.load();
      fs.children.push({ name, type: 'file', content: textarea.value });
      WebPC._fs.save(fs);
      currentFile = { path: [], fileName: name };
      updateTitle();
      alert('Arquivo salvo!');
    };

    // Recebe pedido do Explorador para abrir um arquivo específico
    document.addEventListener('webpc-open-file', function handler(e) {
      const { path, fileName } = e.detail;
      const fs = WebPC._fs.load();
      const folder = WebPC._fs.findFolder(fs, path);
      const fileNode = folder.children.find(c => c.name === fileName && c.type === 'file');
      if (fileNode) {
        currentFile = { path, fileName };
        textarea.value = fileNode.content || '';
        updateTitle();
      }
    });

    updateTitle();
  }
});
