document.addEventListener('DOMContentLoaded', () => {
  const basePath = location.pathname.includes("/assets/html/") ? "../" : "assets/";

  // === CARGA HEADER ===
  fetch(`${basePath}html/header.html`)
    .then(res => res.text())
    .then(data => {
      const header = document.getElementById("header");
      if (header) {
        header.innerHTML = data;
        initMenuToggle();
        initScrollToFooter();
      }
    });

  // === CARGA FOOTER ===
  fetch(`${basePath}html/footer.html`)
    .then(res => res.text())
    .then(data => {
      const footer = document.getElementById("footer");
      if (footer) footer.innerHTML = data;
    });

  // === MENÚ DESPLEGABLE ===
  function initMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }

  // === ENLACE "CONTACTO" ===
  function initScrollToFooter() {
    const contactoLink = document.querySelector('a[href="#contacto"]');
    if (contactoLink) {
      contactoLink.addEventListener('click', function (e) {
        e.preventDefault();
        const footer = document.getElementById('contacto');
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = '/index.html#contacto';
        }
      });
    }
  }

  // === CARRUSEL ===
  const track = document.querySelector('.carousel-track');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  let index = 0;

  if (track && nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      index = (index + 1) % track.children.length;
      updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
      index = (index - 1 + track.children.length) % track.children.length;
      updateCarousel();
    });

    function updateCarousel() {
      track.style.transform = `translateX(-${index * 100}%)`;
    }
  }

  // === LIGHTBOX ===
  const zoomables = document.querySelectorAll('.zoomable');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const closeBtn = document.querySelector('.close-lightbox');

  if (lightbox && lightboxImg && closeBtn) {
    zoomables.forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.remove('hidden');
      });
    });

    closeBtn.addEventListener('click', () => {
      lightbox.classList.add('hidden');
      lightboxImg.src = '';
    });

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) {
        lightbox.classList.add('hidden');
        lightboxImg.src = '';
      }
    });
  }

  // === ANIMACIÓN DE APARICIÓN ===
  const eventos = document.querySelectorAll('.evento');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  eventos.forEach(evento => observer.observe(evento));

  // === HOVER SUAVE EN VIDEOS ===
  const videos = document.querySelectorAll('.evento-video');
  videos.forEach(video => {
    video.addEventListener('mouseenter', () => {
      video.style.transform = 'scale(1.03)';
      video.style.transition = 'transform 0.3s ease';
    });

    video.addEventListener('mouseleave', () => {
      video.style.transform = 'scale(1)';
    });
  });
});
