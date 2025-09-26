/* ───────────────────────────── imports ───────────────────────────── */
import { delay, randomDelay, waitForTabLoad } from './utils.js';
import * as L                                 from './logger.js';

chrome.runtime.onMessage.addListener((msg, _src, sendResponse) => {
  try {
    if (msg?.cmd === 'downloadLog') {
      L.downloadLog();
      sendResponse({ ok: true });
      return; // sync response is fine
    }
    if (msg?.cmd === 'dumpLog') {
      sendResponse({ lines: L.dumpLog() });
      return; // sync response is fine
    }
    if (msg?.type === 'LOG' && msg?.message) {
      L.log(msg.message);
      sendResponse({ ok: true });
      return; // sync response is fine
    }
  } catch (e) {
    // Always respond so the port doesn't hang/close
    sendResponse({ ok: false, error: String(e) });
  }
});

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'log-stream') {
    L.addListener(port); // this will postMessage({type:'LOG_LINE', line})
  }
});

import { linkedinUrlsMessageAssist }      from './linkedin/message.js';
import { twitterUrlsMessageAssist } from './twitter/message.js'
import { linkedInConnectionAssist } from './linkedin/connect.js';
import { instagramMessageAssist } from './instagram/message.js';

const { downloadLog } = L;

/* ───────────────── message listener (queue + log download) ───────── */
chrome.runtime.onMessage.addListener((msg, _src, res) => {
  if (msg?.cmd === 'downloadLog') {
    downloadLog();
    return true;
  }
});

/* ───────────────────────────── FIFO queue ────────────────────────── */
let busy = false;
const q  = [];

// Get the payload from app.streaml.app for linkedin assist
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FROM_CONTENT") {
    console.log("Received from content:", message.payload);
    // L.log('job enqueued, size: ',message.payload.data.length);
    const data = message.payload;
    console.log("data:",data);
    q.push(data);
    console.log("Queue before starting the drain:",q);
    if (!busy) drainReceivedUrls();
  }
});

async function drainReceivedUrls() {
  busy = true;
  L.log('drain started, length', q.length);
  while (q.length) {
    console.log("Queue before",q);
    console.log("Q Length:",q.length);
    const msg = q.shift();
    console.log("Q Length:",q.length);
    try {
      const dryRun = 1;
      const persona = msg.persona;
      const platform = msg.platform;
      const purpose = msg.purpose || 'No purpose specified';
      if(platform==="linkedin"){
        if(purpose==="send-connection"){
          await linkedInConnectionAssist({
            profiles: msg.data, 
            delay, 
            randomDelay, 
            waitForTabLoad
          })
        }
        else if(purpose==='message'){
          await linkedinUrlsMessageAssist({
            profiles: msg.linkedin_data, 
            dryRun, 
            delay, 
            randomDelay, 
            waitForTabLoad, 
            persona })
        }
      }
      else if(platform==="twitter"){
        L.log("Calling Twitter Assist");
        L.log("msg:",msg);
        L.log("Twitter Data:",msg.data);
        await twitterUrlsMessageAssist({
          profiles: msg.data,
          dryRun,
          delay,
          randomDelay,
          waitForTabLoad,
          persona
        })
      }
      else if(platform==="instagram"){
        L.log("Calling Instagram Assist");
        await instagramMessageAssist({
          profiles: msg.data,
          delay,
          randomDelay,
          waitForTabLoad
        })
      }
    console.log("Queue after",q);


    } catch (e) {
      L.error('runner error:', e.message || e);
    }
  }
  busy = false;
  L.log('drain finished');
}

// // for logging outside
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if (msg?.type === 'LOG') {
//     L.log(msg.message);
//   }
// });

