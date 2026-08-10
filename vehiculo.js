/* ─── AutoCare · Vehículo ─────────────────────────────────────────── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  loadVehicle();

  document.getElementById('form-vehiculo')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      marca:       document.getElementById('marca').value.trim(),
      modelo:      document.getElementById('modelo').value.trim(),
      anio:        document.getElementById('anio').value,
      placa:       document.getElementById('placa').value.trim().toUpperCase(),
      kilometraje: parseInt(document.getElementById('kilometraje').value) || 0,
      color:       document.getElementById('color').value.trim(),
      vin:         document.getElementById('vin').value.trim().toUpperCase(),
      notas:       document.getElementById('notas').value.trim(),
    };
    DB.saveVehicle(data);
    showToast('✅ Vehículo guardado', 'ok');
    setTimeout(() => location.href = 'index.html', 1000);
  });

  document.getElementById('btn-delete-vehicle')?.addEventListener('click', () => {
    if (confirm('¿Eliminar los datos del vehículo?')) {
      localStorage.removeItem(DB.KEY_VEHICLE);
      showToast('Vehículo eliminado', 'warn');
      loadVehicle();
    }
  });
});

function loadVehicle() {
  const v = DB.getVehicle();
  if (!v) return;
  const fields = ['marca','modelo','anio','placa','kilometraje','color','vin','notas'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el && v[f] !== undefined) el.value = v[f];
  });
  const del = document.getElementById('btn-delete-vehicle');
  if (del) del.style.display = 'flex';
}
