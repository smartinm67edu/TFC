// reservation.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newReservationForm');
  const msg = document.getElementById('reservationMsg');
  const submitBtn = document.getElementById('submitReservationBtn');
  const typeSelect = document.getElementById('reservationType');
  const itemSelect = document.getElementById('reservationItem');
  const tableBody = document.querySelector('#reservationsTable tbody');
  const token = localStorage.getItem('adminToken');
  const isAdmin = !!token;
  let currentReservationId = null;

  async function loadAvailability() {
    try {
      const res = await fetch('/api/availability');
      const { castles, events } = await res.json();
      itemSelect.innerHTML = '<option value="">Seleccione item</option>';

      const list = typeSelect.value === 'castle' ? castles : events;
      list.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item._id;
        opt.textContent = item.name;
        itemSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
    }
  }

  async function loadReservations() {
    try {
      const res = await fetch('/api/reservations', {
        headers: isAdmin ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();

      tableBody.innerHTML = '';
      data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r._id}</td>
          <td>${r.itemId}</td>
          <td>${r.itemType}</td>
          <td>${r.client.name}</td>
          <td>${new Date(r.date).toLocaleDateString()}</td>
          <td>${r.status}</td>
          <td>
            ${isAdmin ? `
              <button class="btn btn-sm btn-info" onclick="editReservation('${r._id}')">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="deleteReservation('${r._id}')">Eliminar</button>
            ` : 'N/A'}
          </td>
        `;
        tableBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error al cargar reservas:', err);
    }
  }

  async function createReservation() {
    const reservation = {
      itemType: typeSelect.value,
      itemId: itemSelect.value,
      client: {
        name: document.getElementById('clientName').value,
        phone: document.getElementById('clientPhone').value
      },
      date: document.getElementById('reservationDate').value
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation)
      });

      const data = await res.json();
      if (data.success) {
        msg.textContent = '✅ Reserva enviada con éxito';
        form.reset();
        loadReservations();
      } else {
        msg.textContent = '❌ ' + data.message;
      }
    } catch (err) {
      console.error(err);
      msg.textContent = '❌ Error al conectar con el servidor';
    }
  }

  window.deleteReservation = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        loadReservations();
      } else {
        alert('Error al eliminar reserva');
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar con el servidor');
    }
  };

  window.editReservation = async (id) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      currentReservationId = id;

      document.getElementById('editClientName').value = data.client.name;
      document.getElementById('editClientPhone').value = data.client.phone;
      document.getElementById('editReservationDate').value = data.date.split('T')[0];
      document.getElementById('editReservationStatus').value = data.status;
      document.getElementById('editReservationNotes').value = data.notes || '';

      const modal = new bootstrap.Modal(document.getElementById('editReservationModal'));
      modal.show();
    } catch (err) {
      console.error('Error al cargar reserva:', err);
      alert('Error al cargar los datos de la reserva');
    }
  };

  document.getElementById('saveReservationBtn')?.addEventListener('click', async () => {
    try {
      const update = {
        client: {
          name: document.getElementById('editClientName').value,
          phone: document.getElementById('editClientPhone').value
        },
        date: document.getElementById('editReservationDate').value,
        status: document.getElementById('editReservationStatus').value,
        notes: document.getElementById('editReservationNotes').value
      };

      const res = await fetch(`/api/reservations/${currentReservationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });

      const result = await res.json();
      if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('editReservationModal')).hide();
        loadReservations();
      } else {
        alert('Error al actualizar la reserva');
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al conectar con el servidor');
    }
  });

  typeSelect.addEventListener('change', () => {
    if (typeSelect.value) {
      itemSelect.disabled = false;
      loadAvailability();
    } else {
      itemSelect.disabled = true;
    }
  });

  submitBtn.addEventListener('click', () => {
    if (form.checkValidity()) {
      createReservation();
    } else {
      form.reportValidity();
    }
  });

  loadAvailability();
  loadReservations();
});