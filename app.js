/* =============================================
   CARNICERÍA — CALCULADORA DE PRECIOS
   app.js
   ============================================= */

/* --- Estado global --- */
let margen = 30;
let modoActual = 'A';
let costoKiloCalculado = 0;

/* --- Referencias al DOM --- */
const costoEl          = document.getElementById('costo');
const margenCustomEl   = document.getElementById('margenCustom');
const precioVentaEl    = document.getElementById('precioVenta');
const inputDineroEl    = document.getElementById('inputDinero');
const inputGramosEl    = document.getElementById('inputGramos');
const resultAEl        = document.getElementById('resultA');
const resultBEl        = document.getElementById('resultB');
const modoAEl          = document.getElementById('modoA');
const modoBEl          = document.getElementById('modoB');
const tabAEl           = document.getElementById('tabA');
const tabBEl           = document.getElementById('tabB');
const marginBtns       = document.querySelectorAll('.margin-btn');
const clearBtn         = document.getElementById('clearBtn');
const totalKilosEl     = document.getElementById('totalKilos');
const totalCostoEl     = document.getElementById('totalCosto');
const costoKiloCalcEl  = document.getElementById('costoKiloCalc');
const applyBtn         = document.getElementById('applyBtn');
const applyFlash       = document.getElementById('applyFlash');
const convToggle       = document.getElementById('convToggle');
const convBody         = document.getElementById('convBody');
const convChevron      = document.getElementById('convChevron');

/* -----------------------------------------------
   CONVERSIÓN RÁPIDA
----------------------------------------------- */

/* Abrir / cerrar sección */
convToggle.addEventListener('click', toggleConvRapida);
convToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') toggleConvRapida();
});

function toggleConvRapida() {
  const estaAbierta = convBody.style.display !== 'none';
  convBody.style.display = estaAbierta ? 'none' : 'block';
  convChevron.classList.toggle('open', !estaAbierta);
  convToggle.setAttribute('aria-expanded', String(!estaAbierta));
}

/* Calcular costo por kilo desde totales */
function calcConvRapida() {
  const kilos = parseFloat(totalKilosEl.value) || 0;
  const costo = parseFloat(totalCostoEl.value) || 0;

  if (kilos > 0 && costo > 0) {
    costoKiloCalculado = costo / kilos;
    costoKiloCalcEl.textContent = '$' + costoKiloCalculado.toFixed(2);
    costoKiloCalcEl.classList.remove('zero');
    applyBtn.disabled = false;
  } else {
    costoKiloCalculado = 0;
    costoKiloCalcEl.textContent = '$—';
    costoKiloCalcEl.classList.add('zero');
    applyBtn.disabled = true;
  }
}

totalKilosEl.addEventListener('input', calcConvRapida);
totalCostoEl.addEventListener('input', calcConvRapida);

/* Aplicar el precio calculado */
applyBtn.addEventListener('click', () => {
  if (costoKiloCalculado <= 0) return;

  costoEl.value = costoKiloCalculado.toFixed(2);
  updatePrecioVenta();

  applyFlash.textContent = '✓ Precio aplicado';
  setTimeout(() => { applyFlash.textContent = ''; }, 2000);

  /* Colapsar la sección */
  convBody.style.display = 'none';
  convChevron.classList.remove('open');
  convToggle.setAttribute('aria-expanded', 'false');
});

/* -----------------------------------------------
   MARGEN DE GANANCIA
----------------------------------------------- */

function setMargen(valor, desdeCustom) {
  margen = valor;
  marginBtns.forEach(btn => {
    const activo = !desdeCustom && parseInt(btn.dataset.val) === valor;
    btn.classList.toggle('active', activo);
  });
  updatePrecioVenta();
}

marginBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    margenCustomEl.value = '';
    setMargen(parseInt(btn.dataset.val), false);
  });
});

margenCustomEl.addEventListener('input', () => {
  const v = parseFloat(margenCustomEl.value);
  if (!isNaN(v) && v > 0 && v < 100) {
    setMargen(v, true);
  }
});

