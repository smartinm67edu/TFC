document.addEventListener('DOMContentLoaded', function() {
    const availabilityContainer = document.getElementById('availabilityContainer');
    const refreshBtn = document.getElementById('refreshBtn');
    
    // Función para cargar la disponibilidad
    async function loadAvailability() {
        try {
            refreshBtn.classList.add('pulse');
            refreshBtn.disabled = true;
            
            // Simulación de conexión a la base de datos (en producción sería una llamada real)
            const response = await fetch('get_availability.php');
            const data = await response.json();
            
            displayAvailability(data);
        } catch (error) {
            console.error('Error al cargar disponibilidad:', error);
            availabilityContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Error al cargar la disponibilidad. Intente nuevamente.
                </div>
            `;
        } finally {
            refreshBtn.classList.remove('pulse');
            refreshBtn.disabled = false;
        }
    }
    
    // Función para mostrar los datos en el frontend
    function displayAvailability(data) {
        availabilityContainer.innerHTML = '';
        
        // Mostrar castillos
        data.castles.forEach(castle => {
            const card = document.createElement('div');
            card.className = `availability-card ${castle.available ? 'available' : 'unavailable'}`;
            
            card.innerHTML = `
                <h3><i class="fas fa-chess-rook"></i> ${castle.name}</h3>
                <div class="date-info">
                    ${castle.next_available ? `Próxima disponibilidad: ${castle.next_available}` : ''}
                </div>
                <div class="status ${castle.available ? 'available' : 'unavailable'}">
                    ${castle.available ? 'Disponible' : 'Reservado'}
                </div>
                <p>${castle.description}</p>
                ${castle.available ? 
                    `<button class="book-btn" data-id="${castle.id}" data-type="castle">
                        <i class="fas fa-calendar-check"></i> Reservar
                    </button>` : 
                    `<button class="notify-btn" data-id="${castle.id}" data-type="castle">
                        <i class="fas fa-bell"></i> Notificarme
                    </button>`}
            `;
            
            availabilityContainer.appendChild(card);
        });
        
        // Mostrar eventos
        data.events.forEach(event => {
            const card = document.createElement('div');
            card.className = `availability-card ${event.available ? 'available' : 'unavailable'}`;
            
            card.innerHTML = `
                <h3><i class="fas fa-calendar-alt"></i> ${event.name}</h3>
                <div class="date-info">
                    Fecha: ${event.date} | Horario: ${event.time}
                </div>
                <div class="status ${event.available ? 'available' : 'unavailable'}">
                    ${event.available ? 'Disponible' : 'Completo'}
                </div>
                <p>${event.description}</p>
                ${event.available ? 
                    `<button class="book-btn" data-id="${event.id}" data-type="event">
                        <i class="fas fa-ticket-alt"></i> Reservar
                    </button>` : 
                    `<button class="notify-btn" data-id="${event.id}" data-type="event">
                        <i class="fas fa-bell"></i> Notificarme
                    </button>`}
            `;
            
            availabilityContainer.appendChild(card);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.book-btn').forEach(btn => {
            btn.addEventListener('click', handleBooking);
        });
        
        document.querySelectorAll('.notify-btn').forEach(btn => {
            btn.addEventListener('click', handleNotification);
        });
    }
    
    // Manejar reservas
    async function handleBooking(e) {
        const id = e.target.getAttribute('data-id');
        const type = e.target.getAttribute('data-type');
        
        try {
            const response = await fetch('book_item.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, type })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`¡${type === 'castle' ? 'Castillo' : 'Evento'} reservado con éxito!`);
                loadAvailability(); // Actualizar la vista
            } else {
                alert(result.message || 'Error al realizar la reserva');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    }
    
    // Manejar notificaciones
    function handleNotification(e) {
        const id = e.target.getAttribute('data-id');
        const type = e.target.getAttribute('data-type');
        
        const email = prompt(`Ingrese su email para ser notificado cuando este ${type === 'castle' ? 'castillo' : 'evento'} esté disponible:`);
        
        if (email) {
            // Enviar solicitud al servidor
            fetch('add_notification.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, type, email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('¡Te notificaremos cuando esté disponible!');
                } else {
                    alert('Error al registrar notificación');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al conectar con el servidor');
            });
        }
    }
    
    // Event listeners
    refreshBtn.addEventListener('click', loadAvailability);
    
    // Cargar disponibilidad al iniciar
    loadAvailability();
    
    // Actualizar cada 2 minutos (opcional)
    setInterval(loadAvailability, 120000);
});