# WebPC

PC virtual rodando 100% no navegador — apenas HTML, CSS e JavaScript puro (sem frameworks).

## Como testar

Abra `index.html` diretamente no navegador, ou rode um servidor local:

```
npx serve .
```
ou
```
python3 -m http.server 8080
```

## Estrutura

```
webpc/
├── index.html
├── css/
│   └── style.css        # todo o visual (tema claro/escuro, janelas, taskbar...)
└── js/
    ├── wm.js             # gerenciador de janelas (abrir, arrastar, minimizar, maximizar, fechar)
    ├── main.js            # desktop, ícones, menu iniciar, relógio
    └── apps/
        ├── filemanager.js # explorador de arquivos (sistema de arquivos simulado em localStorage)
        ├── notepad.js      # bloco de notas (lê/salva arquivos do explorador)
        ├── calculator.js   # calculadora
        ├── terminal.js     # terminal com comandos simples
        └── settings.js     # tema claro/escuro + papel de parede
```

## Como adicionar um novo app

Em `js/apps/`, crie um arquivo e registre:

```js
WebPC.apps.push({
  id: 'meuapp',
  name: 'Meu App',
  icon: '🚀',
  width: 400, height: 300,
  render(body, winApi) {
    body.innerHTML = '<p>Olá!</p>';
  }
});
```

Depois inclua o `<script>` do arquivo em `index.html` (antes de `main.js`).

## Dados salvos (localStorage)

- `webpc-theme` — tema claro/escuro
- `webpc-wallpaper` — papel de parede escolhido
- `webpc-fs` — sistema de arquivos simulado (Explorador)
- `webpc-notepad-autosave` — rascunho automático do Bloco de Notas
