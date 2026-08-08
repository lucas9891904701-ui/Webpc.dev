/* ================= TERMINAL =================
   Interpreta comandos simples. Fácil de estender:
   basta adicionar uma entrada no objeto `commands`.
=============================================== */

WebPC.apps.push({
  id: 'terminal',
  name: 'Terminal',
  icon: '💻',
  width: 560, height: 360,
  render(body) {
    body.innerHTML = `
      <div class="app-terminal">
        <div class="term-output"></div>
        <div class="term-input-line">
          <span class="term-prompt">webpc&gt;</span>
          <input type="text" class="term-input" autocomplete="off" spellcheck="false" />
        </div>
      </div>
    `;

    const output = body.querySelector('.term-output');
    const input = body.querySelector('.term-input');

    function print(text) {
      const line = document.createElement('div');
      line.className = 'term-line';
      line.textContent = text;
      output.appendChild(line);
      body.scrollTop = body.scrollHeight;
    }

    const commands = {
      help: () => 'Comandos: help, date, clear, echo [texto], whoami, ls, calc [expressão], theme [dark|light], about',
      date: () => new Date().toLocaleString('pt-BR'),
      whoami: () => 'usuario@webpc',
      about: () => 'WebPC v1.0 - PC virtual feito com HTML, CSS e JavaScript puro.',
      ls: () => {
        const fs = WebPC._fs.load();
        return fs.children.map(c => (c.type === 'folder' ? c.name + '/' : c.name)).join('   ') || '(vazio)';
      },
      echo: (args) => args.join(' '),
      clear: () => { output.innerHTML = ''; return null; },
      calc: (args) => {
        const expr = args.join(' ');
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) return 'Expressão inválida';
        try {
          // eslint-disable-next-line no-new-func
          return String(Function(`"use strict"; return (${expr})`)());
        } catch (e) {
          return 'Erro ao calcular';
        }
      },
      theme: (args) => {
        const t = args[0];
        if (t !== 'dark' && t !== 'light') return 'Use: theme dark | theme light';
        document.body.dataset.theme = t;
        localStorage.setItem('webpc-theme', t);
        return `Tema alterado para ${t}`;
      }
    };

    function run(line) {
      print('webpc> ' + line);
      const parts = line.trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return;
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      if (commands[cmd]) {
        const result = commands[cmd](args);
        if (result !== null && result !== undefined) print(result);
      } else {
        print(`Comando não encontrado: ${cmd} (digite "help")`);
      }
    }

    print('WebPC Terminal - digite "help" para ver os comandos.');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        run(val);
      }
    });

    setTimeout(() => input.focus(), 100);
  }
});
