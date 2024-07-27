class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, payload) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners && eventListeners.length > 0) {
            eventListeners.forEach(callback => callback(payload));
        }
    }

    off(event, callback) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners && eventListeners.get(event)) {
            this.listeners.set(
                event,
                eventListeners.filter(listener => listener !== callback)
            );
        }
    }
}
const eventBus = new EventBus();