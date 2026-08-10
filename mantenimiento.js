/* ─── AutoCare · Registrar mantenimiento ─────────────────────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Pre-llenar tipo desde query param
  const params = new URLSearchParams(location.search);
  const tipoParam = params.get('tipo');
  const tipoSel = document.getElementById('tipo');
  if (tipoParam && tipoSel) tipoSel.value = tipoParam;

  // Pre-llenar km del vehículo
  const v = DB.getVehicle();
  const kmInput = document.getElementById('kilometraje');
  if (v && kmInput && !kmInput.value) {
    kmInput.value = v.kilometraje || '';
  }

  // Fecha de hoy
  const fechaInput = document.getElementById('fecha');
  if (fechaInput && !fechaInput.value) {
    fechaInput.value = new Date().toISOString().split('T')[0];
  }

  document.getElementById('form-mantenimiento')?.addEventListener('submit', e => {
    e.preventDefault();
    const rec = {
      tipo:        document.getElementById('tipo').value,
      fecha:       document.getElementById('fecha').value,
      kilometraje: parseInt(document.getElementById('kilometraje').value) || 0,
      costo:       parseFloat(document.getElementById('costo').value) || 0,
      taller:      document.getElementById('taller').value.trim(),
      observaciones: document.getElementById('observaciones').value.trim(),
    };

    // Actualizar km del vehículo si este registro es mayor
    if (v && rec.kilometraje > Number(v.kilometraje)) {
      v.kilometraje = rec.kilometraje;
      DB.saveVehicle(v);
    }

    DB.addRecord(rec);
    showToast('✅ Mantenimiento registrado', 'ok');
    setTimeout(() => location.href = 'historial.html', 900);
  });
});
