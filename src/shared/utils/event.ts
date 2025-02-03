type ListenerEntry = { id: string; callback: EventListenerOrEventListenerObject };

// 이벤트 중복 방지 매개변수 예시 type: 'scroll', id: '중복방지용 ID', listener: () => {}
export const eventManager = {
    listeners: new Map<string, Set<ListenerEntry>>(),

    addEventListener(type: string, id: string, listener: EventListenerOrEventListenerObject) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }

        const listenersSet = this.listeners.get(type)!;

        // 중복 방지: ID 기반으로 체크
        const isDuplicate = Array.from(listenersSet).some((entry) => entry.id === id);

        if (!isDuplicate) {
            listenersSet.add({ id, callback: listener });
            document.addEventListener(type, listener);
        }
    },

    removeEventListener(type: string, id: string) {
        const listenersSet = this.listeners.get(type);
        if (listenersSet) {
            const entryToRemove = Array.from(listenersSet).find((entry) => entry.id === id);

            if (entryToRemove) {
                listenersSet.delete(entryToRemove);
                document.removeEventListener(type, entryToRemove.callback);
            }

            if (listenersSet.size === 0) {
                this.listeners.delete(type);
            }
        }
    },

    removeAllEventListeners(type: string) {
        const listenersSet = this.listeners.get(type);
        if (listenersSet) {
            listenersSet.forEach(({ callback }) => {
                document.removeEventListener(type, callback);
            });
            this.listeners.delete(type);
        }
    },
};
