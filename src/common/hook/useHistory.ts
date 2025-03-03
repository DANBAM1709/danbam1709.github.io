import isEqual from "fast-deep-equal";
import {useCallback, useEffect, useState} from "react";

// param getLatestData: () => T <br />
// return {present:{present: T}(undo, redo 일 때만), current: T, undo: 뒤, redo: 앞, updateHistory: (T)=>업로드}
const useHistory = <T,>(getLatestData: () => T) => {
    const [isUndo, setIsUndo] = useState<boolean>(false)
    const [isRedo, setIsRedo] = useState<boolean>(false)
    const [index, setIndex] = useState<number>(0)
    const [current, setCurrent] = useState<T|null>(null)
    const [present, setPresent] = useState<{present: T}|null>(null)
    const [history, setHistory] = useState<T[]>([])

    const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false)
    const [isLockIndex, setIsLockIndex] = useState<boolean>(false) // undo로 인한 인덱스 업데이트 시 업데이트 안함

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
            return copy
        })
    }, [index])

    /* =============== 상태 감지 정의 =============== */
    useEffect(() => { // 마지막 인덱스 선택
        setIsLockIndex(false) // 초기화
        if (history?.length === 0) return
        if (isLockIndex) return;
        setIndex(history.length-1)
    }, [history]);

    useEffect(() => {
        if (history.length > 0) setCurrent(history[index])
    }, [history, index]);

    // Undo STEP 1. history 업로드 여부
    useEffect(() => { // 뒤로 가기
        if (!isUndo) return

        const latestData = getLatestData()
        if (isEqual(latestData, current)) { // 현재 데이터와 같다면
            setIndex(pre => Math.max(pre-1, 0))
        } else { // 최근 데이터 업데이트
            setIsLockIndex(true)
            updateHistory(latestData)
        }
        setIsUndo(false)
        setIsUndoRedo(true)
    }, [isUndo]);

    // Redo
    useEffect(() => {
        if (!isRedo) return
        setIndex(prev => Math.min(prev+1, history.length-1))
        setIsRedo(false)
        setIsUndoRedo(true)
    }, [isRedo]);

    useEffect(() => {
        if (!isUndoRedo || !history) return
        if (index < 0) throw new Error('useHistory: index < 0')
        setPresent({present: history[index]})
        setIsUndoRedo(false)
    }, [isUndoRedo]);
    
    /* =============== 이벤트 관리 =============== */
    const undo = useCallback(() => setIsUndo(true), [])
    const redo = useCallback(() => setIsRedo(true), [])

    return {present, current, undo, redo, updateHistory}
}

export default useHistory