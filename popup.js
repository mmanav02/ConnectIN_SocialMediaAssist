// popup.js
let mode = 'closed'; // 'closed' | 'open'

/* ───────── UI refs ───────── */
const logEl       = document.getElementById('log');
const dlLogBtn    = document.getElementById('downloadLog');
const modeBtn     = document.getElementById('modeToggleBtn');
const modeLabel   = document.getElementById('modeLabel');
const clearBtn    = document.getElementById('clearLog'); 
const manual_ui   = document.getElementById('manual-ui');
const auto_block  = document.getElementById('auto-block');

/* ───────── utils ───────── */
const log = m => {
  if(!logEl) return;
  logEl.textContent += m + '\n';
  logEl.scrollTop    = logEl.scrollHeight;
};

dlLogBtn.onclick = () => chrome.runtime.sendMessage({ cmd: 'downloadLog' });

modeBtn.onclick = async () => {
  mode = (mode === 'open') ? 'closed' : 'open';
  document.documentElement.dataset.mode = mode;               // drives CSS
  await chrome.storage.local.set({ popupMode: mode });        // persist
  applyMode();
};

/* ───────── init: read mode + api key, then paint ───────── */
(async function init() {
  const { popupMode } = await chrome.storage.local.get(['popupMode']);
  if (popupMode === 'open' || popupMode === 'closed') mode = popupMode;

  // reflect mode for CSS (no inline script needed)
  document.documentElement.dataset.mode = mode;
  applyMode();
})();


/* ───────── apply Closed vs Open (labels + visibility) ───────── */
function applyMode() {
  const isOpen = (mode === 'open');

  if (modeBtn) modeBtn.textContent = isOpen ? 'Switch to Closed' : 'Switch to Open';
  log(isOpen ? '🟦 Open mode: listening for website triggers…' : '🛑 Closed mode');
  if (modeLabel) modeLabel.textContent = `Current: ${isOpen ? 'Open' : 'Closed'}`;

  // Robust visibility toggle (don’t use .display on the node itself)
  if (manual_ui)  manual_ui.hidden  = isOpen;     // hide Manual when OPEN
  if (auto_block) auto_block.hidden = !isOpen;    // show Auto when OPEN

  if (isOpen) log('Waiting for URLs from Streaml…');
}

clearBtn.onclick = () => {
  if(logEl)
    logEl.textContent = '';
};