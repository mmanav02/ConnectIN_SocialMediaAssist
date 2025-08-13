import * as L from './logger.js';

/* time helpers */
export const delay       = ms => new Promise(r => setTimeout(r, ms));
export const randomDelay = () => Math.floor(Math.random() * 4000) + 4000;

/* wait for chrome.tabs status === 'complete' */
export function waitForTabLoad(id, time = 15000) {
  L.log('waitForTabLoad start', id);
  return new Promise(r => {
    chrome.tabs.get(id, tab => {
      if (chrome.runtime.lastError || tab.status === 'complete') {
        L.log('tab already complete', id);
        return r();
      }
      const listener = (i, info) => {
        if (i === id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(to);
          L.log('tab finished loading', id);
          r();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      const to = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        L.warn('tab timeout', id);
        r();
      }, time);
    });
  });
}