export class UIManager {
    constructor() {
        this.maxChatMessages = 150;
        this.chatDisplay = null;
        this.errorDiv = null;
        this.statusDiv = null;
    }

    initialize() {
        this.chatDisplay = document.getElementById('chatDisplay');
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
        if (!this.chatDisplay) return null;

        const chatMessage = document.createElement('div');
        chatMessage.className = 'chat-message';
        
        // Sanitize message for display
        const sanitizedMessage = this.sanitizeHTML(message);
        chatMessage.innerHTML = `<span class="user">${this.sanitizeHTML(user)}:</span> ${sanitizedMessage}`;
        
        this.chatDisplay.appendChild(chatMessage);

        // Limit chat messages
        while (this.chatDisplay.children.length > this.maxChatMessages) {
            this.chatDisplay.removeChild(this.chatDisplay.firstChild);
        }

        // Auto-scroll to bottom
        this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;

        return chatMessage;
    }

    clearChat() {
        if (this.chatDisplay) {
            this.chatDisplay.innerHTML = '';
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