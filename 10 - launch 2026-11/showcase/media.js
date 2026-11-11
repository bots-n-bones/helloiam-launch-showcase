(async () => {
  const storageKey = 'helloiam.showcase.media-names.v1';
  const grid = document.querySelector('#media-grid');
  const search = document.querySelector('#media-search');
  const filter = document.querySelector('#media-type');
  const status = document.querySelector('#media-status');
  const feedback = document.querySelector('#media-feedback');
  const dialog = document.querySelector('#media-rename');
  const input = document.querySelector('#rename-input');
  const error = document.querySelector('#rename-error');
  const fileInput = document.querySelector('#media-import-file');
  const addDialog = document.querySelector('#add-object-asset');
  const referenceSelect = addDialog.querySelector('[name="reference"]');
  const source = new URL('../01-objects/02-media-unsorted/', location.href);
  const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

  async function readJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(url);
    return response.json();
  }

  const [items, defaults] = await Promise.all([
    readJson('media-catalog.json'),
    readJson('media-names.json').catch(() => ({})),
  ]);
  items.sort((first, second) => collator.compare(first.name, second.name));
  const files = new Set(items.map(item => item.name));
  const cards = new Map();

  function namesFrom(data, allowReset = false) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Нужен файл media-names.json.');
    const names = new Map();
    for (const [file, title] of Object.entries(data)) {
      if (!files.has(file)) continue;
      if (allowReset && title === null) names.set(file, null);
      if (typeof title === 'string' && title.trim() && title.trim().length <= 120) names.set(file, title.trim());
    }
    return names;
  }

  const projectNames = namesFrom(defaults);
  function readOverrides() {
    try {
      return namesFrom(JSON.parse(localStorage.getItem(storageKey) || '{}'), true);
    } catch {
      return new Map();
    }
  }
  let overrides = readOverrides();

  function displayName(file) {
    const title = overrides.has(file) ? overrides.get(file) : projectNames.get(file);
    return title ?? file;
  }

  function saveOverrides(next) {
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(next)));
    overrides = next;
  }

  let editing;
  function openEditor(file) {
    editing = file;
    document.querySelector('#rename-original').textContent = 'Исходный файл · ' + file;
    input.value = displayName(file) === file ? '' : displayName(file);
    input.placeholder = file;
    error.textContent = '';
    dialog.showModal();
    input.focus();
    input.select();
  }

  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'media-card';
    const preview = document.createElement('a');
    preview.className = 'media-preview';
    preview.href = new URL(encodeURIComponent(item.name), source);
    const image = document.createElement('img');
    image.src = item.preview;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = '';
    preview.append(image);

    if (item.type === 'video') {
      const badge = document.createElement('span');
      badge.className = 'watch-badge';
      badge.textContent = '▶ MP4';
      preview.append(badge);
    } else {
      preview.target = '_blank';
      preview.rel = 'noopener';
    }

    const body = document.createElement('div');
    body.className = 'media-card-body';
    const title = document.createElement('h3');
    title.className = 'media-name';
    const original = document.createElement('p');
    original.className = 'media-original';
    original.textContent = item.name;
    const rename = document.createElement('button');
    rename.type = 'button';
    rename.className = 'media-rename';
    rename.textContent = 'Переименовать';
    rename.addEventListener('click', () => openEditor(item.name));

    const reference = document.createElement('button');
    reference.type = 'button';
    reference.className = 'media-reference';
    reference.textContent = 'В референс';
    reference.addEventListener('click', () => {
      referenceSelect.value = item.name;
      addDialog.showModal();
    });
    const option = new Option(item.name, item.name);
    referenceSelect.add(option);

    const actions = document.createElement('div');
    actions.className = 'media-transfers media-card-actions';
    actions.append(rename, reference);
    body.append(title, original, actions);
    card.append(preview, body);
    grid.append(card);
    cards.set(item.name, { card, preview, title, original, rename, reference, option, type: item.type });
  }

  function refresh() {
    const query = search.value.trim().toLocaleLowerCase('ru');
    let visible = 0;
    for (const [file, elements] of cards) {
      const title = displayName(file);
      const formatMatches = !filter.value || filter.value === elements.type;
      const queryMatches = title.toLocaleLowerCase('ru').includes(query) || file.toLocaleLowerCase('ru').includes(query);
      elements.card.hidden = !formatMatches || !queryMatches;
      elements.title.textContent = title;
      elements.option.textContent = title;
      elements.reference.setAttribute('aria-label', 'В референс «' + title + '»');
      elements.original.hidden = title === file;
      elements.rename.setAttribute('aria-label', 'Переименовать «' + title + '»');
      elements.preview.setAttribute('aria-label', 'Открыть «' + title + '»');
      if (elements.type === 'video') elements.preview.dataset.video = title;
      if (!elements.card.hidden) visible++;
    }
    status.textContent = visible ? 'Показано ' + visible + ' из ' + items.length : 'По этому запросу ничего не найдено.';
  }

  document.querySelector('#rename-form').addEventListener('submit', event => {
    event.preventDefault();
    const title = input.value.trim();
    const next = readOverrides();
    if (title && title !== editing) next.set(editing, title);
    else if (projectNames.has(editing)) next.set(editing, null);
    else next.delete(editing);
    try {
      saveOverrides(next);
    } catch {
      error.textContent = 'Браузер не смог сохранить название. Проверьте доступ к локальному хранилищу.';
      return;
    }
    dialog.close();
    refresh();
    feedback.textContent = 'Название сохранено.';
  });

  document.querySelector('#rename-cancel').addEventListener('click', () => dialog.close());
  search.addEventListener('input', refresh);
  filter.addEventListener('change', refresh);
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    overrides = readOverrides();
    refresh();
  });

  document.querySelector('#media-export').addEventListener('click', () => {
    const titles = items.map(({ name }) => [name, displayName(name)]).filter(([name, title]) => name !== title);
    const content = JSON.stringify(Object.fromEntries(titles), null, 2) + '\n';
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const download = document.createElement('a');
    download.href = url;
    download.download = 'media-names.json';
    download.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  document.querySelector('#media-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    try {
      const incoming = namesFrom(JSON.parse(await file.text()));
      if (!incoming.size) {
        feedback.textContent = 'В файле нет названий для текущего каталога.';
        return;
      }
      const next = new Map([...readOverrides(), ...incoming]);
      saveOverrides(next);
      refresh();
      feedback.textContent = 'Импортировано названий · ' + incoming.size;
    } catch {
      feedback.textContent = 'Не удалось импортировать названия из JSON.';
    }
  });

  const videoCount = items.filter(item => item.type === 'video').length;
  document.querySelector('#media-count').textContent = 'Фото · ' + (items.length - videoCount) + ' / Видео · ' + videoCount;
  document.querySelector('#media-toolbar').hidden = false;
  refresh();
})().catch(() => {
  document.querySelector('#media-status').textContent = 'Не удалось загрузить каталог. Обновите страницу.';
});
