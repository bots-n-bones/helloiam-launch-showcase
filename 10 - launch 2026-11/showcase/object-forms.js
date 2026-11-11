(() => {
  const dialog = document.querySelector('#add-object-asset');
  const object = dialog.querySelector('[name="object"]');
  const reference = dialog.querySelector('[name="reference"]');
  const url = new URL(location.href);

  document.querySelector('[data-open-form]').addEventListener('click', () => {
    if (reference) reference.value = '';
    dialog.showModal();
  });
  dialog.querySelector('[data-close-form]').addEventListener('click', () => dialog.close());

  if (!object) {
    if (url.searchParams.get('add') === '1') {
      url.searchParams.delete('add');
      history.replaceState(history.state, '', url);
      dialog.showModal();
    }
    return;
  }

  const fields = dialog.querySelector('[data-object-fields]');
  const updateFields = () => { fields.hidden = !object.value; };
  object.addEventListener('change', updateFields);

  async function loadObjects() {
    const response = await fetch('objects.html');
    if (!response.ok) throw new Error('Objects unavailable');
    const source = new DOMParser().parseFromString(await response.text(), 'text/html');
    const links = source.querySelectorAll('.object-index a[href^="emoji.html#emoji-"]');
    if (!links.length) throw new Error('Objects unavailable');

    const options = Array.from(links, link => new Option(link.textContent, link.getAttribute('href').split('#')[1]));
    object.replaceChildren(new Option('Выберите объект', ''), ...options);
    object.disabled = false;
    object.value = url.searchParams.get('object') || '';
    updateFields();
    if (object.value && !dialog.open) dialog.showModal();
  }

  loadObjects().catch(() => {
    object.options[0].textContent = 'Список объектов недоступен';
  });
})();
