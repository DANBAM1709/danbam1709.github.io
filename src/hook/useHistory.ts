import isEqual from "fast-deep-equal";
import {useCallback, useEffect, useState} from "react";

// return {trigger:{present: T}(undo, redo 감지), current: 현재 없으면 null, previous: 이전 없으면 null, undo: 뒤, redo: 앞, updateHistory: (T)=>업로드}
const useHistory = <T,>() => {
    const [index, setIndex] = useState<number>(0)
    const [current, setCurrent] = useState<T|null>(null)
    const [previous, setPrevious] = useState<T|null>(null) // 이전 값
    const [trigger, setTrigger] = useState<{present: T}|null>(null) // undo, redo 감지 null 은 처음일 때
    const [history, setHistory] = useState<T[]>([])

    const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false)

    const updateHistory = useCallback((updateData: T) => {
        if (updateData === null) return
        setHistory(prev => {
            const copy = prev.slice(0, index+1) // 인덱스 까지 선택

            const lastRecord = copy[copy.length-1]
            if (!isEqual(lastRecord, updateData)) {
                copy.push(updateData)
            } else {
                return prev
            }
            setIndex(copy.length-1)
            return copy
        })
    }, [index])

    /* =============== 상태 감지 정의 =============== */
    useEffect(() => {
        if (history.length > 0) setCurrent(history[index])
        if (index === 0) setPrevious(null)
        else setPrevious(history[index-1])
    }, [history, index]);

    useEffect(() => {
        if (!isUndoRedo || !history) return
        if (index < 0) throw new Error('useHistory: index < 0')
        setTrigger({present: history[index]})
        setIsUndoRedo(false)
    }, [isUndoRedo]);

    /* =============== 이벤트 관리 =============== */
    const undo = useCallback((undoCount: number=1) => {
        if (index === 0) return
        setIndex(pre => Math.max(pre-undoCount, 0))
        setIsUndoRedo(true)
    }, [index])
    const redo = useCallback((redoCount: number=1) => {
        if (!history || index === history.length-1) return
        setIndex(prev => Math.min(prev+redoCount, history.length-1))
        setIsUndoRedo(true)
    }, [history, index])

    return {trigger, current, previous, undo, redo, updateHistory}
}

export default useHistory