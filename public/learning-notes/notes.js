const buttons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-note-category]')];
for (const button of buttons) button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
  let count = 0;
  for (const card of cards) {
    card.hidden = selected !== 'All' && card.dataset.noteCategory !== selected;
    if (!card.hidden) count++;
  }
  document.getElementById('note-count').textContent = `${count} ${count === 1 ? 'note' : 'notes'} shown${selected === 'All' ? '' : ' / ' + selected}`;
  document.getElementById('empty-state').hidden = count > 0;
  document.getElementById('empty-category').textContent = selected;
});
let toastTimer;
for (const button of document.querySelectorAll('.copy-code')) button.addEventListener('click', async () => {
  const code = button.closest('.code-block').querySelector('code').textContent;
  const toast = document.getElementById('toast');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Unavailable');
    await navigator.clipboard.writeText(code);
    toast.textContent = 'Copied. Review the example before using it.';
  } catch { toast.textContent = 'Clipboard blocked. Select the code and copy it manually.'; }
  clearTimeout(toastTimer);
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
});
