import useUndo from "use-undo";
import {useCallback, useEffect, useState} from "react";
import {eventManager} from "../global/event.ts";

const useUndoRedo = <T,>(initData: T) => {
    const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false) // 뒤로 가기 또는 앞으로 가기 시전
    const [present, { set, undo, redo, canUndo, canRedo }] = useUndo(initData);
    const handleUndo = useCallback((event: Event) => {
        const e = event as KeyboardEvent
        if (e.ctrlKey && e.key.toLowerCase() === 'z' ) { // 뒤로
            e.preventDefault()
            if (!canUndo) return
            undo()
            setIsUndoRedo(true)
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'y' ) { // 앞으로
            e.preventDefault()
            if(!canRedo) return
            redo()
            setIsUndoRedo(true)
        }
    }, [canUndo, undo, canRedo, redo])

    useEffect(() => {
        eventManager.addEventListener('keydown', 'RichEditor', handleUndo)

        return () => {
            eventManager.removeEventListener('keydown', 'RichEditor')
        }
    }, [handleUndo]);

    return {present, set, isUndoRedo, setIsUndoRedo}
}

export default useUndoRedo