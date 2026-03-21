const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setCurrentNavLink = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href');
    link.setAttribute('aria-current', href === currentPage ? 'page' : 'false');
  });
};

const initMobileNav = () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav-menu]');

  if (!toggle || !nav) {
    return;
  }

  const setOpenState = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('is-open', isOpen);
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpenState(!isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpenState(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      setOpenState(false);
    }
  });
};

const initHeaderScroll = () => {
  const header = document.querySelector('[data-site-header]');

  if (!header) {
    return;
  }

  const updateState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateState();
  window.addEventListener('scroll', updateState, { passive: true });
};

const initReveal = () => {
  const revealItems = document.querySelectorAll('.reveal');

  if (!revealItems.length || reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
    observer.observe(item);
  });
};

const initPageTransitions = () => {
  if (reduceMotion) {
    return;
  }

  const internalLinks = document.querySelectorAll('a[href]');

  internalLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');

      if (!href || href.startsWith('#') || link.target === '_blank' || link.hasAttribute('download')) {
        return;
      }

      const url = new URL(href, window.location.href);
      const sameOrigin = url.origin === window.location.origin;

      if (!sameOrigin) {
        return;
      }

      event.preventDefault();
      document.body.classList.add('is-transitioning');
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 320);
    });
  });
};

const initTimeline = () => {
  const cards = document.querySelectorAll('[data-timeline-card]');
  const panels = document.querySelectorAll('[data-timeline-panel]');

  if (!cards.length || !panels.length) {
    return;
  }

  const showPanel = (targetId) => {
    cards.forEach((card) => {
      const isActive = card.dataset.timelineCard === targetId;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.timelinePanel !== targetId;
    });
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => showPanel(card.dataset.timelineCard));
    card.addEventListener('mouseenter', () => showPanel(card.dataset.timelineCard));
    card.addEventListener('focus', () => showPanel(card.dataset.timelineCard));
  });

  showPanel(cards[0].dataset.timelineCard);
};

const initForm = () => {
  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-form-status]');

  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'Placeholder mode: this form is present for layout and interaction. Connect your preferred email service or form handler later.';
    form.reset();
  });
};

const initYear = () => {
  const yearNode = document.querySelector('[data-current-year]');

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
};

const initTilt = () => {
  if (reduceMotion) {
    return;
  }

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const reset = () => {
      card.style.transform = '';
    };

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const percentX = (event.clientX - rect.left) / rect.width - 0.5;
      const percentY = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateY = percentX * 8;
      const rotateX = percentY * -8;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('pointerleave', reset);
    card.addEventListener('blur', reset, true);
  });
};

const initReferences = () => {
  const modal = document.querySelector('[data-reference-modal]');
  const fullText = document.querySelector('[data-reference-full-text]');
  const title = document.querySelector('[data-reference-title]');
  const closeButton = document.querySelector('[data-reference-close]');
  const cards = document.querySelectorAll('[data-reference-card]');

  if (!modal || !fullText || !title || !closeButton || !cards.length) {
    return;
  }

  let lastFocusedCard = null;

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove('is-modal-open');

    if (lastFocusedCard) {
      lastFocusedCard.focus();
    }
  };

  const openModal = (card) => {
    title.textContent = card.dataset.referenceTitle || 'Reference';
    fullText.textContent = card.dataset.referenceFull || '';
    modal.hidden = false;
    document.body.classList.add('is-modal-open');
    lastFocusedCard = card;
    closeButton.focus();
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(card);
      }
    });
  });

  closeButton.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.hasAttribute('data-reference-backdrop')) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (!modal.hidden && event.key === 'Escape') {
      closeModal();
    }
  });
};

const initAccordion = () => {
  document.querySelectorAll('.accordion-header').forEach((header) => {
    const body = header.nextElementSibling;
    if (!body || !body.classList.contains('accordion-body')) {
      return;
    }

    header.addEventListener('click', () => {
      const isOpen = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', String(!isOpen));
      body.hidden = isOpen;
    });
  });
};

window.addEventListener('DOMContentLoaded', () => {
  setCurrentNavLink();
  initMobileNav();
  initHeaderScroll();
  initReveal();
  initPageTransitions();
  initTimeline();
  initForm();
  initYear();
  initTilt();
  initReferences();
  initAccordion();
});
