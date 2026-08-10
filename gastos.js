/* ─── AutoCare · Gastos ───────────────────────────────────────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  renderGastos();
});

function renderGastos() {
  const records = DB.getRecords();
  const total   = records.reduce((s, r) => s + (Number(r.costo) || 0), 0);

  // KPI total
  const elTotal = document.getElementById('gasto-total');
  if (elTotal) elTotal.textContent = fmtMoney(total);

  // Por tipo
  const byTipo = {};
  records.forEach(r => {
    if (!r.costo) return;
    byTipo[r.tipo] = (byTipo[r.tipo] || 0) + Number(r.costo);
  });

  const list = document.getElementById('gastos-by-tipo');
  if (list) {
    if (Object.keys(byTipo).length === 0) {
      list.innerHTML = '<p class="muted" style="font-size:.85rem">Aún no hay gastos registrados.</p>';
    } else {
      const sorted = Object.entries(byTipo).sort((a, b) => b[1] - a[1]);
      const max = sorted[0][1];
      list.innerHTML = sorted.map(([tipo, monto]) => {
        const info = getMantenimientoInfo(tipo);
        const pct  = Math.round((monto / total) * 100);
        const barW = Math.round((monto / max) * 100);
        return `
          <div class="gasto-row">
            <div class="gasto-head">
              <span>${info.icon} ${info.label}</span>
              <span class="gasto-monto">${fmtMoney(monto)} <small class="muted">(${pct}%)</small></span>
            </div>
            <div class="gasto-bar-bg">
              <div class="gasto-bar-fill" style="width:${barW}%"></div>
            </div>
          </div>`;
      }).join('');
    }
  }

  // Últimos 6 servicios por mes
  renderMensual(records);
}

function renderMensual(records) {
  const container = document.getElementById('chart-mensual');
  if (!container) return;

  const byMonth = {};
  records.forEach(r => {
    if (!r.fecha || !r.costo) return;
    const key = r.fecha.slice(0, 7); // YYYY-MM
    byMonth[key] = (byMonth[key] || 0) + Number(r.costo);
  });

  const sorted = Object.entries(byMonth).sort().slice(-6);
  if (sorted.length === 0) {
    container.innerHTML = '<p class="muted" style="font-size:.85rem;text-align:center">Sin datos mensuales aún.</p>';
    return;
  }

  const maxVal = Math.max(...sorted.map(([,v]) => v));

  container.innerHTML = `
    <div class="bar-chart">
      ${sorted.map(([mes, val]) => {
        const h = Math.max(8, Math.round((val / maxVal) * 100));
        const [y, m] = mes.split('-');
        const label = new Date(y, m - 1).toLocaleDateString('es-SV', { month: 'short' });
        return `
          <div class="bar-col">
            <div class="bar-val">${fmtMoney(val).replace('$ ','$')}</div>
            <div class="bar-wrap">
              <div class="bar-fill" style="height:${h}%"></div>
            </div>
            <div class="bar-label">${label}</div>
          </div>`;
      }).join('')}
    </div>`;
}
