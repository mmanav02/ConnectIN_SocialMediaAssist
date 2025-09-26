// instagram/message.js
// Requires host_permissions: ["https://www.instagram.com/*", "https://instagram.com/*"]
import * as L from '../logger.js';

/* ----------------------- injected (page context) ----------------------- */
// Do NOT reference L.* inside these; they run in the page.

function igClickMessageButton() {
  const tryClick = () => {
    const btns = [...document.querySelectorAll('button, a, div[role="button"]')]
      .filter(el => /message/i.test((el.textContent || '').trim()));
    if (btns.length) { btns[0].click(); return true; }

    const plane = document.querySelector('svg[aria-label="Direct"], svg[aria-label="Messenger"]');
    if (plane) {
      const btn = plane.closest('button, a, div[role="button"]');
      if (btn) { btn.click(); return true; }
    }
    return false;
  };

  let tries = 0;
  const id = setInterval(() => {
    tries += 1;
    if (tryClick() || tries > 30) clearInterval(id);
  }, 300);
}

function igFillMessage(text) {
  const findBox = () => document.querySelector([
    'div[role="textbox"][aria-label="Message"]',
    'div[role="textbox"][aria-placeholder*="Message"]',
    'textarea[aria-label="Message"]',
    'textarea[placeholder*="Message"]',
    'div[contenteditable="true"][role="textbox"]'
  ].join(','));

  let tries = 0;
  const id = setInterval(() => {
    tries += 1;
    const box = findBox();
    if (!box) { if (tries > 40) clearInterval(id); return; }

    const tag = (box.tagName || '').toLowerCase();
    if (tag === 'textarea' || tag === 'input') {
      box.focus();
      box.value = text;
      box.dispatchEvent(new Event('input', { bubbles: true }));
      clearInterval(id);
      return;
    }

    box.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    box.dispatchEvent(new InputEvent('input', { bubbles: true }));
    clearInterval(id);
  }, 250);
}

/* -------------------------- helpers (bg context) -------------------------- */

function normalizeIgUrl(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  if (!s) return '';

  // Fix accidental instagram.com/https://... double prefix
  s = s.replace(/^https?:\/\/(?:www\.)?instagram\.com\/https?:\/\//i, 'https://');

  // If it's a bare username/handle
  if (!/^https?:\/\//i.test(s) && !/instagram\.com\//i.test(s)) {
    s = 'https://www.instagram.com/' + s.replace(/^@/, '');
  }

  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  s = s.replace(/([^:])\/\/+/g, '$1/');   // collapse duplicate slashes (not after scheme)
  if (!/\/$/.test(s)) s += '/';          // ensure trailing slash
  return s;
}

function pickFirstString(...vals) {
  for (const v of vals) {
    if (!v) continue;
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      if (typeof v.url === 'string')  return v.url;
      if (typeof v.href === 'string') return v.href;
      if (Array.isArray(v)) {
        for (const x of v) {
          const r = pickFirstString(x);
          if (r) return r;
        }
      }
    }
  }
  return '';
}

function getIgProfileUrl(entry) {
  const candidate =
    pickFirstString(
      entry?.url,
      entry?.profile_url,
      entry?.instagram,
      entry?.instagram_url, // <-- support your payload
      entry?.link,
      entry?.href
    ) ||
    (typeof entry === 'string' ? entry : '') ||
    (typeof entry?.username === 'string' ? entry.username : '') ||
    (typeof entry?.handle === 'string' ? entry.handle : '');

  return normalizeIgUrl(candidate);
}

function getMessageText(entry, persona) {
  const raw = entry?.message ?? entry?.custom_message ?? '';
  const text = typeof raw === 'string' ? raw : String(raw || '');
  // Fallback to persona if you want:
  // return text || (typeof persona === 'string' ? persona : '');
  return text;
}

/* ----------------------------- public entry ----------------------------- */

export async function instagramMessageAssist({
  profiles,
  delay,
  randomDelay,
  waitForTabLoad,
  persona, // optional
}) {
  const n = Array.isArray(profiles) ? profiles.length : 0;
  L.log(`DM run started, urls: ${n}`);

  for (const entry of profiles || []) {
    const url  = getIgProfileUrl(entry);
    const text = getMessageText(entry, persona);

    if (!url) {
      L.warn('IG: skipping entry without resolvable url', entry);
      continue;
    }

    try {
      await delay(randomDelay());
      L.log('opening profile URL at: ', url);

      L.log('📍Creating new tab...');
      const { id: tabId } = await chrome.tabs.create({ url, active: false });

      await waitForTabLoad(tabId);
      L.log('📍Tab loaded...');

      await delay(1200);

      L.log('Attempting to Open Message');
      await chrome.scripting.executeScript({
        target: { tabId: tabId /*, allFrames: false */ }, // <-- allFrames must be inside target (or omit)
        world: 'MAIN',
        func: igClickMessageButton,
      });

      await delay(1200 + randomDelay());

      await chrome.scripting.executeScript({
        target: { tabId: tabId /*, allFrames: false */ }, // <-- same here
        world: 'MAIN',
        func: igFillMessage,
        args: [text],
      });

      L.log('DM filled for', url);
    } catch (e) {
      L.error('IG DM error for', url, e?.message || e);
    }
  }

  L.log('DM run finished.');
}
