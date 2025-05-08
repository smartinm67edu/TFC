document.addEventListener('DOMContentLoaded', () => {

  // ================= UTILIDADES =================
  function loadFontAwesome() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }

  function playHoverSound() {
    try {
      const sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
      sound.volume = 0.1;
      sound.play().catch(e => console.log('Audio no permitido automáticamente'));
    } catch (e) {
      console.log('Error al reproducir sonido:', e);
    }
  }

  function animateIcon(icon) {
    if (icon) {
      icon.style.transform = 'scale(1.3)';
      setTimeout(() => {
        icon.style.transform = 'scale(1)';
      }, 300);
    }
  }

  // ================= CASTILLOS HINCHABLES =================
  if (window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/')) {
    document.querySelectorAll('.castillo-card').forEach(card => {
      card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.07) rotate(3deg)';
        card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
        playHoverSound();
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) rotate(0deg)';
        card.style.boxShadow = 'none';
      });
    });
  }

  // ================= SOCIAL BUTTONS =================
  function initSocialButtons() {
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();

        const wave = document.createElement('span');
        wave.className = 'wave-effect';
        wave.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
          transform: scale(0);
          animation: wave 0.6s linear;
          z-index: 0;
        `;

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.5;
        wave.style.width = `${size}px`;
        wave.style.height = `${size}px`;
        wave.style.left = `${e.clientX - rect.left - size / 2}px`;
        wave.style.top = `${e.clientY - rect.top - size / 2}px`;

        button.appendChild(wave);

        setTimeout(() => wave.remove(), 600);
        setTimeout(() => window.open(button.href, '_blank'), 300);
      });

      button.addEventListener('mouseenter', () => {
        playHoverSound();
        animateIcon(button.querySelector('i'));
      });
    });
  }

  // ================= HIGHLIGHT CURRENT PAGE =================
  function highlightCurrentPage() {
    const currentPage = location.pathname.split('/').pop().replace('.html', '') || 'index';
    document.querySelectorAll('#nav-links a').forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop().replace('.html', '');
      if (linkPage === currentPage || (currentPage === 'index' && linkPage === '')) {
        link.classList.add('active');
      }
    });
  }

  // ================= CONTACTO LINKS =================
  function initContactoLinks() {
    const basePath = window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/')
      ? './' : '../';

    document.querySelectorAll('a[href="#contacto"]').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const contacto = document.getElementById('contacto');
        if (contacto) {
          contacto.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `${basePath}index.html#contacto`;
        }
      });
    });
  }

  // ================= INICIALIZAR FUNCIONES =================
  loadFontAwesome();
  initSocialButtons();
  highlightCurrentPage();
  initContactoLinks();
});