/* -----------------------------------------------
   PRECIO DE VENTA
----------------------------------------------- */

function getPrecioVenta() {
  const costo = parseFloat(costoEl.value) || 0;
  if (costo <= 0) return 0;
  /* Fórmula de margen sobre precio de venta: costo / (1 - margen%) */
  return costo / (1 - margen / 100);
}

function formatPesos(valor) {
  return '$' + valor.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updatePrecioVenta() {
  const pv = getPrecioVenta();
  if (pv <= 0) {
    precioVentaEl.textContent = '$—';
    precioVentaEl.classList.add('zero');
  } else {
    precioVentaEl.textContent = formatPesos(pv);
    precioVentaEl.classList.remove('zero');
  }
  calcular();
}

costoEl.addEventListener('input', updatePrecioVenta);

/* -----------------------------------------------
   CÁLCULO PRINCIPAL
----------------------------------------------- */

function calcular() {
  const pv = getPrecioVenta();

  if (modoActual === 'A') {
    /* Dinero → Gramos */
    const dinero = parseFloat(inputDineroEl.value) || 0;
    if (pv > 0 && dinero > 0) {
      const gramos = Math.round((dinero / pv) * 1000);
      mostrarResultado(resultAEl, gramos.toLocaleString('es-MX'), 'gramos');
    } else {
      limpiarResultado(resultAEl, 'gramos');
    }
  } else {
    /* Gramos → Dinero */
    const gramos = parseFloat(inputGramosEl.value) || 0;
    if (pv > 0 && gramos > 0) {
      const cobrar = (pv * gramos) / 1000;
      mostrarResultado(resultBEl, formatPesos(cobrar), 'pesos');
    } else {
      limpiarResultado(resultBEl, 'pesos');
    }
  }
}

function mostrarResultado(tarjeta, valor, unidad) {
  tarjeta.classList.remove('empty');
  tarjeta.querySelector('.result-value').textContent = valor;
  tarjeta.querySelector('.result-unit').textContent = unidad;
}

function limpiarResultado(tarjeta, unidad) {
  tarjeta.classList.add('empty');
  tarjeta.querySelector('.result-value').textContent = '—';
  tarjeta.querySelector('.result-unit').textContent = unidad;
}

inputDineroEl.addEventListener('input', calcular);
inputGramosEl.addEventListener('input', calcular);

/* -----------------------------------------------
   TABS DE MODO
----------------------------------------------- */

tabAEl.addEventListener('click', () => activarModo('A'));
tabBEl.addEventListener('click', () => activarModo('B'));

function activarModo(modo) {
  modoActual = modo;
  const esA = modo === 'A';

  tabAEl.classList.toggle('active', esA);
  tabAEl.setAttribute('aria-selected', String(esA));
  tabBEl.classList.toggle('active', !esA);
  tabBEl.setAttribute('aria-selected', String(!esA));

  modoAEl.hidden = !esA;
  modoBEl.hidden = esA;

  calcular();
}

/* -----------------------------------------------
   BOTÓN LIMPIAR
----------------------------------------------- */

clearBtn.addEventListener('click', limpiarTodo);

function limpiarTodo() {
  /* Inputs */
  costoEl.value        = '';
  margenCustomEl.value = '';
  inputDineroEl.value  = '';
  inputGramosEl.value  = '';
  totalKilosEl.value   = '';
  totalCostoEl.value   = '';

  /* Conversión rápida */
  costoKiloCalculado = 0;
  costoKiloCalcEl.textContent = '$—';
  costoKiloCalcEl.classList.add('zero');
  applyBtn.disabled = true;

  /* Margen */
  margen = 30;
  marginBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === '30');
  });

  /* Precio venta */
  precioVentaEl.textContent = '$—';
  precioVentaEl.classList.add('zero');

  /* Resultados */
  limpiarResultado(resultAEl, 'gramos');
  limpiarResultado(resultBEl, 'pesos');
}
