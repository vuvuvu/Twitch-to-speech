export class StatsManager {
    constructor() {
        this.messageCount = 0;
        this.queueCount = 0;
        this.uniqueUsers = new Set();
    }

    initialize() {
        this.updateDisplay();
    }

    incrementMessageCount() {
        this.messageCount++;
        this.updateDisplay();
    }

    updateQueueCount(count) {
        this.queueCount = count;
        this.updateDisplay();
    }

    addUser(username) {
        this.uniqueUsers.add(username.toLowerCase());
        this.updateDisplay();
    }

    reset() {
        this.messageCount = 0;
        this.queueCount = 0;
        this.uniqueUsers.clear();
        this.updateDisplay();
    }

    updateDisplay() {
        const messageCountEl = document.getElementById('messageCount');
        const queueCountEl = document.getElementById('queueCount');
        const userCountEl = document.getElementById('userCount');

        if (messageCountEl) messageCountEl.textContent = this.messageCount;
        if (queueCountEl) queueCountEl.textContent = this.queueCount;
        if (userCountEl) userCountEl.textContent = this.uniqueUsers.size;
    }
}