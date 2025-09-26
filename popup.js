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

function appendLine(s) {
  if (!logEl) return;
  logEl.textContent += s + '\n';
  logEl.scrollTop = logEl.scrollHeight;
}

function safeSendMessage(msg) {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage(msg, resp => {
        if (chrome.runtime.lastError) {
          // Receiving end does not exist / port closed -> background not ready
          return resolve(null);
        }
        resolve(resp || null);
      });
    } catch {
      resolve(null);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Try to pull history. If the worker isn’t ready, just continue.
  const resp = await safeSendMessage({ cmd: 'dumpLog' });
  if (resp?.lines?.length) resp.lines.forEach(appendLine);

  // 2) Open a long-lived port for live logs. If background isn’t ready yet,
  // retry once after a short delay.
  function connectLogStream(attempt = 1) {
    try {
      const port = chrome.runtime.connect({ name: 'log-stream' });
      port.onMessage.addListener(msg => {
        if (msg?.type === 'LOG_LINE' && msg?.line) appendLine(msg.line);
      });
      port.onDisconnect.addListener(() => {
        // Reconnect once if it disconnects instantly (worker slept/reloaded)
        if (attempt <= 2) setTimeout(() => connectLogStream(attempt + 1), 200);
      });
    } catch (e) {
      if (attempt <= 2) setTimeout(() => connectLogStream(attempt + 1), 200);
    }
  }
  connectLogStream();

  dlLogBtn.onclick = () => safeSendMessage({ cmd: 'downloadLog' });
  clearBtn.onclick = () => { if (logEl) logEl.textContent = ''; };
});

// 1) Load history
chrome.runtime.sendMessage({ cmd: 'dumpLog' }, (resp) => {
  if (resp?.lines?.length) {
    for (const line of resp.lines) appendLine(line);
  }
});

// 2) Subscribe for live lines
const port = chrome.runtime.connect({ name: 'log-stream' });
port.onMessage.addListener(msg => {
  if (msg?.type === 'LOG_LINE' && msg?.line) appendLine(msg.line);
});

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