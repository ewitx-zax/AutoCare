/* ─── AutoCare · App core ─────────────────────────────────────────── */
'use strict';

/* ─── Nav activa ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Badge de alertas en topbar
  updateAlertBadge();
});

/* ─── Toast ───────────────────────────────────────────────────────── */
function showToast(msg, type = 'ok') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

/* ─── Badge de alertas ────────────────────────────────────────────── */
function updateAlertBadge() {
  const badge = document.getElementById('alert-badge');
  if (!badge) return;
  const v = DB.getVehicle();
  if (!v) { badge.style.display = 'none'; return; }
  const km = Number(v.kilometraje || 0);
  const alertas = MANTENIMIENTOS.filter(m => {
    const e = calcEstado(m.id, km);
    return e && (e.status === 'warn' || e.status === 'danger');
  });
  if (alertas.length > 0) {
    badge.textContent = alertas.length;
    badge.style.display = 'inline';
  } else {
    badge.style.display = 'none';
  }
}

/* ─── Notificaciones push ─────────────────────────────────────────── */
async function requestNotifications() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

function sendNotification(title, body, icon = 'assets/icons/icon-192.png') {
  if (Notification.permission !== 'granted') return;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, { body, icon, badge: icon, vibrate: [200, 100, 200] });
    });
  } else {
    new Notification(title, { body, icon });
  }
}

function checkAndNotify() {
  const v = DB.getVehicle();
  if (!v) return;
  const km = Number(v.kilometraje);
  MANTENIMIENTOS.forEach(m => {
    const e = calcEstado(m.id, km);
    if (!e) return;
    if (e.status === 'danger') {
      sendNotification(`⚠️ ${m.label} vencido`, `Tu ${v.marca} ${v.modelo} necesita atención. Km actual: ${km.toLocaleString()}`);
    } else if (e.status === 'warn') {
      sendNotification(`🔔 ${m.label} próximo`, `Faltan ${e.kmFaltan.toLocaleString()} km para el próximo servicio.`);
    }
  });
}

/* ─── Formatters ──────────────────────────────────────────────────── */
function fmtKm(n)    { return Number(n).toLocaleString('es-SV') + ' km'; }
function fmtMoney(n) { return '$ ' + Number(n).toLocaleString('es-SV', { minimumFractionDigits: 2 }); }
function fmtDate(s)  {
  if (!s) return '—';
  const d = new Date(s + 'T12:00:00');
  return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── SVG icons inline ────────────────────────────────────────────── */
const ICONS = {
  home:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  car:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M3 9h11"/></svg>`,
  wrench:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-7.68"/><line x1="12" y1="7" x2="12" y2="12"/><polyline points="12 12 15 14"/></svg>`,
  wallet:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><circle cx="17" cy="15" r="1" fill="currentColor"/></svg>`,
  plus:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  alert:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  check:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>`,
};
