// =============================================
// BOOTCAMP AI - SCRIPT.JS (OPTIMIZADO v2)
// Fecha: 2026-02-24
// Nuevo: Contador de espectadores, fechas marzo 2026
// =============================================

(function() {
    'use strict';

    // ========== CONTADOR DE ESPECTADORES (FOMO) ==========
    function initViewersCounter() {
        const viewersEl = document.getElementById('viewers-count');
        if (!viewersEl) return;
        
        function updateViewers() {
            // Número aleatorio entre 8 y 25 para mostrar actividad
            const viewers = Math.floor(Math.random() * 18) + 8;
            viewersEl.textContent = `• 👥 ${viewers} personas viendo ahora`;
        }
        
        // Actualizar inmediatamente
        updateViewers();
        
        // Cambiar cada 20-40 segundos (aleatorio para parecer natural)
        setInterval(updateViewers, Math.random() * 20000 + 20000);
    }

    // ========== COUNTDOWN TIMER ==========
    function initCountdown() {
        // Fecha actualizada: 17 de Marzo 2026, 7 PM EST
        const launchDate = new Date('2026-03-17T19:00:00-05:00'); // 17 de Marzo, 7 PM EST
        
        function updateCountdown() {
            const now = new Date();
            const timeLeft = launchDate - now;
            
            if (timeLeft <= 0) {
                document.querySelectorAll('[id^="countdown"]').forEach(el => {
                    el.textContent = '¡Inscripciones Abiertas!';
                });
                return;
            }
            
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            const countdownText = `Inicia en ${days}d ${hours}h`;
            
            document.querySelectorAll('[id^="countdown"]').forEach(el => {
                el.textContent = countdownText;
            });
        }
        
        updateCountdown();
        setInterval(updateCountdown, 60000); // Update every minute
    }

    // ========== EXIT INTENT POPUP ==========
    function initExitIntent() {
        let exitPopupShown = false;
        const exitPopup = document.getElementById('exitPopup');
        
        if (!exitPopup || sessionStorage.getItem('exitPopupShown')) {
            return;
        }
        
        function showExitPopup(e) {
            if (e.clientY < 50 && !exitPopupShown) {
                exitPopupShown = true;
                exitPopup.style.display = 'flex';
                sessionStorage.setItem('exitPopupShown', 'true');
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'exit_intent_shown');
                }
            }
        }
        
        const closeBtn = exitPopup.querySelector('.exit-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                exitPopup.style.display = 'none';
            });
        }
        
        exitPopup.addEventListener('click', function(e) {
            if (e.target === exitPopup) {
                exitPopup.style.display = 'none';
            }
        });
        
        document.addEventListener('mouseout', showExitPopup);
    }

    // ========== LEAD MAGNET FORM ==========
    function initLeadMagnetForm() {
        const form = document.getElementById('leadMagnetForm');
        const exitForm = document.getElementById('exitForm');
        
        function handleLeadSubmit(e, source) {
            const emailInput = e.target.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value : '';
            
            if (!email || !validateEmail(email)) {
                alert('Por favor ingresa un email válido');
                e.preventDefault();
                return;
            }
            
            // Tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    event_category: 'Lead Magnet',
                    event_label: source,
                    value: email
                });
            }
            
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'Guia Práctica IA',
                    source: source
                });
            }
            
            sessionStorage.setItem('userEmail', email);
            
            // Download after short delay
            setTimeout(() => {
                window.location.href = '/downloads/Guia_Practica_Bootcamp_AI.pdf';
            }, 500);
        }
        
        if (form) {
            form.addEventListener('submit', (e) => handleLeadSubmit(e, 'inline'));
        }
        
        if (exitForm) {
            exitForm.addEventListener('submit', (e) => {
                handleLeadSubmit(e, 'exit_intent');
                const popup = document.getElementById('exitPopup');
                if (popup) popup.style.display = 'none';
            });
        }
    }

    // ========== EMAIL VALIDATION ==========
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ========== MOBILE MENU ==========
    function initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.nav-links');
        
        if (!toggle || !nav) return;
        
        toggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
            
            const spans = toggle.querySelectorAll('span');
            if (toggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }

    // ========== STICKY NAV ==========
    function initStickyNav() {
        const nav = document.getElementById('mainNav');
        if (!nav) return;
        
        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                nav.style.transform = 'translateY(0)';
                return;
            }
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }

    // ========== SMOOTH SCROLL ==========
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const nav = document.getElementById('mainNav');
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const targetPosition = target.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========== FAQ TRACKING ==========
    function initFAQTracking() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            item.addEventListener('toggle', function() {
                if (this.open && typeof gtag !== 'undefined') {
                    const question = this.querySelector('.faq-question');
                    if (question) {
                        gtag('event', 'faq_open', {
                            event_category: 'Engagement',
                            event_label: question.textContent
                        });
                    }
                }
            });
        });
    }

    // ========== SCROLL REVEAL ==========
    function initScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        const cards = document.querySelectorAll('.framework-card, .session-card, .testimonial-card, .pricing-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    // ========== LAZY LOAD ==========
    function initLazyLoad() {
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.src = img.dataset.src || img.src;
            });
        }
    }

    // ========== PAGE VIEW TRACKING ==========
    function trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    // ========== SCROLL DEPTH TRACKING ==========
    function initScrollDepthTracking() {
        const milestones = [25, 50, 75, 100];
        const reached = new Set();
        
        function checkScrollDepth() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
            
            milestones.forEach(milestone => {
                if (scrollPercentage >= milestone && !reached.has(milestone)) {
                    reached.add(milestone);
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            event_category: 'Engagement',
                            event_label: `${milestone}%`,
                            value: milestone
                        });
                    }
                }
            });
        }
        
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    checkScrollDepth();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ========== TIME ON PAGE TRACKING ==========
    function initTimeTracking() {
        let startTime = Date.now();
        const tracked = {30: false, 60: false, 120: false, 300: false};
        
        setInterval(function() {
            const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
            
            Object.keys(tracked).forEach(seconds => {
                if (timeOnPage >= seconds && !tracked[seconds]) {
                    tracked[seconds] = true;
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'time_on_page', {
                            event_category: 'Engagement',
                            event_label: `${seconds}_seconds`,
                            value: parseInt(seconds)
                        });
                    }
                }
            });
        }, 5000);
    }

    // ========== INITIALIZE ALL ==========
    function init() {
        // Nuevo: Contador de espectadores
        initViewersCounter();
        
        // Core
        initCountdown();
        initStickyNav();
        initSmoothScroll();
        initMobileMenu();
        initLeadMagnetForm();
        initFAQTracking();
        
        // Performance
        initLazyLoad();
        initScrollReveal();
        
        // Analytics
        trackPageView();
        initScrollDepthTracking();
        initTimeTracking();
        
        // Exit intent (delayed)
        setTimeout(initExitIntent, 3000);
        
        console.log('Bootcamp AI v2 - All systems initialized ✓');
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();