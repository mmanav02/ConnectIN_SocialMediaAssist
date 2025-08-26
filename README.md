# Streaml ConnectIN - Your Social Media Outreach Assistant

Hey there! 👋 This is ConnectIN, a Chrome extension that helps you manage your LinkedIn and X (Twitter) outreach without the robotic feel. Think of it as your personal assistant for social media networking.

## What's This All About?

ConnectIN works with Streaml to help you send personalized messages to LinkedIn profiles and X users. It can also send connection requests on LinkedIn. It's designed to be simple, safe, and actually useful - no AI-generated spam here!

### Two Modes to Keep You in Control

- **Open Mode**: Ready to help! When Streaml sends you profile URLs, ConnectIN will send your saved message or connection request to each one.
- **Closed Mode**: Taking a break. All incoming requests are ignored, and any pending work gets cleared. Perfect for when you want to step back.

## How It Works (The Simple Version)

1. **Set up your message**: Open the extension popup and write your default message in the Open section
2. **Go live**: Switch the extension to Open mode
3. **Let it work**: Streaml sends LinkedIn/X profile URLs to your extension
4. **Review & send**: For each profile, ConnectIN opens the page, asks for your permission, and either:
   - Sends your personalized message, or
   - Sends a connection request with your note

When you're in Closed mode, everything stops - no surprises, no unwanted messages.

## Getting Started

### Installation (Developer Mode)

1. Download or clone this project to your computer
2. Open Chrome and go to `chrome://extensions`
3. Turn on **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select this project folder
5. Pin the extension to your toolbar for easy access (optional but recommended)

## Behind the Scenes

Here's what happens when ConnectIN is working:

- It only accepts messages when you're in Open mode
- Uses a simple queue system (first in, first out) for incoming URLs
- Double-checks your mode before each send - if you've switched to Closed, it stops everything
- Opens each profile in a background tab, waits for it to load, then:
  - Asks for your permission before taking action
  - Either sends your message or connection request based on what Streaml requests
  - For messages: finds and clicks the Message button, types your message, and sends it
  - For connections: clicks Connect, adds your note, and sends the request

## Privacy & Permissions

We keep it minimal and focused:

- **tabs, scripting, activeTab**: Needed to open profile pages and send messages/requests
- **storage**: Saves your mode preference and default message
- **LinkedIn & X only**: The extension only works on `linkedin.com` and `x.com` - no other sites

## Why This Exists

Social media outreach can be time-consuming and repetitive. ConnectIN is here to help you:
- Save time on routine networking
- Keep your outreach organized
- Stay in control of your messaging and connection requests
- Work seamlessly with Streaml

## License

MIT License - feel free to use, modify, and share!

---

**Note**: This extension is not affiliated with LinkedIn, X (Twitter). It's a third-party tool designed to make your social media workflow a bit easier.