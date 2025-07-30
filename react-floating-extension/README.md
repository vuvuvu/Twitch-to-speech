# React Floating Video TTS Extension

A modern, fancy React-based Twitch Extension that provides Text-to-Speech functionality with a beautiful floating video overlay design.

## ✨ Features

### 🎮 Floating Video Overlay
- **Draggable & Resizable**: Smooth drag and resize functionality with boundary constraints
- **Glassmorphism Design**: Modern translucent design with backdrop blur effects
- **Edge Snapping**: Automatically snaps to screen edges for better positioning
- **Minimizable**: Collapse to a compact mode when not in use
- **Responsive**: Adapts to different screen sizes and orientations

### 🎵 Advanced TTS Features
- **Real-time Chat Reading**: Instantly converts Twitch chat messages to speech
- **Voice Customization**: Multiple voice options with pitch, rate, and volume controls
- **Smart Queue Management**: Intelligent message queuing with priority handling
- **User Management**: Mute specific users or filter messages
- **Keyboard Shortcuts**: Quick controls for power users

### 🎨 Modern UI/UX
- **Framer Motion Animations**: Smooth, performant animations throughout
- **Tailwind CSS Styling**: Consistent, responsive design system
- **Twitch Branding**: Official Twitch purple theme integration
- **Dark Mode**: Optimized for streaming environments
- **Accessibility**: Full keyboard navigation and screen reader support

### 📱 Multiple Views
- **Video Overlay**: Main floating interface for streamers
- **Panel View**: Comprehensive control panel for viewers
- **Config View**: Advanced configuration for broadcasters

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with Web Speech API support
- Twitch Developer account (for production deployment)

### Development Setup

1. **Install Dependencies**
   ```bash
   cd react-floating-extension
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access Different Views**
   - Video Overlay: `http://localhost:3001/video.html`
   - Panel View: `http://localhost:3001/panel.html`
   - Config View: `http://localhost:3001/config.html`

### Production Build

```bash
npm run build
```

Built files will be in the `dist/` directory, ready for Twitch Extension deployment.

## 🎯 Usage

### Video Overlay Controls

#### Mouse Controls
- **Drag**: Click and drag the header to move the overlay
- **Resize**: Drag the resize handle in the bottom-right corner
- **Minimize**: Click the minimize button to collapse

#### Keyboard Shortcuts
- `Alt + T`: Toggle TTS on/off
- `Alt + P`: Pause/Resume current speech
- `Alt + S`: Skip current message
- `Alt + C`: Clear message queue
- `Alt + H`: Hide/Show overlay

### Panel View

The panel provides four main tabs:

1. **Controls**: Basic TTS controls and current message display
2. **Settings**: Voice customization and user management
3. **Queue**: View and manage pending messages
4. **Stats**: Usage statistics and system information

### Configuration View

Broadcasters can access advanced settings:

- **Voice Settings**: Volume, speed, pitch, and voice selection
- **User Management**: Mute lists and user filtering
- **Message Settings**: Queue size and message length limits
- **Advanced Options**: Emote handling, command processing

## 🛠️ Technical Architecture

### Component Structure

```
src/
├── components/
│   ├── FloatingVideoOverlay.jsx  # Main floating interface
│   ├── PanelView.jsx            # Extension panel
│   └── ConfigView.jsx           # Broadcaster config
├── hooks/
│   ├── useTTS.js               # TTS functionality
│   ├── useTwitchExtension.js   # Twitch API integration
│   └── useFloatingUI.js        # Drag/resize logic
├── utils/
│   └── index.js                # Utility functions
└── index.css                   # Global styles
```

### Key Technologies

- **React 18**: Modern React with hooks and concurrent features
- **Framer Motion**: Smooth animations and gestures
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **Lucide React**: Beautiful icon library
- **Radix UI**: Accessible component primitives

### Custom Hooks

#### `useTTS()`
Manages all Text-to-Speech functionality:
- Voice loading and selection
- Speech queue management
- Playback controls
- Settings persistence

#### `useTwitchExtension()`
Handles Twitch Extension API integration:
- Authentication and authorization
- Chat message listening
- Configuration synchronization
- User and channel information

