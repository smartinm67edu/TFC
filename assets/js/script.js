document.addEventListener('DOMContentLoaded', () => {
  // ================= UTILIDADES =================
  
  /**
   * Carga Font Awesome dinámicamente si no está ya cargado
   */
  function loadFontAwesome() {
      if (!document.querySelector('link[href*="font-awesome"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
          document.head.appendChild(link);
      }
  }

  /**
   * Reproduce un sonido de hover/efecto
   */
  function playHoverSound() {
      try {
          const sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
          sound.volume = 0.1;
          sound.play().catch(e => console.log('Audio no permitido automáticamente'));
      } catch (e) {
          console.log('Error al reproducir sonido:', e);
      }
  }

  /**
   * Animación de escala para iconos
   * @param {HTMLElement} icon - Elemento del icono a animar
   */
  function animateIcon(icon) {
      if (icon) {
          icon.style.transform = 'scale(1.3)';
          setTimeout(() => {
              icon.style.transform = 'scale(1)';
          }, 300);
      }
  }

  /**
   * Inicializa botones sociales con efectos visuales
   */
  function initSocialButtons() {
      const socialButtons = document.querySelectorAll('.social-btn');
      socialButtons.forEach(button => {
          button.addEventListener('click', function(e) {
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

  /**
   * Resalta la página actual en la navegación
   */
  function highlightCurrentPage() {
      const currentPage = location.pathname.split('/').pop().replace('.html', '') || 'index';
      document.querySelectorAll('#nav-links a').forEach(link => {
          const linkPage = link.getAttribute('href').split('/').pop().replace('.html', '');
          if (linkPage === currentPage || (currentPage === 'index' && linkPage === '')) {
              link.classList.add('active');
          }
      });
  }

  /**
   * Maneja los enlaces de contacto para scroll suave
   */
  function initContactoLinks() {
      const basePath = window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/')
          ? './' : '../';
      document.querySelectorAll('a[href="#contacto"]').forEach(link => {
          link.addEventListener('click', function(e) {
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

  // ================= FUNCIONALIDADES GLOBALES =================
  
  /**
   * Carousel functionality
   */
  const track = document.querySelector('.carousel-track');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  let carouselIndex = 0;

  if (track && nextBtn && prevBtn) {
      const updateCarousel = () => {
          track.style.transform = `translateX(-${carouselIndex * 100}%)`;
      };
      nextBtn.addEventListener('click', () => {
          carouselIndex = (carouselIndex + 1) % track.children.length;
          updateCarousel();
      });
      prevBtn.addEventListener('click', () => {
          carouselIndex = (carouselIndex - 1 + track.children.length) % track.children.length;
          updateCarousel();
      });
  }

  /**
   * Lightbox para imágenes zoomables
   */
  const zoomables = document.querySelectorAll('.zoomable');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const closeBtn = document.querySelector('.close-lightbox');

  if (lightbox && lightboxImg && closeBtn) {
      zoomables.forEach(img => {
          img.addEventListener('click', () => {
              lightboxImg.src = img.src;
              lightbox.classList.remove('hidden');
              document.body.style.overflow = 'hidden';
          });
      });

      const closeLightbox = () => {
          lightbox.classList.add('hidden');
          lightboxImg.src = '';
          document.body.style.overflow = '';
      };

      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', e => {
          if (e.target === lightbox) closeLightbox();
      });
  }

  /**
   * Animación de elementos al aparecer en el viewport
   */
  const elementosAnimables = document.querySelectorAll('.evento, .blog-post');
  const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
          }
      });
  }, { threshold: 0.1 });
  elementosAnimables.forEach(el => observer.observe(el));

  /**
   * Efectos hover para videos
   */
  const videos = document.querySelectorAll('.evento-video, .pack-video');
  videos.forEach(video => {
      video.addEventListener('mouseenter', () => {
          video.style.transform = 'scale(1.03)';
          video.style.transition = 'transform 0.3s ease';
      });
      video.addEventListener('mouseleave', () => {
          video.style.transform = 'scale(1)';
      });
  });

  /**
   * Efectos para tarjetas de castillos
   */
  

  // ================= INICIALIZAR FUNCIONES =================
  initSocialButtons();
  loadFontAwesome();
  highlightCurrentPage();
  initContactoLinks();
});