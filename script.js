(() => {
    const THEME_KEY = 'portfolio-theme';
    const body = document.body;

    // ------------------------------
    // Tema (dark ↔ light) com persistência
    // ------------------------------
    const applyTheme = (theme) => {
        body.classList.remove('dark', 'dark-theme', 'light', 'light-theme');
        if (theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.add('dark-theme');
        }
    };

    const getSavedTheme = () => {
        try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
    };

    const saveTheme = (theme) => {
        try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* ignore */ }
    };

    const savedTheme = getSavedTheme();
    applyTheme(savedTheme === 'light' ? 'light' : 'dark');

    const themeToggle = document.querySelector('[data-theme-toggle]') ||
        document.getElementById('toggle-theme') ||
        document.querySelector('.theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = body.classList.contains('light') || body.classList.contains('light-theme');
            const nextTheme = isLight ? 'dark' : 'light';
            applyTheme(nextTheme);
            saveTheme(nextTheme);
        });
    }

    // ------------------------------
    // Menu hambúrguer (mobile)
    // ------------------------------
    const menuBtn = document.getElementById('menu-btn') || document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links') || document.querySelector('nav.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.add('mobile');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }

    // ------------------------------
    // Rolagem suave para âncoras internas
    // ------------------------------
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        link.addEventListener('click', (event) => {
            event.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (navLinks) navLinks.classList.remove('open');
        });
    });

    // ------------------------------
    // Chatbot IA (abrir/fechar)
    // ------------------------------
    const chatbotToggle = document.querySelector('.chatbot-btn') || document.querySelector('.chatbot-toggle');
    const chatbotBox = document.querySelector('.chatbot-box') || document.querySelector('.chatbot');
    const chatbotClose = document.querySelector('.chatbot-close');

    const toggleChat = (forceState) => {
        if (!chatbotBox) return;
        const shouldOpen = typeof forceState === 'boolean' ? forceState : chatbotBox.style.display !== 'flex';
        chatbotBox.style.display = shouldOpen ? 'flex' : 'none';
        if (shouldOpen) {
            chatbotBox.removeAttribute('hidden');
        } else {
            chatbotBox.setAttribute('hidden', 'hidden');
        }
        if (chatbotToggle) {
            chatbotToggle.classList.toggle('open', shouldOpen);
        }
    };

    if (chatbotToggle && chatbotBox) {
        chatbotToggle.addEventListener('click', () => toggleChat());
    }

    if (chatbotClose && chatbotBox) {
        chatbotClose.addEventListener('click', () => toggleChat(false));
    }

    document.addEventListener('click', (event) => {
        if (!chatbotBox || !chatbotToggle) return;
        const clickedOutside = !chatbotBox.contains(event.target) && !chatbotToggle.contains(event.target);
        if (clickedOutside && chatbotBox.style.display === 'flex') {
            toggleChat(false);
        }
    });

    // ------------------------------
    // Animações de entrada do Hero
    // ------------------------------
    window.addEventListener('load', () => {
        const hero = document.querySelector('.hero');
        const heroTitle = document.querySelector('.hero-title');
        const heroCta = document.querySelector('.hero .btn-primary');
        const heroPortrait = document.querySelector('.portrait-frame img');

        [hero, heroTitle, heroCta, heroPortrait].forEach((el) => {
            if (el) el.classList.add('show');
        });
    });

    // ------------------------------
    // Fade-in on scroll (timeline, cards)
    // ------------------------------
    const observeFade = (selector) => {
        const items = document.querySelectorAll(selector);
        if (!items.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        items.forEach((item) => observer.observe(item));
    };

    observeFade('.timeline-item');
    observeFade('.projeto-card');
    observeFade('.skill-card');

    // ------------------------------
    // Navegação simples de projetos
    // ------------------------------
    const projectTrack = document.querySelector('.project-track');
    const projectSlides = Array.from(document.querySelectorAll('.project-slide'));
    const btnPrev = document.querySelector('.project-prev');
    const btnNext = document.querySelector('.project-next');
    const projectDots = document.querySelector('.project-dots');

    const getSlideStep = () => {
        if (!projectSlides.length) return 0;
        const trackStyles = projectTrack ? getComputedStyle(projectTrack) : null;
        const gap = trackStyles ? parseFloat(trackStyles.columnGap || trackStyles.gap) || 0 : 0;
        return projectSlides[0].getBoundingClientRect().width + gap;
    };

    let projectDotButtons = [];

    const setActiveProject = (index) => {
        projectSlides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === index);
            slide.classList.toggle('prev', slideIndex === index - 1 || (index === 0 && slideIndex === projectSlides.length - 1));
            slide.classList.toggle('next', slideIndex === index + 1 || (index === projectSlides.length - 1 && slideIndex === 0));
        });

        projectDotButtons.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
            dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
        });
    };

    const getCurrentProjectIndex = () => {
        if (!projectTrack || !projectSlides.length) return 0;
        const trackLeft = projectTrack.scrollLeft;
        return projectSlides.reduce((closestIndex, slide, index) => {
            const closestDistance = Math.abs(projectSlides[closestIndex].offsetLeft - trackLeft);
            const slideDistance = Math.abs(slide.offsetLeft - trackLeft);
            return slideDistance < closestDistance ? index : closestIndex;
        }, 0);
    };

    if (projectDots && projectSlides.length) {
        projectDots.innerHTML = '';
        projectDotButtons = projectSlides.map((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'project-dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Selecionar projeto ${index + 1}`);
            dot.addEventListener('click', () => {
                if (!projectTrack) return;
                projectTrack.scrollTo({ left: projectSlides[index].offsetLeft, behavior: 'smooth' });
                setActiveProject(index);
            });
            projectDots.appendChild(dot);
            return dot;
        });
        setActiveProject(0);
    }

    const scrollToOffset = (direction) => {
        const slideWidth = getSlideStep();
        if (!projectTrack || !slideWidth) return;
        const currentIndex = getCurrentProjectIndex();
        const nextIndex = Math.min(Math.max(currentIndex + direction, 0), projectSlides.length - 1);
        projectTrack.scrollTo({ left: projectSlides[nextIndex].offsetLeft, behavior: 'smooth' });
        setActiveProject(nextIndex);
    };

    if (btnPrev) btnPrev.addEventListener('click', () => scrollToOffset(-1));
    if (btnNext) btnNext.addEventListener('click', () => scrollToOffset(1));

    if (projectTrack) {
        let projectScrollFrame = null;
        projectTrack.addEventListener('scroll', () => {
            if (projectScrollFrame) cancelAnimationFrame(projectScrollFrame);
            projectScrollFrame = requestAnimationFrame(() => setActiveProject(getCurrentProjectIndex()));
        });
    }

        // Tabs da Carreira
    const careerTabs = document.querySelectorAll('.career-tab');
    const careerCards = document.querySelectorAll('.career-card');

    const activateCareer = (targetId) => {
        careerTabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.target === targetId));
        careerCards.forEach((card) => {
            const isActive = card.id === targetId;
            card.classList.toggle('active', isActive);
            if (isActive) card.removeAttribute('hidden'); else card.setAttribute('hidden','hidden');
        });
    };

    careerTabs.forEach((btn) => {
        btn.addEventListener('click', () => activateCareer(btn.dataset.target));
    });


    // Visualiza‡Æo ampliada de feedback
    const feedbackModal = document.getElementById('feedback-lightbox');
    const feedbackModalImg = document.querySelector('[data-feedback-img]');
    const feedbackModalCaption = document.querySelector('[data-feedback-caption]');
    const feedbackCloseEls = document.querySelectorAll('[data-feedback-close]');

    const closeFeedback = () => {
        if (!feedbackModal) return;
        feedbackModal.classList.remove('open');
        feedbackModal.setAttribute('hidden', 'hidden');
        document.body.style.overflow = '';
    };

    const openFeedback = (imgEl) => {
        if (!feedbackModal || !feedbackModalImg) return;
        feedbackModalImg.src = imgEl.src;
        feedbackModalImg.alt = imgEl.alt || 'Feedback ampliado';
        const name = imgEl.closest('.feedback-card')?.querySelector('.feedback-meta h3')?.textContent?.trim() || '';
        if (feedbackModalCaption) {
            feedbackModalCaption.textContent = name ? `Feedback de ${name}` : 'Feedback';
        }
        feedbackModal.classList.add('open');
        feedbackModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
    };

    document.querySelectorAll('[data-feedback-open]').forEach((img) => {
        img.addEventListener('click', () => openFeedback(img));
        img.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFeedback(img);
            }
        });
    });

    feedbackCloseEls.forEach((el) => el.addEventListener('click', closeFeedback));

    if (feedbackModal) {
        feedbackModal.addEventListener('click', (event) => {
            if (event.target === feedbackModal || event.target.dataset.feedbackClose !== undefined) {
                closeFeedback();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeFeedback();
        }
    });
})();
