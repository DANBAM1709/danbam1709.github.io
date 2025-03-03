import isEqual from "fast-deep-equal";
import {useCallback, useEffect, useState} from "react";

// param getLatestData: () => T <br />
// return {present:{present: T}(undo, redo 일 때만), current: T, undo: 뒤, redo: 앞, updateHistory: (T)=>업로드}
const useHistory = <T,>() => {
    const [index, setIndex] = useState<number>(0)
    const [current, setCurrent] = useState<T|null>(null)
    const [present, setPresent] = useState<{present: T}|null>(null)
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
    // useEffect(() => { // 마지막 인덱스 선택
    //     if (history?.length === 0) return
    //     setIndex(history.length-1)
    //     console.log(index, '인덱스가 변함')
    // }, [history]);

    useEffect(() => {
        if (history.length > 0) setCurrent(history[index])
    }, [history, index]);

    useEffect(() => {
        if (!isUndoRedo || !history) return
        if (index < 0) throw new Error('useHistory: index < 0')
        setPresent({present: history[index]})
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

    return {present, current, undo, redo, updateHistory}
}

export default useHistory