/* ================= CALCULADORA ================= */

WebPC.apps.push({
  id: 'calculator',
  name: 'Calculadora',
  icon: '🧮',
  width: 300, height: 420,
  render(body) {
    body.innerHTML = `
      <div class="app-calc">
        <div class="calc-display">0</div>
        <div class="calc-grid">
          <button class="clear" data-a="clear">C</button>
          <button data-a="sign">±</button>
          <button data-a="percent">%</button>
          <button class="op" data-a="op" data-op="/">÷</button>

          <button data-n="7">7</button>
          <button data-n="8">8</button>
          <button data-n="9">9</button>
          <button class="op" data-a="op" data-op="*">×</button>

          <button data-n="4">4</button>
          <button data-n="5">5</button>
          <button data-n="6">6</button>
          <button class="op" data-a="op" data-op="-">−</button>

          <button data-n="1">1</button>
          <button data-n="2">2</button>
          <button data-n="3">3</button>
          <button class="op" data-a="op" data-op="+">+</button>

          <button data-n="0" style="grid-column: span 2;">0</button>
          <button data-a="dot">.</button>
          <button class="eq" data-a="eq">=</button>
        </div>
      </div>
    `;

    const display = body.querySelector('.calc-display');
    let current = '0';
    let previous = null;
    let operator = null;
    let resetNext = false;

    function updateDisplay() {
      display.textContent = current;
    }

    function inputNumber(n) {
      if (current === '0' || resetNext) {
        current = n;
        resetNext = false;
      } else {
        current += n;
      }
      updateDisplay();
    }

    function inputDot() {
      if (resetNext) { current = '0'; resetNext = false; }
      if (!current.includes('.')) current += '.';
      updateDisplay();
    }

    function compute(a, b, op) {
      a = parseFloat(a); b = parseFloat(b);
      switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? 0 : a / b;
        default: return b;
      }
    }

    function setOperator(op) {
      if (operator && !resetNext) {
        current = String(compute(previous, current, operator));
      }
      previous = current;
      operator = op;
      resetNext = true;
      updateDisplay();
    }

    function equals() {
      if (operator == null) return;
      current = String(compute(previous, current, operator));
      operator = null;
      previous = null;
      resetNext = true;
      updateDisplay();
    }

    body.querySelectorAll('[data-n]').forEach(btn => {
      btn.onclick = () => inputNumber(btn.dataset.n);
    });

    body.querySelectorAll('[data-a]').forEach(btn => {
      btn.onclick = () => {
        const a = btn.dataset.a;
        if (a === 'clear') { current = '0'; previous = null; operator = null; resetNext = false; updateDisplay(); }
        else if (a === 'sign') { current = String(parseFloat(current) * -1); updateDisplay(); }
        else if (a === 'percent') { current = String(parseFloat(current) / 100); updateDisplay(); }
        else if (a === 'dot') { inputDot(); }
        else if (a === 'op') { setOperator(btn.dataset.op); }
        else if (a === 'eq') { equals(); }
      };
    });
  }
});
