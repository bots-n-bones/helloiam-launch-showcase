(() => {
  const pages = [
    ['home', 'Главная'],
    ['objects', 'Объекты'],
    ['posts', 'Посты об объектах'],
    ['games', 'Игры'],
    ['promos', 'Промо'],
    ['links', 'Ссылки'],
  ];
  const currentPage = document.body.dataset.page;
  const currentSection = document.body.dataset.section ?? currentPage;

  const previousPages = {
    'object-launch': 'posts',
    reels: 'games',
  };

  function redirect(page, anchor = '') {
    const target = new URL(page + '.html', location.href);
    target.search = location.search;
    target.hash = anchor;
    location.replace(target.href);
    return true;
  }

  if (Object.hasOwn(previousPages, currentPage)) {
    const anchor = location.hash.slice(1);
    redirect(previousPages[currentPage], !anchor || anchor === 'top' ? currentPage : anchor);
    return;
  }

  function redirectObjectAnchor() {
    const anchor = location.hash.slice(1);
    const match = /^(emoji|media)(?:-|$)/.exec(anchor);
    return match ? redirect(match[1], anchor) : false;
  }

  function redirectLegacyAnchor() {
    if (redirectObjectAnchor()) return true;
    const anchor = location.hash.slice(1);
    if (anchor === 'design') return redirect('links', anchor);

    const section = anchor.replace(/-title$/, '');
    if (Object.hasOwn(previousPages, section)) return redirect(previousPages[section], anchor);
    if (section !== 'home' && pages.some(([slug]) => slug === section)) {
      return redirect(section, anchor === section ? '' : anchor);
    }
    return false;
  }

  if (currentPage === 'home') {
    if (redirectLegacyAnchor()) return;
    window.addEventListener('hashchange', redirectLegacyAnchor);
  }

  if (currentPage === 'objects') {
    if (redirectObjectAnchor()) return;
    window.addEventListener('hashchange', redirectObjectAnchor);
  }

  const navigation = document.querySelector('.jump');
  const currentLabel = pages.find(([slug]) => slug === currentSection)?.[1] ?? '';
  navigation.innerHTML = `
    <button class="jump-toggle" type="button" aria-expanded="false" aria-controls="jump-links">
      <span>Разделы</span>
      <span class="jump-current">${currentLabel}</span>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
    </button>
    <div class="jump-links" id="jump-links">
      ${pages.map(([slug, title]) => {
        const href = slug === 'home' ? './' : slug + '.html';
        const current = slug === currentPage ? ' aria-current="page"'
          : slug === currentSection ? ' aria-current="location"' : '';
        return `<a href="${href}"${current}>${title}</a>`;
      }).join('')}
    </div>`;

  const toggle = navigation.querySelector('.jump-toggle');
  const menuIsOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setMenuOpen = open => toggle.setAttribute('aria-expanded', String(open));

  toggle.addEventListener('click', () => setMenuOpen(!menuIsOpen()));
  document.addEventListener('click', event => {
    if (menuIsOpen() && (!navigation.contains(event.target) || event.target.closest('.jump-links a'))) {
      setMenuOpen(false);
    }
  });
  navigation.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !menuIsOpen()) return;
    setMenuOpen(false);
    toggle.focus();
  });
  window.addEventListener('pageshow', () => setMenuOpen(false));
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--jump-height', navigation.offsetHeight + 'px');
  }).observe(navigation);

  const dialog = document.querySelector('#player');
  if (!dialog) return;
  const video = dialog.querySelector('video');
  const title = dialog.querySelector('h2');

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-video]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !dialog.showModal) return;
    event.preventDefault();
    title.textContent = link.dataset.video;
    video.src = link.href;
    video.loop = link.hasAttribute('data-loop');
    dialog.showModal();
    video.play().catch(() => {});
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });
})();
