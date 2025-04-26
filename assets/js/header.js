document.addEventListener('DOMContentLoaded', () => {
  fetch('assets/html/header.html') // RUTA CORRECTA DESDE index.html
    .then(res => res.text())
    .then(data => {
      const header = document.getElementById('header');
      if (header) header.innerHTML = data;
      initMenuToggle(); // Asegúrate de que este código se ejecute DESPUÉS de insertar el header
    })
    .catch(err => console.error('Error loading header:', err));

  function initMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  }
});
