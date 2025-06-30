export class UIManager {
    constructor() {
        this.maxChatMessages = 150;
        this.chatDisplay = null;
        this.chatPanelDisplay = null;
        this.errorDiv = null;
        this.statusDiv = null;
    }

    initialize() {
        this.chatDisplay = document.getElementById('chatDisplay');
        this.chatPanelDisplay = document.getElementById('chatPanelDisplay');
        this.errorDiv = document.getElementById('error');
        this.statusDiv = document.getElementById('status');
    }

    showError(message) {
        if (!this.errorDiv) return;
        
        this.errorDiv.textContent = `Error: ${message}`;
        this.errorDiv.style.display = 'block';
        if (this.statusDiv) this.statusDiv.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.errorDiv.style.display = 'none';
        }, 5000);
    }

    showStatus(message) {
        if (!this.statusDiv) return;
        
        this.statusDiv.textContent = message;
        this.statusDiv.style.display = 'block';
        if (this.errorDiv) this.errorDiv.style.display = 'none';
    }

    addChatMessage(user, message) {
        const chatElement = this.createChatMessage(user, message);
        
        if (this.chatDisplay) {
            this.chatDisplay.appendChild(chatElement);

            // Limit chat messages
            while (this.chatDisplay.children.length > this.maxChatMessages) {
                this.chatDisplay.removeChild(this.chatDisplay.firstChild);
            }

            // Auto-scroll to bottom
            this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
        }

        return chatElement;
    }

    addChatPanelMessage(user, message) {
        if (!this.chatPanelDisplay) return;

        // Remove placeholder if it exists
        const placeholder = this.chatPanelDisplay.querySelector('.chat-panel-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const chatElement = this.createChatMessage(user, message);
        chatElement.classList.add('chat-panel-message');
        
        this.chatPanelDisplay.appendChild(chatElement);

        // Limit chat messages in panel
        while (this.chatPanelDisplay.children.length > this.maxChatMessages) {
            this.chatPanelDisplay.removeChild(this.chatPanelDisplay.firstChild);
        }

        // Auto-scroll to bottom
        this.chatPanelDisplay.scrollTop = this.chatPanelDisplay.scrollHeight;
    }

    createChatMessage(user, message) {
        const chatMessage = document.createElement('div');
        chatMessage.className = 'chat-message';
        
        // Sanitize message for display
        const sanitizedMessage = this.sanitizeHTML(message);
        chatMessage.innerHTML = `<span class="user">${this.sanitizeHTML(user)}:</span> ${sanitizedMessage}`;
        
        return chatMessage;
    }

    clearChat() {
        if (this.chatDisplay) {
            this.chatDisplay.innerHTML = '';
        }
    }

    clearChatPanel() {
        if (this.chatPanelDisplay) {
            this.chatPanelDisplay.innerHTML = `
                <div class="chat-panel-placeholder">
                    <span class="placeholder-icon">💬</span>
                    <p>Connect to a Twitch channel to see live chat messages</p>
                </div>
            `;
        }
    }

    setConnectionState(isConnected) {
        const channelInput = document.getElementById('channel');
        const connectBtn = document.getElementById('connectBtn');
        
        if (channelInput) {
            channelInput.disabled = isConnected;
        }
        
        if (connectBtn) {
            connectBtn.textContent = isConnected ? 'Disconnect' : 'Connect';
            connectBtn.disabled = false;
        }
    }

    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    updateSliderValue(sliderId, value) {
        const valueSpan = document.getElementById(`${sliderId}Value`);
        if (valueSpan) {
            valueSpan.textContent = value;
        }
    }
}