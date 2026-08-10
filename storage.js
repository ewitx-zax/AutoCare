/* ─── AutoCare · Storage ──────────────────────────────────────────── */
'use strict';

const DB = {
  KEY_VEHICLE:  'ac_vehicle',
  KEY_RECORDS:  'ac_records',

  /* Vehículo ──────────────────────────────────── */
  getVehicle() {
    try { return JSON.parse(localStorage.getItem(this.KEY_VEHICLE)) || null; }
    catch { return null; }
  },
  saveVehicle(data) {
    localStorage.setItem(this.KEY_VEHICLE, JSON.stringify(data));
  },

  /* Registros ─────────────────────────────────── */
  getRecords() {
    try { return JSON.parse(localStorage.getItem(this.KEY_RECORDS)) || []; }
    catch { return []; }
  },
  saveRecords(records) {
    localStorage.setItem(this.KEY_RECORDS, JSON.stringify(records));
  },
  addRecord(rec) {
    const records = this.getRecords();
    rec.id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    rec.createdAt = new Date().toISOString();
    records.push(rec);
    this.saveRecords(records);
    return rec;
  },
  deleteRecord(id) {
    const records = this.getRecords().filter(r => r.id !== id);
    this.saveRecords(records);
  },
  getLastRecord(tipo) {
    return this.getRecords()
      .filter(r => r.tipo === tipo)
      .sort((a, b) => b.kilometraje - a.kilometraje)[0] || null;
  }
};

/* ─── Tipos de mantenimiento ──────────────────────────────────────── */
const MANTENIMIENTOS = [
  { id: 'aceite',   label: 'Cambio de aceite',      icon: '🛢️',  intervalo: 5000,  dias: 180 },
  { id: 'filtro',   label: 'Filtro de aire',         icon: '🌬️',  intervalo: 15000, dias: 365 },
  { id: 'llantas',  label: 'Rotación de llantas',    icon: '🔄',  intervalo: 10000, dias: 180 },
  { id: 'frenos',   label: 'Revisión de frenos',     icon: '🛑',  intervalo: 20000, dias: 730 },
  { id: 'bateria',  label: 'Batería',                icon: '🔋',  intervalo: 50000, dias: 1095 },
  { id: 'afinacion',label: 'Afinación',              icon: '⚙️',  intervalo: 15000, dias: 365 },
  { id: 'general',  label: 'Reparación general',     icon: '🔧',  intervalo: 0,     dias: 0 },
];

function getMantenimientoInfo(id) {
  return MANTENIMIENTOS.find(m => m.id === id) || { id, label: id, icon: '🔧', intervalo: 0, dias: 0 };
}

/* ─── Cálculo de estado de próximo servicio ───────────────────────── */
function calcEstado(tipo, kmActual) {
  const info = getMantenimientoInfo(tipo);
  const last  = DB.getLastRecord(tipo);

  if (!last || info.intervalo === 0) return null;

  const kmProximo   = last.kilometraje + info.intervalo;
  const kmFaltan    = kmProximo - kmActual;
  const pct         = Math.max(0, Math.min(1, (kmActual - last.kilometraje) / info.intervalo));

  let status = 'ok';
  if (kmFaltan <= 0)          status = 'danger';
  else if (kmFaltan <= 1000)  status = 'warn';

  // También evaluar por días si aplica
  let diasFaltan = null;
  if (info.dias > 0 && last.fecha) {
    const lastDate = new Date(last.fecha);
    const hoy      = new Date();
    const diasPasados = Math.floor((hoy - lastDate) / 86400000);
    diasFaltan = info.dias - diasPasados;
    if (diasFaltan <= 0 && status === 'ok') status = 'danger';
    else if (diasFaltan <= 30 && status === 'ok') status = 'warn';
  }

  return { tipo, info, last, kmProximo, kmFaltan, pct, status, diasFaltan };
}
