/* ─── AutoCare · Historial ────────────────────────────────────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  renderHistorial();

  document.getElementById('filter-tipo')?.addEventListener('change', renderHistorial);
  document.getElementById('filter-sort')?.addEventListener('change', renderHistorial);
});

function renderHistorial() {
  const container = document.getElementById('historial-list');
  if (!container) return;

  let records = DB.getRecords();
  const filtroTipo = document.getElementById('filter-tipo')?.value || '';
  const filtroSort = document.getElementById('filter-sort')?.value || 'km-desc';

  if (filtroTipo) records = records.filter(r => r.tipo === filtroTipo);

  records.sort((a, b) => {
    if (filtroSort === 'km-desc')   return b.kilometraje - a.kilometraje;
    if (filtroSort === 'km-asc')    return a.kilometraje - b.kilometraje;
    if (filtroSort === 'fecha-desc') return new Date(b.fecha) - new Date(a.fecha);
    if (filtroSort === 'fecha-asc')  return new Date(a.fecha) - new Date(b.fecha);
    return 0;
  });

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        ${ICONS.history}
        <h3>Sin registros</h3>
        <p>Aún no has registrado ningún mantenimiento.<br>¡Empieza por el cambio de aceite!</p>
        <a href="mantenimiento.html" class="btn btn-primary" style="margin-top:16px">Registrar ahora</a>
      </div>`;
    return;
  }

  container.innerHTML = records.map(r => {
    const info = getMantenimientoInfo(r.tipo);
    return `
      <div class="hist-item card card-sm">
        <div class="hist-top">
          <div class="hist-icon">${info.icon}</div>
          <div class="hist-info">
            <div class="hist-label">${info.label}</div>
            <div class="hist-meta">
              ${fmtDate(r.fecha)} · ${fmtKm(r.kilometraje)}
            </div>
          </div>
          <div class="hist-cost">${r.costo > 0 ? fmtMoney(r.costo) : ''}</div>
        </div>
        ${r.taller ? `<div class="hist-taller">🏪 ${r.taller}</div>` : ''}
        ${r.observaciones ? `<div class="hist-obs">${r.observaciones}</div>` : ''}
        <div class="hist-actions">
          <button class="btn btn-secondary" style="padding:6px 10px;font-size:.75rem"
            onclick="deleteRecord('${r.id}')">${ICONS.trash} Eliminar</button>
        </div>
      </div>`;
  }).join('');
}

function deleteRecord(id) {
  if (!confirm('¿Eliminar este registro?')) return;
  DB.deleteRecord(id);
  showToast('Registro eliminado', 'warn');
  renderHistorial();
}
