import { TTSManager } from './modules/tts-manager.js';
import { TwitchConnection } from './modules/twitch-connection.js';
import { UIManager } from './modules/ui-manager.js';
import { SettingsManager } from './modules/settings-manager.js';
import { StatsManager } from './modules/stats-manager.js';

class TTSApp {
    constructor() {
        this.ttsManager = new TTSManager();
        this.twitchConnection = new TwitchConnection();
        this.uiManager = new UIManager();
        this.settingsManager = new SettingsManager();
        this.statsManager = new StatsManager();
        
        this.isInitialized = false;
        this.chatPanelOpen = false;
    }

    async initialize() {
        try {
            this.uiManager.showStatus('Initializing application...');
            
            // Initialize all managers
            await this.ttsManager.initialize();
            await this.settingsManager.initialize();
            this.uiManager.initialize();
            this.statsManager.initialize();
            
            // Load saved settings
            this.settingsManager.loadSettings();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up mobile audio unlock if needed
            this.setupMobileAudioUnlock();
            
            // Set up navigation
            this.setupNavigation();
            
            // Set up chat panel
            this.setupChatPanel();
            
            this.isInitialized = true;
            this.uiManager.showStatus('Application ready!');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.uiManager.showError(`Initialization failed: ${error.message}`);
        }
    }

    setupNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.querySelector('.nav-links');
        
