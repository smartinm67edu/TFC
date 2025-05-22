document.addEventListener('DOMContentLoaded', () => {
    // ================= UTILIDADES =================

    // ================= MENÚ DESPLEGABLE =================
    function initMenuToggle() {
        const menuToggle = document.getElementById('menu-toggle');
        const navLinks = document.getElementById('nav-links');

        if (!menuToggle || !navLinks) return;

        // Alternar visibilidad del menú
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Cerrar menú al hacer clic en un enlace (en móviles)
        const closeMenu = () => {
            navLinks.classList.remove('active');
            menuToggle.textContent = '☰';
        };

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Cerrar menú si se redimensiona a escritorio
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

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
    initMenuToggle();


    // Configuración de Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCuMvxncv2EZnAjAudYJRfgx2eODw5_uqg",
        authDomain: "yupifiestas-7365a.firebaseapp.com",
        projectId: "yupifiestas-7365a",
        storageBucket: "yupifiestas-7365a.firebasestorage.app",
        messagingSenderId: "750235343948",
        appId: "1:750235343948:web:8eb34a4cea5b8535f628e9",
        measurementId: "G-BWGVS6VTYE"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();


    // Referencias a elementos del DOM
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authContainer = document.getElementById('auth-container');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const googleRegisterBtn = document.getElementById('google-register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Mostrar/ocultar formularios
    showRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLogin.addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Función para login con email y contraseña
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Login exitoso
                showUserInfo(userCredential.user);
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Función para registro con email y contraseña
    registerBtn.addEventListener('click', () => {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Registro exitoso
                showUserInfo(userCredential.user);
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Función para login con Google
    const loginWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
            .then((result) => {
                // Login con Google exitoso
                showUserInfo(result.user);
            })
            .catch((error) => {
                alert(error.message);
            });
    };

    googleLoginBtn.addEventListener('click', loginWithGoogle);
    googleRegisterBtn.addEventListener('click', loginWithGoogle);

    // Función para cerrar sesión
    logoutBtn.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                authContainer.style.display = 'block';
                userInfo.style.display = 'none';
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Función para mostrar información del usuario
    const showUserInfo = (user) => {
        authContainer.style.display = 'none';
        userInfo.style.display = 'block';
        userName.textContent = user.displayName || user.email;
        userEmail.textContent = user.email;
    };

    const ADMIN_EMAIL = "admin@yupifiestas.es";

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            showUserInfo(user);

            if (user.email === ADMIN_EMAIL) {
                document.body.classList.add("admin");
            } else {
                document.body.classList.remove("admin");
            }

            try {
                const res = await fetch('http://localhost:5000/users/find', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email })
                });

                if (res.status === 404) {
                    await fetch('http://localhost:5000/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            role: user.email === ADMIN_EMAIL ? 'admin' : 'user'
                        })
                    });
                    console.log('✅ Usuario creado en MongoDB');
                } else {
                    console.log('ℹ️ Usuario ya existía en MongoDB');
                }

                // ✅ Redirigir a página de reservas
                window.location.href = "../../html/reservas.html"; // cambia la ruta si es otra

            } catch (error) {
                console.error('❌ Error al sincronizar usuario con MongoDB:', error);
            }

        } else {
            authContainer.style.display = 'block';
            userInfo.style.display = 'none';
            document.body.classList.remove("admin");
        }
    });


});

