type ListenerEntry = { id: string; callback: EventListenerOrEventListenerObject };

// 이벤트 중복 방지 매개변수 예시 type: 'scroll', id: '중복방지용 ID', listener: () => {}
export const eventManager = {
    listeners: new Map<string, Set<ListenerEntry>>(),

    addEventListener(type: string, name: string, listener: EventListenerOrEventListenerObject) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        const id = name + type
        const listenersSet = this.listeners.get(type)!;

        // 중복 방지: ID 기반으로 체크, 중복이 있으면 삭제 후 추가 중복 방지로 인해 의도치 않게 컴포넌트 등이 업데이트 될 때 이전 시점의 setState 와 함수 등을 사용하는 문제가 있는거 같음
        // const entryToRemove = Array.from(listenersSet).find((entry) => entry.id === id);
        // if (entryToRemove) {
        //     listenersSet.delete(entryToRemove); // 여기서도 삭제해야 함
        //     document.removeEventListener(type, entryToRemove.callback)
        // }

        listenersSet.add({ id, callback: listener });
        document.addEventListener(type, listener);
    },

    removeEventListener(type: string, name: string) {
        const listenersSet = this.listeners.get(type);
        if (listenersSet) {
            const id = name + type
            const entryToRemove = Array.from(listenersSet).find((entry) => entry.id === id);

            if (entryToRemove) {
                listenersSet.delete(entryToRemove);
                document.removeEventListener(type, entryToRemove.callback);
            }

            if (listenersSet.size === 0) {
                this.listeners.delete(id);
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
