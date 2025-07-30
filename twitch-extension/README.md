# Twitch TTS Extension

A simplified Twitch Extension that converts chat messages to speech using the browser's built-in Text-to-Speech API.

## Features

- **Essential TTS Controls**: Power toggle, pause/resume, clear queue
- **Voice Customization**: Voice selection, volume, rate, and pitch controls
- **User Management**: Mute specific users from TTS
- **Queue Management**: Real-time queue status and current message display
- **Lightweight**: No external dependencies, uses browser's native Speech Synthesis API

## Development Setup

### Prerequisites

- Node.js 14+ (for local development server)
- Modern web browser with Speech Synthesis API support

### Local Development

1. **Start the development server:**
   ```bash
   cd twitch-extension
   npm start
   ```

2. **Access the extension:**
   - Open http://localhost:8080 in your browser
   - The extension will run in standalone mode for testing

### Testing

- **Standalone Mode**: When running locally without Twitch Extension API, the extension will simulate chat messages for testing
- **Voice Testing**: Use the controls to test different voices, settings, and functionality
- **Settings Persistence**: Settings are saved to localStorage

## Twitch Extension Integration

### Files Structure

```
twitch-extension/
├── manifest.json          # Extension configuration
├── public/
│   ├── panel.html         # Main extension panel
│   ├── panel.css          # Styling
│   └── panel.js           # Core functionality
├── server.js              # Development server
├── package.json           # Project configuration
└── README.md              # This file
```

### Key Components

#### 1. TTS Manager
- Handles speech synthesis
- Manages voice selection and user-voice mapping
- Filters and processes chat messages
- Queue management for smooth playback

#### 2. Settings Manager
- Persistent settings storage
- Real-time settings updates
- Muted users management

#### 3. Twitch Integration
- Twitch Extension API integration
- Chat message listening
- Extension configuration support

### Extension Configuration

**Type**: Panel Extension
**Dimensions**: 320x500px
**Supported Views**: Panel only
**Permissions**: None required (uses browser APIs)

## Usage

### Basic Controls

1. **Power Button**: Start/Stop TTS functionality
2. **Pause/Resume**: Control playback without stopping
3. **Clear Queue**: Remove all queued messages

### Settings

- **Voice**: Choose between random voice assignment or specific voice
- **Volume**: Adjust speech volume (0.0 - 1.0)
- **Rate**: Control speech speed (0.1 - 2.0)
- **Pitch**: Modify voice pitch (0.0 - 2.0)
- **Muted Users**: Comma-separated list of usernames to ignore

### Features

- **Smart Filtering**: Removes excessive repeated characters and URLs
- **User Voice Mapping**: Consistent voice assignment per user in random mode
- **Queue Display**: Shows current queue size and active message
- **Error Handling**: Graceful handling of speech synthesis errors

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile**: Limited support (iOS Safari has restrictions)

## Limitations

- Requires user interaction to start (browser autoplay policies)
- Voice availability varies by browser and OS
- No persistent chat history
- Limited to browser's speech synthesis capabilities

## Development Notes

### Twitch Extension API

The extension is designed to work with Twitch's Extension API:

```javascript
// Extension initialization
this.twitch.onAuthorized = (auth) => {
    this.setupChatListener();
};

// Chat message handling
this.twitch.listen('broadcast', (target, contentType, body) => {
    const data = JSON.parse(body);
    if (data.type === 'chat_message') {
        this.handleChatMessage(data.user, data.message);
    }
});
```

### Testing Without Twitch

For development, the extension includes a test mode that simulates chat messages:

```javascript
// Simulated chat for testing
if (!window.Twitch) {
    // Generates test messages every 5 seconds
}
```

## Deployment

1. **Prepare files**: Ensure all files in `public/` directory are ready
2. **Upload to Twitch**: Use Twitch Developer Console to upload extension files
3. **Configure**: Set up extension settings in Twitch Developer Console
4. **Test**: Use Twitch Developer Rig for testing
5. **Submit**: Submit for review when ready

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details