        // Mobile menu toggle
        navToggle?.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks?.classList.toggle('active');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle?.classList.remove('active');
                navLinks?.classList.remove('active');
            });
        });

        // Update active nav link on scroll
        const sections = document.querySelectorAll('.section');
        const navLinksArray = document.querySelectorAll('.nav-link');

        const updateActiveNavLink = () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.pageYOffset >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinksArray.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink(); // Initial call
    }

    setupChatPanel() {
        const chatToggle = document.getElementById('chatToggle');
        const chatPanel = document.getElementById('chatPanel');
        const chatPanelClose = document.getElementById('chatPanelClose');
        const chatPanelOverlay = document.getElementById('chatPanelOverlay');
        const chatClearBtn = document.getElementById('chatClearBtn');
        const chatPauseBtn = document.getElementById('chatPauseBtn');

        // Toggle chat panel
        chatToggle?.addEventListener('click', () => {
            this.toggleChatPanel();
        });

        // Close chat panel
        chatPanelClose?.addEventListener('click', () => {
            this.closeChatPanel();
        });

        // Close on overlay click
        chatPanelOverlay?.addEventListener('click', () => {
            this.closeChatPanel();
        });

        // Chat panel controls
        chatClearBtn?.addEventListener('click', () => {
            this.uiManager.clearChatPanel();
            this.uiManager.clearChat();
            this.statsManager.reset();
        });

        chatPauseBtn?.addEventListener('click', () => {
            this.ttsManager.togglePause();
            this.updateChatPanelPauseButton();
        });

        // Close panel on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.chatPanelOpen) {
                this.closeChatPanel();
            }
        });
    }

    toggleChatPanel() {
        const chatPanel = document.getElementById('chatPanel');
        const chatPanelOverlay = document.getElementById('chatPanelOverlay');
        
        if (this.chatPanelOpen) {
            this.closeChatPanel();
        } else {
            this.chatPanelOpen = true;
            chatPanel?.classList.add('active');
            chatPanelOverlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeChatPanel() {
        const chatPanel = document.getElementById('chatPanel');
        const chatPanelOverlay = document.getElementById('chatPanelOverlay');
        
        this.chatPanelOpen = false;
        chatPanel?.classList.remove('active');
        chatPanelOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateChatPanelPauseButton() {
        const button = document.getElementById('chatPauseBtn');
        if (button) {
            button.textContent = this.ttsManager.isPaused ? '▶️' : '⏸️';
            button.title = this.ttsManager.isPaused ? 'Resume TTS' : 'Pause TTS';
        }
    }

    setupEventListeners() {
        // Connection events
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.handleConnectionToggle();
        });

        // TTS control events
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.ttsManager.togglePause();
            this.updatePauseButton();
            this.updateChatPanelPauseButton();
        });

        document.getElementById('clearQueueBtn').addEventListener('click', () => {
            this.ttsManager.clearQueue();
            this.uiManager.showStatus('Speech queue cleared');
        });

        // Settings events
        ['rate', 'pitch', 'volume'].forEach(control => {
            const element = document.getElementById(control);
            element.addEventListener('input', () => {
                this.settingsManager.updateSetting(control, parseFloat(element.value));
                document.getElementById(`${control}Value`).textContent = element.value;
            });
        });

        document.getElementById('voiceSelect').addEventListener('change', (e) => {
            this.settingsManager.updateSetting('voiceMode', e.target.value);
        });

        // Muted users events
        document.getElementById('updateMutedBtn').addEventListener('click', () => {
            this.updateMutedUsers();
        });

        // Chat events
        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.uiManager.clearChat();
            this.uiManager.clearChatPanel();
            this.statsManager.reset();
        });

        // Settings import/export
        document.getElementById('exportSettingsBtn').addEventListener('click', () => {
            this.settingsManager.exportSettings();
        });

        document.getElementById('importSettingsBtn').addEventListener('click', () => {
            document.getElementById('importSettingsInput').click();
        });

        document.getElementById('importSettingsInput').addEventListener('change', (e) => {
            this.settingsManager.importSettings(e.target.files[0]);
        });

        // Twitch connection events
        this.twitchConnection.on('connected', (channel) => {
            this.uiManager.showStatus(`Connected to ${channel}`);
            this.uiManager.setConnectionState(true);
            this.updateChatPanelStatus(`Connected to ${channel}`);
        });

        this.twitchConnection.on('disconnected', (reason) => {
            this.uiManager.showStatus(`Disconnected: ${reason}`);
            this.uiManager.setConnectionState(false);
            this.ttsManager.clearQueue();
            this.updateChatPanelStatus('Disconnected');
        });

        this.twitchConnection.on('error', (error) => {
            this.uiManager.showError(`Connection error: ${error}`);
            this.uiManager.setConnectionState(false);
            this.updateChatPanelStatus('Connection Error');
        });

        this.twitchConnection.on('message', (user, message, flags, self, extra) => {
            this.handleChatMessage(user, message, flags, self, extra);
        });

        // TTS events
        this.ttsManager.on('speaking', (user, message) => {
            this.uiManager.showStatus(`Speaking: ${user}`);
        });

        this.ttsManager.on('finished', () => {
            this.uiManager.showStatus('Speech finished');
        });

        this.ttsManager.on('queueUpdate', (queueLength) => {
            this.statsManager.updateQueueCount(queueLength);
        });
    }

    setupMobileAudioUnlock() {
        if (/Mobi|Android|iPad|iPhone/i.test(navigator.userAgent)) {
            const unlockButton = document.createElement('button');
            unlockButton.textContent = 'Tap to Enable Audio';
            unlockButton.className = 'audio-unlock-btn';
            unlockButton.style.cssText = `
                width: 100%;
                padding: 1rem;
                margin-bottom: 1rem;
                font-size: 1.1em;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            `;

            unlockButton.onclick = () => {
                this.ttsManager.unlockAudioContext();
                unlockButton.textContent = 'Audio Enabled!';
                unlockButton.style.background = '#666';
                unlockButton.disabled = true;
                setTimeout(() => unlockButton.remove(), 2000);
            };

            document.querySelector('.main-content').insertBefore(unlockButton, document.querySelector('.header-text'));
        }
    }

    async handleConnectionToggle() {
        if (this.twitchConnection.isConnected) {
            await this.twitchConnection.disconnect();
        } else {
            const channel = document.getElementById('channel').value.trim().toLowerCase();
            if (!channel) {
                this.uiManager.showError('Please enter a channel name');
                return;
            }
            await this.twitchConnection.connect(channel);
        }
    }

    handleChatMessage(user, message, flags, self, extra) {
        // Check if user is muted
        if (this.settingsManager.isUserMuted(user)) {
            return;
        }

        // Add message to both chat displays
        const chatElement = this.uiManager.addChatMessage(user, message);
        this.uiManager.addChatPanelMessage(user, message);
        
        // Update stats
        this.statsManager.incrementMessageCount();
        this.statsManager.addUser(user);
        this.updateChatIndicator();

        // Queue for TTS
        const settings = this.settingsManager.getSettings();
        this.ttsManager.queueMessage(user, message, chatElement, settings);
    }

    updateMutedUsers() {
        const mutedUsersInput = document.getElementById('mutedUsers').value;
        this.settingsManager.updateMutedUsers(mutedUsersInput);
        
        const mutedUsers = this.settingsManager.getMutedUsers();
        const display = document.getElementById('mutedUsersDisplay');
        display.textContent = mutedUsers.size > 0 
            ? `Currently muted: ${Array.from(mutedUsers).join(', ')}`
            : 'No users currently muted';
            
        this.uiManager.showStatus('Muted users updated');
    }

    updatePauseButton() {
        const button = document.getElementById('pauseBtn');
        button.textContent = this.ttsManager.isPaused ? 'Resume TTS' : 'Pause TTS';
    }

    updateChatPanelStatus(status) {
        const statusElement = document.getElementById('chatPanelStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = 'chat-panel-status ' + 
                (status.includes('Connected') ? 'connected' : 'disconnected');
        }
    }

    updateChatIndicator() {
        const indicator = document.getElementById('chatIndicator');
        if (indicator) {
            indicator.textContent = this.statsManager.messageCount;
            if (this.statsManager.messageCount > 0) {
                indicator.classList.add('active');
            }
        }
    }
}

// Initialize the application
const app = new TTSApp();
app.initialize().catch(console.error);

// Make app globally available for debugging
window.ttsApp = app;