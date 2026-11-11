(() => {
  const key = 'helloiam.access.v1';
  if (sessionStorage.getItem(key) === 'granted') return;
  document.documentElement.classList.add('access-locked');
  const expected = '5b307f313ff312dedb4bdfd7656e2b74c0ed2c6b1008c54aa8349130f0cef626';
  async function digest(value) {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  document.addEventListener('DOMContentLoaded', () => {
    const gate = document.createElement('div');
    gate.id = 'access-gate';
    gate.innerHTML = '<form id="access-form"><h1>helloiam</h1><p>Введите пароль, чтобы открыть приложение</p><label for="access-password">Пароль</label><input id="access-password" type="password" autocomplete="current-password" required><button type="submit">Войти</button><p id="access-error" role="alert" aria-live="polite"></p></form>';
    document.body.append(gate);
    const form = gate.querySelector('form');
    const input = gate.querySelector('input');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = gate.querySelector('button');
      button.disabled = true;
      try {
        if (await digest(input.value) === expected) {
          sessionStorage.setItem(key, 'granted');
          gate.remove();
          document.documentElement.classList.remove('access-locked');
        } else {
          gate.querySelector('#access-error').textContent = 'Неверный пароль';
          input.select();
        }
      } finally { button.disabled = false; }
    });
    input.focus();
  }, { once: true });
})();
