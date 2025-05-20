// Configuración de MongoDB
const API_BASE_URL = 'http://localhost:5000';


// Variables globales
let currentReservationId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos iniciales
    loadAvailability();
    loadReservations();
    
    // Configurar event listeners
    document.getElementById('refreshBtn').addEventListener('click', function() {
        loadAvailability();
        loadReservations();
    });
    
    document.getElementById('reservationType').addEventListener('change', function() {
        const type = this.value;
        const itemSelect = document.getElementById('reservationItem');
        
        if (type) {
            fetchAvailableItems(type)
                .then(items => {
                    itemSelect.innerHTML = '<option value="">Seleccionar...</option>';
                    items.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item._id;
                        option.textContent = item.name;
                        itemSelect.appendChild(option);
                    });
                    itemSelect.disabled = false;
                });
        } else {
            itemSelect.innerHTML = '<option value="">Primero seleccione un tipo</option>';
            itemSelect.disabled = true;
        }
    });
    
    document.getElementById('submitReservationBtn').addEventListener('click', createReservation);
    document.getElementById('saveReservationBtn').addEventListener('click', updateReservation);
});

// Función para cargar disponibilidad
async function loadAvailability() {
    try {
        const availabilityContainer = document.getElementById('availabilityContainer');
        availabilityContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;
        
        const [castles, events] = await Promise.all([
            fetchData('castles'),
            fetchData('events')
        ]);
        
        let html = '';
        
        // Mostrar castillos
        castles.forEach(castle => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 castle-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title mb-0">${castle.name}</h5>
                                <span class="status-badge badge ${castle.available ? 'badge-available' : 'badge-reserved'}">
                                    ${castle.available ? 'Disponible' : 'Reservado'}
                                </span>
                            </div>
                            <p class="card-text text-muted small">${castle.description || 'Sin descripción'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">Capacidad: ${castle.capacity || 'N/A'}</small>
                                ${castle.available ? 
                                    `<button class="btn btn-sm btn-outline-primary book-btn" data-id="${castle._id}" data-type="castle">
                                        <i class="fas fa-calendar-plus me-1"></i> Reservar
                                    </button>` : 
                                    `<button class="btn btn-sm btn-outline-secondary notify-btn" data-id="${castle._id}">
                                        <i class="fas fa-bell me-1"></i> Notificar
                                    </button>`}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Mostrar eventos
        events.forEach(event => {
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 event-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="card-title mb-0">${event.name}</h5>
                                <span class="status-badge badge ${event.available ? 'badge-available' : 'badge-reserved'}">
                                    ${event.available ? 'Disponible' : 'Completo'}
                                </span>
                            </div>
                            <p class="card-text text-muted small">${event.description || 'Sin descripción'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">${formatDate(event.date)} • ${event.time}</small>
                                ${event.available ? 
                                    `<button class="btn btn-sm btn-outline-primary book-btn" data-id="${event._id}" data-type="event">
                                        <i class="fas fa-ticket-alt me-1"></i> Reservar
                                    </button>` : 
                                    `<button class="btn btn-sm btn-outline-secondary notify-btn" data-id="${event._id}">
                                        <i class="fas fa-bell me-1"></i> Notificar
                                    </button>`}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        availabilityContainer.innerHTML = html;
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                openNewReservationModal(type, id);
            });
        });
        
    } catch (error) {
        console.error('Error al cargar disponibilidad:', error);
        document.getElementById('availabilityContainer').innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar la disponibilidad. Intente nuevamente.
                </div>
            </div>
        `;
    }
}

// Función para cargar reservas
async function loadReservations() {
    try {
        const reservations = await fetchData('reservations');
        const tableBody = document.querySelector('#reservationsTable tbody');
        
        if (reservations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        No hay reservas registradas
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        reservations.forEach(reservation => {
            const statusClass = getStatusClass(reservation.status);
            const itemName = reservation.item ? reservation.item.name : 'N/A';
            const itemType = reservation.itemType === 'castle' ? 'Castillo' : 'Evento';
            
            html += `
                <tr class="reservation-row" data-id="${reservation._id}">
                    <td>${reservation._id.substring(18)}</td>
                    <td>${itemName}</td>
                    <td>${itemType}</td>
                    <td>${reservation.client.name}</td>
                    <td>${formatDate(reservation.date)}</td>
                    <td>
                        <span class="badge ${statusClass}">${reservation.status}</span>
                    </td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary action-btn edit-btn" data-id="${reservation._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${reservation.status === 'pending' ? `
                                <button class="btn btn-sm btn-outline-success action-btn confirm-btn" data-id="${reservation._id}">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger action-btn cancel-btn" data-id="${reservation._id}">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        
        // Agregar event listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                openEditReservationModal(this.getAttribute('data-id'));
            });
        });
        
        document.querySelectorAll('.confirm-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                updateReservationStatus(this.getAttribute('data-id'), 'confirmed');
            });
        });
        
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                updateReservationStatus(this.getAttribute('data-id'), 'cancelled');
            });
        });
        
        document.querySelectorAll('.reservation-row').forEach(row => {
            row.addEventListener('click', function() {
                openEditReservationModal(this.getAttribute('data-id'));
            });
        });
        
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        document.querySelector('#reservationsTable tbody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error al cargar las reservas
                    </div>
                </td>
            </tr>
        `;
    }
}

// Funciones auxiliares
async function fetchData(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en la respuesta del servidor');
    return await response.json();
}

async function fetchAvailableItems(type) {
    return fetchData(type, { available: true });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function getStatusClass(status) {
    switch(status) {
        case 'confirmed': return 'bg-success bg-opacity-10 text-success';
        case 'cancelled': return 'bg-danger bg-opacity-10 text-danger';
        default: return 'bg-warning bg-opacity-10 text-warning';
    }
}

function openNewReservationModal(type, itemId = null) {
    const modal = new bootstrap.Modal(document.getElementById('newReservationModal'));
    const form = document.getElementById('newReservationForm');
    
    if (type && itemId) {
        document.getElementById('reservationType').value = type;
        document.getElementById('reservationType').dispatchEvent(new Event('change'));
        
        // Esperar a que se carguen los items
        setTimeout(() => {
            document.getElementById('reservationItem').value = itemId;
        }, 500);
    }
    
    form.reset();
    modal.show();
}

async function openEditReservationModal(reservationId) {
    try {
        const reservation = await fetchData(`reservations/${reservationId}`);
        const modal = new bootstrap.Modal(document.getElementById('editReservationModal'));
        const modalBody = document.getElementById('editReservationModalBody');
        
        currentReservationId = reservationId;
        
        modalBody.innerHTML = `
            <form id="editReservationForm">
                <div class="mb-3">
                    <label class="form-label">Cliente</label>
                    <input type="text" class="form-control" id="editClientName" value="${reservation.client.name}" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Teléfono</label>
                    <input type="tel" class="form-control" id="editClientPhone" value="${reservation.client.phone}" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Fecha</label>
                    <input type="date" class="form-control" id="editReservationDate" value="${reservation.date.split('T')[0]}" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Estado</label>
                    <select class="form-select" id="editReservationStatus" required>
                        <option value="pending" ${reservation.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="confirmed" ${reservation.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                        <option value="cancelled" ${reservation.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Notas</label>
                    <textarea class="form-control" id="editReservationNotes" rows="3">${reservation.notes || ''}</textarea>
                </div>
            </form>
        `;
        
        modal.show();
    } catch (error) {
        console.error('Error al cargar reserva:', error);
        alert('Error al cargar los datos de la reserva');
    }
}

// Funciones para CRUD de reservas
async function createReservation() {
    try {
        const form = document.getElementById('newReservationForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const reservation = {
            itemId: document.getElementById('reservationItem').value,
            itemType: document.getElementById('reservationType').value,
            client: {
                name: document.getElementById('clientName').value,
                phone: document.getElementById('clientPhone').value
            },
            date: document.getElementById('reservationDate').value,
            status: 'pending'
        };
        
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservation)
        });
        
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        
        const result = await response.json();
        
        // Cerrar modal y recargar datos
        bootstrap.Modal.getInstance(document.getElementById('newReservationModal')).hide();
        loadAvailability();
        loadReservations();
        
    } catch (error) {
        console.error('Error al crear reserva:', error);
        alert('Error al crear la reserva');
    }
}

async function updateReservation() {
    try {
        const form = document.getElementById('editReservationForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const reservation = {
            client: {
                name: document.getElementById('editClientName').value,
                phone: document.getElementById('editClientPhone').value
            },
            date: document.getElementById('editReservationDate').value,
            status: document.getElementById('editReservationStatus').value,
            notes: document.getElementById('editReservationNotes').value
        };
        
        const response = await fetch(`${API_BASE_URL}/reservations/${currentReservationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservation)
        });
        
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        
        // Cerrar modal y recargar datos
        bootstrap.Modal.getInstance(document.getElementById('editReservationModal')).hide();
        loadReservations();
        
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        alert('Error al actualizar la reserva');
    }
}

async function updateReservationStatus(reservationId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        
        // Recargar datos
        loadAvailability();
        loadReservations();
        
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar el estado de la reserva');
    }
}