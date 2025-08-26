import * as L           from '../logger.js';

async function fillTwitterDM(text) {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const waitFor = (sel, timeout = 6000, step = 200) =>
    new Promise((res, rej) => {
      const t0 = Date.now();
      (function poll() {
        const el = document.querySelector(sel);
        if (el) return res(el);
        if (Date.now() - t0 >= timeout) return rej('timeout');
        setTimeout(poll, step);
      })();
    });
  const proceed = window.confirm(
      "Do you want to fill the message automatically?\n"+text
    );
    if (!proceed) {
      console.log("User declined to fill message.");
      return;
  }

  const openBtn = await waitFor(
    'button[data-testid="sendDMFromProfile"], div[data-testid="DMButton"], a[href*="/messages/compose"]'
  ).catch(() => null);
  if (!openBtn) { console.warn('DM button not found'); return false; }

  openBtn.click();
  await delay(800);

  const box = await waitFor(
    'div[contenteditable="true"][data-testid="dmComposerTextInput"], ' +
    'div[data-testid="dmComposerTextInputRichTextInputContainer"] div[contenteditable="true"]'
  ).catch(() => null);
  if (!box) { console.warn('DM text box not found'); return false; }

  
  
  box.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, text);
  box.dispatchEvent(new InputEvent('input', { bubbles: true }));
  console.log('DM drafted – review before sending');
  return true;
}


export async function twitterUrlsMessageAssist(
  { profiles, dryRun, delay, randomDelay, waitForTabLoad, persona }
) {
    dryRun=1;
  L.log(`Twitter DM run – urls: ${profiles.length}`);
  L.log(profiles)
  for (const profile of profiles) {
    await delay(randomDelay());
    const url = profile.twitter_url;
    const text = profile.message;
    L.log("Creating new tab...");
    
    const { id } = await chrome.tabs.create({ url, active: false });
    await waitForTabLoad(id);

    L.log("Tab Loaded...");

    await delay(randomDelay());

    if(dryRun) {
      await chrome.scripting.executeScript({
        target: { tabId: id },
        func  : fillTwitterDM,
        args  : [text],
      });
      L.log('DM filled of', url);
    }
  }
  L.log('Twitter DM run finished.');
}