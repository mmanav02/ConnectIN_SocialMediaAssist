# ConnectIN - LinkedIn Message Assist (MV3)

A **LinkedIn-only** Chrome extension that sends a **saved default message** to LinkedIn profiles.

- **Open mode**: receives profile URLs from **Streaml** (via `chrome.runtime.sendMessage` to the extension) and sends your saved default message automatically.
- **Closed mode**: does nothing (incoming URLs are rejected and any pending work is cleared).

---

## Features

- **Modes**
  - **Open** → Listens for LinkedIn profile URLs from Streaml and sends your saved default message.
  - **Closed** → Ignores all incoming messages (safe/standby). Queue is cleared.
- **Minimal UI** to toggle mode and store your default message.
- **LinkedIn-only** permissions and lightweight codebase.

---

## How it works

1. Open the popup and set your **default message** (in the Open section).
2. Switch the extension to **Open**.
3. **Streaml** (from an allowed origin) sends an array of LinkedIn profile URLs along with the **message** to be sent to your extension ID.
4. The extension opens each profile in a background tab, **asks user permission to fill the message box** opens the **Message** composer, types your default message, and clicks **Send**.

> When **Closed**, the background rejects incoming messages and clears any pending queue items.

---

## Install (developer mode)

1. Download or clone the project folder.
2. Visit `chrome://extensions` and enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the project folder.
4. Pin the extension for quick access (optional).

---

## Background behavior (overview)

- Receives external messages only when **Open**.
- Uses a FIFO queue for incoming URLs.
- Before each send, re-checks mode; if changed to Closed, exits and clears queue.
- Opens profile tab, waits for load, injects a content script that:
  - Asks user permission to fill the message box
  - Clicks **Message** button (via robust selector heuristics).
  - Focuses message editor (`div[role="textbox"][contenteditable="true"]`).
  - Inserts the default message and triggers input events.
  - Clicks a **Send** button (form submit or visible button text).

---

## Permissions rationale

- `tabs`, `scripting`, `activeTab` — open profile tabs and inject message-sending code.
- `storage` — store `popupMode` and your default message.
- `host_permissions: ["https://www.linkedin.com/*"]` — locked to LinkedIn only.

---

## License

MIT License