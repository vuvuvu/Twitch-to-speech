# TTSpeech - Twitch Chat Text-to-Speech

A browser-based Text-to-Speech application that reads Twitch chat messages aloud using your system's available voices. Perfect for streamers who want to hear their chat while focusing on gameplay or other activities.

## Features

- Real-time Twitch chat message reading
- Customizable voice selection (per-user or fixed voice)
- Adjustable speech rate, pitch, and volume
- Mute list for bots and unwanted users
- Dark theme interface
- Works directly in the browser - no installation needed

## Setup

1. Open `index.html` in a modern web browser
2. Enter your Twitch channel name
3. Select your preferred voice and adjust settings
4. Click "Connect" to start listening to chat

   ===

## Overlay version 

Created a branch overlay version will show the chat message while it reads TTS 
-uses urlparams "http://localhost/?channel=twitch_channel" 
so set that accordingly once you drag the "index.html" 
into a browser or obs or however you display overlays

## Usage

### Voice Selection
- Choose "Random English Human Voice" to assign different voices to different chatters
- Or select a specific voice for all messages

### Controls
- **Rate**: Adjust how fast the messages are read (0.5x - 2x)
- **Pitch**: Change the voice pitch (0 - 2)
- **Volume**: Control the output volume (0 - 1)

### Muting Users
- Add bot usernames or any other users to the muted list
- Separate multiple usernames with commas
- Common bots are muted by default

## Browser Compatibility

Works best in modern browsers that support the Web Speech API:
- Chrome
- Edge
- Safari
- Firefox

## Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements!

## License

MIT License - feel free to use and modify as needed.
