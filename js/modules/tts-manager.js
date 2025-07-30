export class TTSManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.userVoices = new Map();
        this.speechQueue = [];
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.eventListeners = new Map();
        
        // Preferred voice names
        this.preferredVoices = [
            "Aaron (en-US)",
            "Arthur (en-GB)", 
            "Catherine (en-AU)",
            "Daniel (English (United Kingdom)) (en-GB)",
            "Gordon (en-AU)",
            "Karen (en-AU)",
            "Matilda (en-AU)",
            "Nicky (en-US)"
        ];
    }

    async initialize() {
        if (!this.synthesis) {
            throw new Error('Speech synthesis not supported in this browser');
        }

        await this.loadVoices();
        this.populateVoiceSelect();
    }

    async loadVoices() {
        return new Promise((resolve, reject) => {
            const loadVoicesHandler = () => {
                const systemVoices = this.synthesis.getVoices();
                
                if (systemVoices.length === 0) {
                    setTimeout(() => {
                        const retryVoices = this.synthesis.getVoices();
                        if (retryVoices.length === 0) {
                            reject(new Error('No system voices available'));
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
                loadVoicesHandler();
            } else {
                this.synthesis.onvoiceschanged = loadVoicesHandler;
            }
        });
    }

    processVoices(systemVoices) {
        // First try to match preferred voices
        const matchedVoices = systemVoices.filter(voice => {
            const voiceName = `${voice.name} (${voice.lang})`;
            return this.preferredVoices.includes(voiceName);
        });

        if (matchedVoices.length > 0) {
            this.voices = matchedVoices;
        } else {
            // Fallback to English voices
            const englishVoices = systemVoices.filter(v => v.lang.startsWith('en-'));
            this.voices = englishVoices.length > 0 ? englishVoices : systemVoices.slice(0, 10);
        }

        console.log(`Loaded ${this.voices.length} voices:`, 
            this.voices.map(v => `${v.name} (${v.lang})`));
    }

    populateVoiceSelect() {
        const select = document.getElementById('voiceSelect');
        select.innerHTML = '<option value="random">Random Assignment</option>';
        
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            select.appendChild(option);
        });
    }

    getVoiceForUser(user, voiceMode) {
        if (voiceMode === 'random') {
            if (!this.userVoices.has(user)) {
                const randomVoice = this.voices[Math.floor(Math.random() * this.voices.length)];
                this.userVoices.set(user, randomVoice);
            }
            return this.userVoices.get(user);
        } else {
            const voiceIndex = parseInt(voiceMode);
            return this.voices[voiceIndex] || this.voices[0];
        }
    }

    filterMessage(message) {
        // Remove excessive repeated characters
        message = message.replace(/([a-zA-Z])\1{3,}/g, '$1$1$1');
        
        // Remove URLs
        message = message.replace(/https?:\/\/[^\s]+/g, 'link');
        
        // Remove excessive emotes (basic detection)
        const words = message.split(' ');
        const filteredWords = [];
        const seenWords = new Set();
        
        for (const word of words) {
            const lowerWord = word.toLowerCase();
            if (!seenWords.has(lowerWord) || filteredWords.length < 3) {
                seenWords.add(lowerWord);
                filteredWords.push(word);
            }
        }
        
        return filteredWords.join(' ').trim();
    }

    queueMessage(user, message, chatElement, settings) {
        if (this.isPaused) return;

        const filteredMessage = this.filterMessage(message);
        if (!filteredMessage) return;

        const voice = this.getVoiceForUser(user, settings.voiceMode);
        if (!voice) return;

        const speechData = {
            user,
            message: filteredMessage,
            chatElement,
            voice,
            settings: { ...settings }
        };

        if (this.isSpeaking) {
            this.speechQueue.push(speechData);
            this.emit('queueUpdate', this.speechQueue.length);
        } else {
            this.speakMessage(speechData);
        }
    }

    speakMessage(speechData) {
        const { user, message, chatElement, voice, settings } = speechData;
        
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = voice;
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.currentUtterance = utterance;
            chatElement?.classList.add('speaking');
            this.emit('speaking', user, message);
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            chatElement?.classList.remove('speaking');
            this.emit('finished');
            this.processQueue();
        };

        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            this.isSpeaking = false;
            this.currentUtterance = null;
            chatElement?.classList.remove('speaking');
            this.processQueue();
        };

        this.synthesis.speak(utterance);
    }

    processQueue() {
        if (this.speechQueue.length > 0 && !this.isPaused) {
            const next = this.speechQueue.shift();
            this.emit('queueUpdate', this.speechQueue.length);
            
            // Check if chat element still exists
            if (next.chatElement && document.body.contains(next.chatElement)) {
                this.speakMessage(next);
            } else {
                // Skip this message and process next
                this.processQueue();
            }
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        } else {
            this.processQueue();
        }
    }

    clearQueue() {
        this.speechQueue = [];
        this.synthesis.cancel();
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.emit('queueUpdate', 0);
        
        // Remove speaking indicators
        document.querySelectorAll('.chat-message.speaking').forEach(el => {
            el.classList.remove('speaking');
        });
    }

    unlockAudioContext() {
        // Play silent utterance to unlock audio context on mobile
        const unlock = new SpeechSynthesisUtterance('');
        unlock.volume = 0;
        this.synthesis.speak(unlock);
    }

    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, ...args) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(...args));
        }
    }
}