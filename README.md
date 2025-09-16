# Streaml ConnectIN - Social Media Outreach Assistant

A powerful Chrome extension designed to streamline your social media outreach on LinkedIn and X (Twitter). ConnectIN integrates seamlessly with the Streaml platform to automate personalized messaging and connection requests while keeping you in full control.

## 🚀 Features

### LinkedIn Integration
- **Automated Messaging**: Send personalized direct messages to LinkedIn profiles
- **Connection Requests**: Automatically send connection requests with custom notes
- **Smart Queue System**: Processes profiles in FIFO order with built-in delays
- **User Confirmation**: Always asks for permission before taking action

### X (Twitter) Integration
- **Direct Messaging**: Send personalized DMs to Twitter/X profiles
- **Profile Detection**: Automatically finds and opens DM interfaces
- **Message Drafting**: Fills message content for your review before sending

### Control & Safety
- **Open/Closed Modes**: Toggle between active and inactive states
- **Manual Review**: Every action requires your confirmation
- **Queue Management**: Built-in delays and error handling
- **Logging System**: Track all activities with downloadable logs

## 🎯 How It Works

### Two Operating Modes

- **Open Mode**: Active and ready to process requests from Streaml
- **Closed Mode**: Inactive - ignores all incoming requests and clears pending work

### Workflow Process

1. **Setup**: Configure your extension in Open mode
2. **Integration**: Streaml sends profile URLs and messages to the extension
3. **Processing**: Extension opens each profile in a background tab
4. **Confirmation**: Asks for your permission before taking action
5. **Execution**: Sends messages or connection requests based on your approval
6. **Cleanup**: Closes tabs and logs activities

## 📋 Supported Actions

### LinkedIn Features
- **Send Messages**: Automatically fills and sends direct messages
- **Send Connection Requests**: Sends connection requests with custom notes
- **Profile Navigation**: Opens LinkedIn profiles in background tabs
- **Modal Handling**: Manages LinkedIn's connection request modals

### X (Twitter) Features
- **Send DMs**: Automatically fills and sends direct messages
- **Profile Navigation**: Opens Twitter/X profiles in background tabs
- **DM Interface**: Handles Twitter's messaging interface

## 🔧 Installation

### Developer Mode Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked** and select this project folder
5. Pin the extension to your toolbar for easy access

## 🔐 Permissions & Privacy

### Required Permissions

- **`scripting`**: Required to inject scripts into LinkedIn and X pages for automation
- **`storage`**: Stores your mode preferences and settings locally
- **`downloads`**: Enables log file downloads for activity tracking

### Host Permissions

- **`https://www.linkedin.com/*`**: Access LinkedIn for messaging and connection features
- **`*://x.com/*`**: Access X (Twitter) for direct messaging
- **`*://twitter.com/*`**: Access Twitter legacy URLs for direct messaging
- **`https://app.streaml.app/*`**: Integration with Streaml platform

### Content Scripts

- **LinkedIn Pages**: Injects scripts for profile interaction
- **X/Twitter Pages**: Handles direct messaging functionality
- **Streaml App**: Bridge communication between Streaml and extension

## 🛡️ Safety & Control Features

- **User Confirmation**: Every action requires explicit user approval
- **Mode Toggle**: Easy switch between active and inactive states
- **Queue Management**: Processes requests one at a time with delays
- **Error Handling**: Graceful handling of failed operations
- **Activity Logging**: Complete audit trail of all actions

## 🔄 Integration with Streaml

This extension is specifically designed to work with the **app.streaml.app** platform:

- Receives profile URLs and messages from Streaml
- Processes LinkedIn and X profiles automatically
- Sends back status updates and completion confirmations
- Maintains queue of pending operations

## 📊 Technical Details

### Architecture
- **Manifest V3**: Uses latest Chrome extension standards
- **Service Worker**: Background processing for queue management
- **Content Scripts**: Page interaction and automation
- **Message Passing**: Secure communication between components

### Queue System
- **FIFO Processing**: First-in, first-out queue management
- **Random Delays**: Built-in delays to avoid detection
- **Error Recovery**: Continues processing even if individual operations fail
- **Status Tracking**: Real-time status updates and logging

## ⚠️ Important Disclaimers

### Third-Party Tool
This extension is **NOT affiliated with LinkedIn, X (Twitter), or Meta**. It is an independent third-party tool designed to enhance your social media workflow.

### Platform Integration
This extension is specifically created for use with the **app.streaml.app** website and platform. It is designed to integrate seamlessly with Streaml's social media management features.

### Responsible Use
- Always review messages before sending
- Respect platform terms of service
- Use appropriate delays between actions
- Monitor your activity to avoid spam detection

## 📝 License

MIT License - feel free to use, modify, and share!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

**Version**: 0.1.3  
**Compatibility**: Chrome Extensions Manifest V3  
**Platform**: Designed for app.streaml.app integration