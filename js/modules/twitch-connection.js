export class TwitchConnection {
    constructor() {
        this.isConnected = false;
        this.currentChannel = null;
        this.eventListeners = new Map();
    }

    async connect(channel) {
        if (this.isConnected) {
            throw new Error('Already connected');
        }

        return new Promise((resolve, reject) => {
            this.currentChannel = channel;
            
            // Clear previous handlers
            ComfyJS.onChat = null;
            ComfyJS.onConnected = null;
            ComfyJS.onError = null;
            ComfyJS.onDisconnected = null;

            // Set up event handlers
            ComfyJS.onChat = (user, message, flags, self, extra) => {
                this.emit('message', user, message, flags, self, extra);
            };

            ComfyJS.onConnected = (address, port, isFirstConnect) => {
                this.isConnected = true;
                this.emit('connected', channel);
                resolve();
            };

            ComfyJS.onError = (error) => {
                this.isConnected = false;
                this.emit('error', error);
                reject(new Error(error));
            };

            ComfyJS.onDisconnected = (reason) => {
                this.isConnected = false;
                this.currentChannel = null;
                this.emit('disconnected', reason);
            };

            // Initialize connection
            try {
                ComfyJS.Init(channel);
            } catch (error) {
                reject(error);
            }
        });
    }

    async disconnect() {
        if (!this.isConnected) {
            return;
        }

        if (typeof ComfyJS.Disconnect === 'function') {
            ComfyJS.Disconnect();
        } else {
            // Manual fallback
            this.isConnected = false;
            this.currentChannel = null;
            this.emit('disconnected', 'Manual disconnect');
        }
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