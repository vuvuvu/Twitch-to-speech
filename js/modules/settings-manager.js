export class SettingsManager {
    constructor() {
        this.settings = {
            rate: 1.0,
            pitch: 0.8,
            volume: 0.8,
            voiceMode: 'random',
            mutedUsers: 'streamelements'
        };
        
        this.mutedUsers = new Set();
    }

    async initialize() {
        this.loadSettings();
        this.updateMutedUsers(this.settings.mutedUsers);
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('tts-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }

        this.applySettingsToUI();
    }

    saveSettings() {
        try {
            localStorage.setItem('tts-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    getSettings() {
        return { ...this.settings };
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

    getMutedUsers() {
        return this.mutedUsers;
    }

    applySettingsToUI() {
        // Update sliders
        ['rate', 'pitch', 'volume'].forEach(control => {
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

        // Update muted users input
        const mutedUsersInput = document.getElementById('mutedUsers');
        if (mutedUsersInput && this.settings.mutedUsers) {
            mutedUsersInput.value = this.settings.mutedUsers;
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'tts-settings.json';
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    async importSettings(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const imported = JSON.parse(text);
            
            // Validate imported settings
            const validKeys = Object.keys(this.settings);
            const filteredSettings = {};
            
            for (const key of validKeys) {
                if (imported[key] !== undefined) {
                    filteredSettings[key] = imported[key];
                }
            }
            
            this.settings = { ...this.settings, ...filteredSettings };
            this.saveSettings();
            this.applySettingsToUI();
            
            // Update muted users
            if (filteredSettings.mutedUsers) {
                this.updateMutedUsers(filteredSettings.mutedUsers);
            }
            
            console.log('Settings imported successfully');
            
        } catch (error) {
            console.error('Failed to import settings:', error);
            throw new Error('Invalid settings file');
        }
    }
}