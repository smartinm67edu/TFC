document.addEventListener('DOMContentLoaded', () => {
    // Cargar el footer
    fetch('footer.html')
        .then(res => res.text())
        .then(data => {
            const footer = document.getElementById('footer');
            if (footer) {
                footer.innerHTML = data;
                initSocialButtons();
                loadFontAwesome();
            }
        })
        .catch(err => console.error('Error loading footer:', err));

    // Inicializar botones sociales
    function initSocialButtons() {
        const socialButtons = document.querySelectorAll('.social-btn');
        
        socialButtons.forEach(button => {
            // Efecto de onda al hacer clic
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Crear elemento de onda
                const wave = document.createElement('span');
                wave.className = 'wave-effect';
                wave.style.position = 'absolute';
                wave.style.borderRadius = '50%';
                wave.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                wave.style.pointerEvents = 'none';
                wave.style.transform = 'scale(0)';
                wave.style.animation = 'wave 0.6s linear';
                wave.style.zIndex = '0';
                
                // Posicionar la onda donde se hizo clic
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 1.5;
                wave.style.width = size + 'px';
                wave.style.height = size + 'px';
                wave.style.left = (e.clientX - rect.left - size/2) + 'px';
                wave.style.top = (e.clientY - rect.top - size/2) + 'px';
                
                button.appendChild(wave);
                
                // Eliminar la onda después de la animación
                setTimeout(() => {
                    wave.remove();
                }, 600);
                
                // Abrir enlace después de un pequeño retraso
                setTimeout(() => {
                    window.open(button.href, '_blank');
                }, 300);
            });
            
            // Efecto de sonido al pasar el mouse
            button.addEventListener('mouseenter', () => {
                playHoverSound();
                animateIcon(button);
            });
        });
    }
    
    // Animación del icono
    function animateIcon(button) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    // Efecto de sonido (opcional)
    function playHoverSound() {
        try {
            const sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
            sound.volume = 0.1;
            sound.play().catch(e => console.log('Audio no permitido automáticamente'));
        } catch (e) {
            console.log('Error al reproducir sonido:', e);
        }
    }
    
    // Cargar Font Awesome dinámicamente
    function loadFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }
});