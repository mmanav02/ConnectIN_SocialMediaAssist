/* ───────────────────────────── imports ───────────────────────────── */
import { delay, randomDelay, waitForTabLoad } from './utils.js';
import * as L                                 from './logger.js';
import { linkedinUrlsMessageAssist }      from './linkedin/message.js';
import { twitterUrlsMessageAssist } from './twitter/message.js'
import { linkedInConnectionAssist } from './linkedin/connect.js';

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
    q.push(data);
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
    console.log("Queue after",q);


    } catch (e) {
      L.error('runner error:', e.message || e);
    }
  }
  busy = false;
  L.log('drain finished');
}

// for logging outside
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'LOG') {
    L.log(msg.message);
  }
});