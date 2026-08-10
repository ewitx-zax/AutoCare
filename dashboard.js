/* ─── AutoCare · Dashboard ────────────────────────────────────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();

  // Botón instalar PWA
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('btn-install');
    if (btn) btn.style.display = 'flex';
  });
  document.getElementById('btn-install')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('btn-install').style.display = 'none';
  });

  // Botón notificaciones
  document.getElementById('btn-notif')?.addEventListener('click', async () => {
    const ok = await requestNotifications();
    if (ok) {
      showToast('✅ Notificaciones activadas', 'ok');
      checkAndNotify();
    } else {
      showToast('Notificaciones bloqueadas en el navegador', 'warn');
    }
  });
});

function renderDashboard() {
  const v  = DB.getVehicle();
  const km = v ? Number(v.kilometraje || 0) : 0;

  // Banner vehículo
  const vBanner = document.getElementById('vehicle-banner');
  if (vBanner) {
    if (v) {
      vBanner.innerHTML = `
        <div class="veh-name">${v.marca} ${v.modelo} <span class="veh-year">${v.anio}</span></div>
        <div class="veh-detail">
          <span class="veh-km">${km.toLocaleString('es-SV')} km</span>
          ${v.placa ? `<span class="veh-placa">${v.placa}</span>` : ''}
        </div>
      `;
    } else {
      vBanner.innerHTML = `
        <div class="veh-name veh-empty">Sin vehículo registrado</div>
        <a href="vehiculo.html" class="btn btn-primary" style="margin-top:10px;display:inline-flex">Registrar vehículo</a>
      `;
    }
  }

  // Gauges
  const grid = document.getElementById('gauges-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const tipos = MANTENIMIENTOS.filter(m => m.id !== 'general');
  tipos.forEach(m => {
    const e = calcEstado(m.id, km);
    grid.appendChild(buildGaugeCard(m, e, km));
  });
}

/* ─── Gauge SVG ───────────────────────────────────────────────────── */
function buildGaugeCard(m, estado, kmActual) {
  const card = document.createElement('div');
  card.className = 'gauge-card';

  if (!estado) {
    card.innerHTML = `
      <div class="gauge-icon">${m.icon}</div>
      <div class="gauge-label">${m.label}</div>
      <div class="gauge-sub muted">Sin registro</div>
      <a href="mantenimiento.html?tipo=${m.id}" class="gauge-add">+ Agregar</a>
    `;
    return card;
  }

  const { pct, kmFaltan, status, kmProximo } = estado;
  const color = status === 'ok' ? 'var(--ok)' : status === 'warn' ? 'var(--warn)' : 'var(--danger)';
  const svg   = buildArc(pct, color);

  const kmFaltanLabel = kmFaltan <= 0
    ? `<span style="color:var(--danger);font-weight:700">Vencido</span>`
    : `<span style="color:${color};font-weight:700">Faltan ${kmFaltan.toLocaleString('es-SV')} km</span>`;

  card.innerHTML = `
    ${svg}
    <div class="gauge-label">${m.icon} ${m.label}</div>
    <div class="gauge-km">${kmFaltanLabel}</div>
    <div class="gauge-sub muted">Próximo: ${kmProximo.toLocaleString('es-SV')} km</div>
  `;
  return card;
}

function buildArc(pct, color) {
  const R = 38, cx = 50, cy = 50;
  const startAngle = -210 * Math.PI / 180;
  const sweep      =  240 * Math.PI / 180;
  const endAngle   = startAngle + sweep * Math.min(pct, 1);

  function polar(a) {
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  }
  const [sx, sy] = polar(startAngle);
  const [ex, ey] = polar(endAngle);
  const [bx, by] = polar(startAngle + sweep);
  const largeArc  = sweep > Math.PI ? 1 : 0;
  const largeFill = (sweep * Math.min(pct, 1)) > Math.PI ? 1 : 0;

  const trackPath = `M ${sx} ${sy} A ${R} ${R} 0 ${largeArc} 1 ${bx} ${by}`;
  const fillPath  = pct > 0 ? `M ${sx} ${sy} A ${R} ${R} 0 ${largeFill} 1 ${ex} ${ey}` : '';

  const pctLabel = Math.round(pct * 100);

  return `
    <svg class="gauge-arc" viewBox="0 0 100 100">
      <path d="${trackPath}" fill="none" stroke="var(--border)" stroke-width="8" stroke-linecap="round"/>
      ${fillPath ? `<path d="${fillPath}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" style="filter:drop-shadow(0 0 4px ${color}66)"/>` : ''}
      <text x="50" y="54" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="700" fill="${color}">${pctLabel}%</text>
    </svg>
  `;
}
