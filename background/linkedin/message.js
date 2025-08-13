import * as L           from '../logger.js';

function fillMessage(text) {
  const proceed = window.confirm(
      "Do you want to fill the following message automatically?\n"+"Message: "+text
    );
    if (!proceed) {
      console.log("User declined to fill message.");
      return;
    }
  const btn = document.querySelector('button[aria-label^="Message"], a[href*="messaging?"]');
  if (!btn) {
    console.warn('Message button not found');
    return;
  }
  btn.click();

  const waitBox = (cb, t = 0) => {
    const box = document.querySelector(
      '[contenteditable="true"][role="textbox"].msg-form__contenteditable'
    );
    if (box) return cb(box);
    if (t < 5000) setTimeout(() => waitBox(cb, t + 200), 200);
  };

  waitBox(box => {
    
    box.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    box.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('DM text inserted – waiting for manual review before sending');
  });
}

/* Linkedin Automated Message received from site */
export async function linkedinUrlsMessageAssist(
  { profiles, dryRun, delay, randomDelay, waitForTabLoad, persona }
) {
  dryRun = 1
  L.log(`DM run started, urls: ${profiles.length}`);

  for (const profile of profiles) {
    try{
      await delay(randomDelay());
      const url = profile.url;
      const text = profile.message;
      L.log('opening profile URL at: ', url);

      L.log("📍Creating new tab...");
      const { id } = await chrome.tabs.create({ url, active: false });
      await waitForTabLoad(id);

      L.log("📍Tab loaded...");


      await delay(randomDelay());

      if(!dryRun)
      {
        await chrome.scripting.executeScript({
        target: { tabId: id },
        func  : sendMessage,
        args  : [text],
        world : 'MAIN'
        });
      }
      else{
        
        await chrome.scripting.executeScript({
        target: { tabId: id },
        func  : fillMessage,
        args  : [text],
        world : 'MAIN'
      }).catch(e => console.error('❌ executeScript failed:', e));
      }

      L.log('DM sent to', url);
    } catch(e){
      console.error("Error sending message to", url, e);
    }
  }

  L.log('DM run finished.');
}