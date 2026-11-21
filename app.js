(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  root.classList.add('js');

  const header = document.getElementById('header');
  const progress = document.getElementById('scrollProgress');
  const hero = document.querySelector('.hero');
  const heroPhoto = document.querySelector('.hero-photo');
  const cursor = document.getElementById('pointerOrbit');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const state = { targetX: -100, targetY: -100, cursorX: -100, cursorY: -100, scrollY: 0, ticking: false };

  // Keep the intro brief. Content is present even when JavaScript is disabled.
  const ready = () => body.classList.add('is-ready');
  if (prefersReduced.matches) ready();
  else window.setTimeout(ready, 700);
  window.addEventListener('pageshow', ready, { once: true });

  // Scroll-responsive progress and photo motion: transform only, never layout reads per frame.
  function updateScroll() {
    state.scrollY = window.scrollY || 0;
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (progress) progress.style.width = `${Math.min(100, (state.scrollY / total) * 100)}%`;
    header?.classList.toggle('is-scrolled', state.scrollY > 32);
    if (heroPhoto && !prefersReduced.matches && !body.classList.contains('motion-off')) {
      const motion = Math.min(state.scrollY, window.innerHeight * 1.3);
      heroPhoto.style.transform = `translate3d(0, ${motion * 0.11}px, 0) scale(1.07)`;
    }
    state.ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!state.ticking) {
      state.ticking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  // Entrance choreography, with a no-JS and reduced-motion fallback.
  const revealItems = document.querySelectorAll('.reveal, .reveal-right');
  if ('IntersectionObserver' in window && !prefersReduced.matches) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add('is-visible'));

  // A mobile menu that remains keyboard-operable and non-interactive when closed.
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    body.classList.toggle('menu-open', open);
    mobileMenu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.inert = !open;
    if (open) mobileMenu.querySelector('a')?.focus();
  }
  menuToggle?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu?.classList.contains('is-open')) {
      setMenu(false);
      menuToggle?.focus();
    }
  });

  // The three dimensions are editorial focus areas, not fabricated performance results.
  const modes = {
    speed: {
      index: '01 / PERFORMANCE DIMENSION', label: 'VELOCIDADE', title: 'SPEED',
      desc: 'Trabalhar aceleração, resposta e eficiência de movimento. Qualidade de execução em cada saída.',
      keywords: 'ACELERAÇÃO / RESPOSTA / RITMO'
    },
    power: {
      index: '02 / PERFORMANCE DIMENSION', label: 'POTÊNCIA', title: 'POWER',
      desc: 'Desenvolver produção de força, estabilidade e intenção em movimentos de alta demanda.',
      keywords: 'FORÇA / ESTABILIDADE / EXPLOSÃO'
    },
    mobility: {
      index: '03 / PERFORMANCE DIMENSION', label: 'MOBILIDADE', title: 'MOBILITY',
      desc: 'Explorar amplitude, controle articular e liberdade de movimento como parte do desempenho.',
      keywords: 'AMPLITUDE / CONTROLE / FLUIDEZ'
    }
  };
  const tabs = [...document.querySelectorAll('.method-tabs [role="tab"]')];
  const panel = document.getElementById('panel-method');
  const fields = {
    index: document.getElementById('panelIndex'), label: document.getElementById('panelLabel'),
    title: document.getElementById('panelTitle'), desc: document.getElementById('panelDescription'),
    keywords: document.getElementById('panelKeywords')
  };
  function activateTab(tab, focus = false) {
    const data = modes[tab.dataset.mode];
    if (!data) return;
    tabs.forEach(t => {
      const current = t === tab;
      t.setAttribute('aria-selected', String(current));
      t.tabIndex = current ? 0 : -1;
    });
    if (focus) tab.focus();
    panel?.setAttribute('aria-labelledby', tab.id);
    panel?.classList.remove('panel-switch');
    if (panel) void panel.offsetWidth; // Restart transition intentionally after content switch.
    if (fields.index) fields.index.textContent = data.index;
    if (fields.label) fields.label.textContent = data.label;
    if (fields.title) fields.title.innerHTML = `${data.title}<span class="panel-dot">.</span>`;
    if (fields.desc) fields.desc.textContent = data.desc;
    if (fields.keywords) fields.keywords.textContent = data.keywords;
    if (!prefersReduced.matches && !body.classList.contains('motion-off')) panel?.classList.add('panel-switch');
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', e => {
      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next >= 0) { e.preventDefault(); activateTab(tabs[next], true); }
    });
  });

  // Bring one process step into focus at a time as the visitor scrolls.
  const steps = [...document.querySelectorAll('.process-step')];
  steps[0]?.classList.add('is-current');
  if ('IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        steps.forEach(step => step.classList.toggle('is-current', step === entry.target));
      }
    }, { rootMargin: '-30% 0px -35% 0px', threshold: 0.01 });
    steps.forEach(step => stepObserver.observe(step));
  }

  // Optional cursor and magnetic CTA behavior for desktop pointer input.
  function cursorFrame() {
    if (!cursor) return;
    state.cursorX += (state.targetX - state.cursorX) * 0.18;
    state.cursorY += (state.targetY - state.cursorY) * 0.18;
    const size = cursor.classList.contains('is-hover') ? 64 : 32;
    cursor.style.transform = `translate3d(${state.cursorX - size/2}px, ${state.cursorY - size/2}px, 0)`;
    requestAnimationFrame(cursorFrame);
  }
  if (cursor && finePointer.matches && !prefersReduced.matches) {
    requestAnimationFrame(cursorFrame);
    document.addEventListener('pointermove', e => {
      state.targetX = e.clientX; state.targetY = e.clientY;
      cursor.classList.add('is-active');
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
    document.querySelectorAll('a, button, input, textarea').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', event => {
        if (body.classList.contains('motion-off')) return;
        const r = el.getBoundingClientRect();
        const x = (event.clientX - r.left - r.width / 2) / r.width;
        const y = (event.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * 11}px, ${y * 10}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  const motionToggle = document.getElementById('motionToggle');
  motionToggle?.addEventListener('click', () => {
    const off = body.classList.toggle('motion-off');
    motionToggle.setAttribute('aria-pressed', String(off));
    motionToggle.setAttribute('aria-label', off ? 'Ativar animações' : 'Pausar animações');
    motionToggle.title = off ? 'Ativar animações' : 'Pausar animações';
    if (off) heroPhoto.style.transform = '';
    else updateScroll();
  });

  // Intent builder only: no user data is transmitted without a configured destination.
  const form = document.getElementById('intentForm');
  const formNote = document.getElementById('formNote');
  const readyMessage = document.getElementById('messageReady');
  let preparedMessage = '';
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim().slice(0, 70);
    const goal = String(data.get('goal') || 'Performance');
    const detail = String(data.get('detail') || '').trim().slice(0, 320);
    if (!name) { form.querySelector('#intentName').focus(); return; }
    preparedMessage = `Olá, equipe Xande Lakiss! Meu nome é ${name} e quero conhecer melhor o trabalho de performance. Meu foco é ${goal.toLowerCase()}.${detail ? ` Meu objetivo: ${detail}` : ''} Gostaria de saber os próximos passos.`;
    readyMessage.hidden = false;
    if (formNote) formNote.textContent = 'Mensagem pronta. Você decide quando e para quem compartilhar; nenhum dado foi enviado.';
    readyMessage.scrollIntoView({ behavior: prefersReduced.matches ? 'auto' : 'smooth', block: 'nearest' });
  });
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fallback below */ }
    }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const copied = document.execCommand('copy'); ta.remove();
    return copied;
  }
  document.getElementById('copyMessage')?.addEventListener('click', async e => {
    if (!preparedMessage) return;
    const ok = await copyText(preparedMessage);
    e.currentTarget.textContent = ok ? 'COPIADA!' : 'SELECIONE E COPIE';
    if (!ok) window.prompt('Copie a mensagem:', preparedMessage);
  });
  document.getElementById('shareMessage')?.addEventListener('click', async () => {
    if (!preparedMessage) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'Mensagem para Xande Lakiss', text: preparedMessage }); return; } catch (_) { /* user cancelled or unavailable */ }
    }
    const ok = await copyText(preparedMessage);
    if (formNote) formNote.textContent = ok ? 'Mensagem copiada. Compartilhe com a equipe pelo seu canal de preferência.' : 'Use o botão copiar para preparar a mensagem.';
  });
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