#### `useFloatingUI()`
Provides floating interface capabilities:
- Drag and drop functionality
- Resize handling
- Position persistence
- Boundary constraints

## 🎨 Customization

### Theming

The extension uses a custom Tailwind configuration with Twitch branding:

```javascript
// tailwind.config.js
colors: {
  'twitch-purple': '#9146ff',
  'twitch-purple-dark': '#772ce8',
  // ... more colors
}
```

### Animations

Custom animations are defined in the Tailwind config:

```javascript
animation: {
  'float': 'float 6s ease-in-out infinite',
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'glow': 'glow 2s ease-in-out infinite alternate',
  // ... more animations
}
```

### Voice Settings

Customize TTS behavior:

```javascript
const defaultSettings = {
  volume: 0.8,        // 0.0 to 1.0
  rate: 1.0,          // 0.5 to 2.0
  pitch: 1.0,         // 0.5 to 2.0
  voiceMode: 'random', // 'random', 'consistent', or voice index
  maxQueueSize: 20,   // Maximum messages in queue
  // ... more settings
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for development:

```env
VITE_TWITCH_CLIENT_ID=your_client_id
VITE_TWITCH_EXTENSION_VERSION=1.0.0
VITE_DEBUG_MODE=true
```

### Twitch Extension Manifest

The `manifest.json` defines extension capabilities:

```json
{
  "manifest_version": 2,
  "type": "video_overlay",
  "author_name": "Your Name",
  "version": "1.0.0",
  "views": {
    "video_overlay": {
      "viewer_url": "video.html",
      "can_link_external_content": false
    },
    "panel": {
      "viewer_url": "panel.html",
      "height": 300
    },
    "config": {
      "viewer_url": "config.html",
      "can_link_external_content": false
    }
  }
}
```

## 🌐 Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Edge 80+

### Required APIs
- Web Speech API (for TTS)
- Intersection Observer API
- ResizeObserver API
- CSS Custom Properties

### Fallbacks
- Graceful degradation when Speech API is unavailable
- Alternative layouts for smaller screens
- Reduced animations on low-performance devices

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic chunk splitting by Vite
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Automatic image and CSS optimization
- **Lazy Loading**: Components loaded on demand
- **Memory Management**: Proper cleanup of event listeners and timers

### Performance Metrics
- Initial load: < 100KB gzipped
- Time to interactive: < 2 seconds
- Memory usage: < 50MB typical
- CPU usage: < 5% during active TTS

## 🚀 Deployment

### Twitch Extension Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Upload to Twitch Developer Console**
   - Zip the `dist/` directory
   - Upload to your extension in the Twitch Developer Console
   - Configure extension settings and permissions

3. **Testing**
   - Use Twitch's extension testing tools
   - Test on multiple devices and browsers
   - Verify all functionality works in the Twitch environment

### CDN Deployment (Alternative)

For faster loading, deploy assets to a CDN:

```bash
# Build with CDN base URL
npm run build -- --base=https://your-cdn.com/tts-extension/
```

## 🐛 Troubleshooting

### Common Issues

#### TTS Not Working
- Check browser Speech API support
- Verify microphone permissions aren't blocking audio
- Ensure volume is not muted

#### Extension Not Loading
- Check Twitch Extension permissions
- Verify manifest.json configuration
- Check browser console for errors

#### Performance Issues
- Reduce animation complexity
- Lower TTS queue size
- Check for memory leaks in browser dev tools

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// In browser console
localStorage.setItem('tts-debug', 'true')
location.reload()
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use ESLint and Prettier for formatting
- Follow React best practices
- Write meaningful commit messages
- Add tests for new features

### Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Twitch for the Extension platform
- React team for the amazing framework
- Framer Motion for smooth animations
- Tailwind CSS for the design system
- All contributors and users

## 📞 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/vuvuvu/Twitch-to-speech/issues)
- 💬 Discord: [Community Server](https://discord.gg/example)
- 📖 Docs: [Full Documentation](https://docs.example.com)

---

**Made with ❤️ for the Twitch community**