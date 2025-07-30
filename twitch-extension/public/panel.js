// Twitch Extension TTS Panel
class TwitchTTSExtension {
    constructor() {
        this.isActive = false;
        this.isPaused = false;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.userVoices = new Map();
        this.speechQueue = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.mutedUsers = new Set();
        
        // Settings
        this.settings = {
            volume: 0.8,
            rate: 1.0,
            pitch: 0.8,
            voiceMode: 'random',
            mutedUsers: 'streamelements'
        };
        
        // Stats
        this.messageCount = 0;
        this.queueCount = 0;
        
        // Twitch Extension API
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize TTS
            await this.initializeTTS();
            
            // Set up Twitch Extension
            this.setupTwitchExtension();
            
            // Set up UI event listeners
            this.setupEventListeners();
            
            // Load settings
            this.loadSettings();
            
            this.updateStatus('Ready');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateStatus('Error: ' + error.message);
        }
    }
    
    async initializeTTS() {
        if (!this.synthesis) {
            throw new Error('Speech synthesis not supported');
        }
        
        return new Promise((resolve, reject) => {
            const loadVoices = () => {
                const systemVoices = this.synthesis.getVoices();
                if (systemVoices.length === 0) {
                    setTimeout(() => {
                        const retryVoices = this.synthesis.getVoices();
                        if (retryVoices.length === 0) {
                            reject(new Error('No voices available'));
                        } else {
                            this.processVoices(retryVoices);
                            resolve();
                        }
                    }, 500);
                    return;
                }
                this.processVoices(systemVoices);
                resolve();
            };
            
            if (this.synthesis.getVoices().length > 0) {
                loadVoices();
            } else {
                this.synthesis.onvoiceschanged = loadVoices;
            }
        });
    }
    
    processVoices(systemVoices) {
        // Filter to English voices for better compatibility
        const englishVoices = systemVoices.filter(v => v.lang.startsWith('en-'));
        this.voices = englishVoices.length > 0 ? englishVoices.slice(0, 8) : systemVoices.slice(0, 8);
        
        this.populateVoiceSelect();
        console.log(`Loaded ${this.voices.length} voices`);
    }
    
    populateVoiceSelect() {
        const select = document.getElementById('voiceSelect');
        select.innerHTML = '<option value="random">Random</option>';
        
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            select.appendChild(option);
        });
    }
    
    setupTwitchExtension() {
        if (!this.twitch) {
            console.warn('Twitch Extension API not available - running in standalone mode');
            return;
        }
        
        // Set up Twitch Extension callbacks
        this.twitch.onAuthorized = (auth) => {
            console.log('Extension authorized:', auth);
            this.setupChatListener();
        };
        
        this.twitch.onContext = (context, changed) => {
            console.log('Context updated:', context, changed);
        };
        
        this.twitch.configuration.onChanged = () => {
            this.loadTwitchConfig();
        };
    }
    
    setupChatListener() {
        if (!this.twitch) return;
        
        // Listen for chat messages via Twitch Extension API
        this.twitch.listen('broadcast', (target, contentType, body) => {
            try {
                const data = JSON.parse(body);
                if (data.type === 'chat_message') {
                    this.handleChatMessage(data.user, data.message);
                }
            } catch (error) {
                console.error('Error parsing chat message:', error);
            }
        });
    }
    
    setupEventListeners() {
        // Power button
        document.getElementById('powerBtn').addEventListener('click', () => {
            this.togglePower();
        });
        
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearQueue();
        });
        
        // Settings controls
        ['volume', 'rate', 'pitch'].forEach(control => {
            const element = document.getElementById(control);
            element.addEventListener('input', () => {
                this.updateSetting(control, parseFloat(element.value));
                document.getElementById(`${control}Value`).textContent = element.value;
            });
        });
        
        // Voice selection
        document.getElementById('voiceSelect').addEventListener('change', (e) => {
            this.updateSetting('voiceMode', e.target.value);
        });
        
        // Muted users
        document.getElementById('mutedUsers').addEventListener('change', (e) => {
            this.updateMutedUsers(e.target.value);
        });
    }
    
    togglePower() {
        this.isActive = !this.isActive;
        const btn = document.getElementById('powerBtn');
        const text = btn.querySelector('.power-text');
        
        if (this.isActive) {
            btn.classList.add('active');
            text.textContent = 'Stop TTS';
            this.updateStatus('Active');
        } else {
            btn.classList.remove('active');
            text.textContent = 'Start TTS';
            this.updateStatus('Stopped');
            this.clearQueue();
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pauseBtn');
        
        if (this.isPaused) {
            btn.classList.add('active');
            btn.innerHTML = '<span>▶️</span> Resume';
            this.synthesis.pause();
            this.updateStatus('Paused');
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<span>⏸️</span> Pause';
            this.synthesis.resume();
            this.updateStatus('Active');
            this.processQueue();
        }
    }
    
    clearQueue() {
        this.speechQueue = [];
        this.synthesis.cancel();
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.updateQueueDisplay();
        this.updateCurrentMessage('No message playing');
        this.updateStatus(this.isActive ? 'Active' : 'Ready');
    }
    
    handleChatMessage(user, message) {
        if (!this.isActive || this.isPaused) return;
        if (this.isUserMuted(user)) return;
        
        this.messageCount++;
        this.updateStats();
        
        const filteredMessage = this.filterMessage(message);
        if (!filteredMessage) return;
        
        this.queueMessage(user, filteredMessage);
    }
    
    filterMessage(message) {
        // Remove excessive repeated characters
        message = message.replace(/([a-zA-Z])\1{3,}/g, '$1$1$1');
        
        // Remove URLs
        message = message.replace(/https?:\/\/[^\s]+/g, 'link');
        
        // Limit length
        if (message.length > 200) {
            message = message.substring(0, 200) + '...';
        }
        
        return message.trim();
    }
    
    queueMessage(user, message) {
        const voice = this.getVoiceForUser(user);
        if (!voice) return;
        
        const speechData = {
            user,
            message,
            voice,
            settings: { ...this.settings }
        };
        
        if (this.isSpeaking) {
            this.speechQueue.push(speechData);
            this.queueCount = this.speechQueue.length;
            this.updateQueueDisplay();
        } else {
            this.speakMessage(speechData);
        }
    }
    
    getVoiceForUser(user) {
        if (this.settings.voiceMode === 'random') {
            if (!this.userVoices.has(user)) {
                const randomVoice = this.voices[Math.floor(Math.random() * this.voices.length)];
                this.userVoices.set(user, randomVoice);
            }
            return this.userVoices.get(user);
        } else {
            const voiceIndex = parseInt(this.settings.voiceMode);
            return this.voices[voiceIndex] || this.voices[0];
        }
    }
    
    speakMessage(speechData) {
        const { user, message, voice, settings } = speechData;
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = voice;
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.currentUtterance = utterance;
            this.updateCurrentMessage(`${user}: ${message}`, true);
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateCurrentMessage('No message playing', false);
            this.processQueue();
        };
        
        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateCurrentMessage('Error occurred', false);
            this.processQueue();
        };
        
        this.synthesis.speak(utterance);
    }
    
    processQueue() {
        if (this.speechQueue.length > 0 && !this.isPaused && this.isActive) {
            const next = this.speechQueue.shift();
            this.queueCount = this.speechQueue.length;
            this.updateQueueDisplay();
            this.speakMessage(next);
        }
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    updateMutedUsers(mutedUsersString) {
        this.settings.mutedUsers = mutedUsersString;
        this.mutedUsers = new Set(
            mutedUsersString
                .toLowerCase()
                .split(',')
                .map(user => user.trim())
                .filter(user => user)
        );
        this.saveSettings();
    }
    
    isUserMuted(user) {
        return this.mutedUsers.has(user.toLowerCase());
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('twitch-tts-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
        
        this.applySettingsToUI();
        this.updateMutedUsers(this.settings.mutedUsers);
    }
    
    saveSettings() {
        try {
            localStorage.setItem('twitch-tts-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }
    
    loadTwitchConfig() {
        if (!this.twitch) return;
        
        const config = this.twitch.configuration.broadcaster;
        if (config) {
            try {
                const parsed = JSON.parse(config.content);
                this.settings = { ...this.settings, ...parsed };
                this.applySettingsToUI();
            } catch (error) {
                console.warn('Failed to load Twitch config:', error);
            }
        }
    }
    
    applySettingsToUI() {
        // Update sliders
        ['volume', 'rate', 'pitch'].forEach(control => {
            const element = document.getElementById(control);
            const valueSpan = document.getElementById(`${control}Value`);
            if (element && this.settings[control] !== undefined) {
                element.value = this.settings[control];
                if (valueSpan) {
                    valueSpan.textContent = this.settings[control];
                }
            }
        });
        
        // Update voice select
        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect && this.settings.voiceMode) {
            voiceSelect.value = this.settings.voiceMode;
        }
        
        // Update muted users
        const mutedUsersInput = document.getElementById('mutedUsers');
        if (mutedUsersInput && this.settings.mutedUsers) {
            mutedUsersInput.value = this.settings.mutedUsers;
        }
    }
    
    updateStatus(status) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }
    
    updateQueueDisplay() {
        const queueEl = document.getElementById('queueCount');
        if (queueEl) {
            queueEl.textContent = this.queueCount;
        }
    }
    
    updateStats() {
        const messageEl = document.getElementById('messageCount');
        if (messageEl) {
            messageEl.textContent = this.messageCount;
        }
    }
    
    updateCurrentMessage(message, isSpeaking = false) {
        const currentEl = document.getElementById('currentMessage');
        if (currentEl) {
            if (isSpeaking) {
                currentEl.classList.add('speaking');
                currentEl.innerHTML = `<div class="message-content">${this.escapeHtml(message)}</div>`;
            } else {
                currentEl.classList.remove('speaking');
                currentEl.innerHTML = `<div class="message-placeholder">${message}</div>`;
            }
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the extension when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TwitchTTSExtension();
});

// For testing without Twitch Extension API
if (!window.Twitch) {
    console.log('Running in standalone mode - simulating chat messages for testing');
    
    // Simulate chat messages for testing
    setTimeout(() => {
        const extension = window.ttsExtension;
        if (extension) {
            setInterval(() => {
                const testUsers = ['TestUser1', 'TestUser2', 'TestUser3'];
                const testMessages = [
                    'Hello everyone!',
                    'This is a test message',
                    'How is everyone doing today?',
                    'Great stream!',
                    'Testing the TTS system'
                ];
                
                const user = testUsers[Math.floor(Math.random() * testUsers.length)];
                const message = testMessages[Math.floor(Math.random() * testMessages.length)];
                
                extension.handleChatMessage(user, message);
            }, 5000);
        }
    }, 2000);
}