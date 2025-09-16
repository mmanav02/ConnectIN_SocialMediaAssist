import * as L from "../logger.js";

function waitForTabLoad(tabId) {
  return new Promise(resolve => {
    chrome.tabs.onUpdated.addListener(function listener(id, changeInfo) {
      if (id === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
}

// Helper for delays
const delay = ms => new Promise(r => setTimeout(r, ms));

/**
 * Main function to orchestrate sending LinkedIn connection requests.
 * @param {Array<Object>} profiles - An array of objects, each with a 'url' and 'message' property.
 */
export async function linkedInConnectionAssist({ profiles, delay, randomDelay, waitForTabLoad }) {
  console.log(`Starting LinkedIn connection run for ${profiles.length} profiles.`);

  for (const profile of profiles) {
    L.log("Profiles");
    L.log(profiles);
    const { url, text } = profile;

    console.log(`Processing: ${url}`);

    await delay(randomDelay());
    
    // Create a new, active tab for the profile.
    const { id: tabId } = await chrome.tabs.create({ url, active: true });
    await waitForTabLoad(tabId);
    console.log(`Tab ${tabId} loaded for ${url}`);

    // Add a small delay for the page's JavaScript to finish loading.
    await delay(2000);

    // Execute the content script to send the request.
    await chrome.scripting.executeScript({
      target: { tabId },
      func: sendLinkedInRequest,
      args: [text],
    });

    console.log(`Script injected for ${url}. Closing tab in 6 seconds...`);
    // Wait a moment before closing to ensure the request is sent.
    await delay(6000);
    await chrome.tabs.remove(tabId);
  }

  console.log('LinkedIn connection run finished.');
}

// This function is injected into the LinkedIn page.
async function sendLinkedInRequest(noteText) {
  const withNote = noteText && noteText.trim() !== '';

  const proceed = window.confirm(
      "Do you want to send connection request automatically?\n"+noteText
    );
    if (!proceed) {
      console.log("User declined to fill message.");
      return;
  }

  // Utility functions (no changes needed here)
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const waitFor = (sel, timeout = 7000) =>
    new Promise((res, rej) => {
      const t0 = Date.now();
      const interval = setInterval(() => {
        const el = document.querySelector(sel);
        if (el) {
          clearInterval(interval);
          return res(el);
        }
        if (Date.now() - t0 >= timeout) {
          clearInterval(interval);
          rej(new Error(`Timeout waiting for selector: ${sel}`));
        }
      }, 200);
    });

  try {
    // =================================================================================
    // STEP 1: Find and click the "Connect" button. (This part is working correctly)
    // =================================================================================
    console.log('Searching for a "Connect" button...');
    const connectButtonSelector = '[aria-label^="Invite"][aria-label*="to connect"]';
    
    const connectButton = await waitFor(connectButtonSelector);
    console.log('"Connect" button found.');
    connectButton.click();

    // =================================================================================
    // STEP 2 & 3: Handle the connection modal (popup).
    // =================================================================================
    console.log('Waiting for connection modal to appear...');
    const modal = await waitFor('div[role="dialog"]');

    if (withNote) {
      console.log('Proceeding with a note.');
      const addNoteButton = await waitFor('button[aria-label="Add a note"]', 5000);
      addNoteButton.click();

      const messageTextArea = await waitFor('textarea[name="message"]', 5000);
      messageTextArea.value = noteText;
      messageTextArea.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('Note added to textarea.');

      await delay(500);

      // UPDATED: Changed the selector to find the primary button by its class,
      // which is more stable than its label. We also wait for it to be enabled.
      const sendButtonWithNote = await waitFor('div[role="dialog"] button.artdeco-button--primary:not([disabled])', 5000);
      sendButtonWithNote.click();
      console.log('SUCCESS: Connection request with note sent.');

    } else {
      console.log('Proceeding without a note.');
      
      // UPDATED: Changed the selector for the "Send" button. Instead of looking for
      // aria-label="Send", we now look for the primary button in the modal.
      // This is the direct fix for the error you received.
      const sendWithoutNoteButton = await waitFor('div[role="dialog"] button.artdeco-button--primary', 5000);
      sendWithoutNoteButton.click();
      console.log('SUCCESS: Connection request without note sent.');
    }
    return true;

  } catch (error) {
    console.error('Error sending connection request:', error.message);
    if (document.querySelector('span.pvs-contact-info__contact-type:is(:contains("1st"), :contains("Pending"))')) {
        console.log("This profile is already a 1st degree connection or the request is pending.");
    }
    return false;
  }
}