import {Dispatch, SetStateAction, useCallback, useEffect, useLayoutEffect, useState} from "react";
import isEqual from "fast-deep-equal";
import {eventManager} from "../../global/event.ts";

/*
useUndoRedo<T> 명시할 것 <br />
data: 저장할 데이터 변경됨을 인식하고 history 에 저장됨 <br />
setData: 데이터를 저장할 것을 가져오기 <br />
getLatestData: () => T[] 최근 데이터 가져오기(데이터만!) <br />
return {updateHistory: (T)=>void 상태 변경 없이 history 만 업데이트 하는 함수}
 */
const useUndoRedo = <T,>(data:T, setData: Dispatch<SetStateAction<T>>, getLatestData: ()=>T) => {
    const [isUndo, setIsUndo] = useState<boolean>(false) // 뒤로
    const [isRedo, setIsRedo] = useState<boolean>(false) // 앞으로
    const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false)
    const [history, setHistory] = useState<T[]>([])
    const [index, setIndex] = useState<number>(-1)
    const [canHistoryUpdate, setCanHistoryUpdate] = useState<boolean>(true) // history 추가 가능 여부
    const [isLatestIndex, setIsLatestIndex] = useState<boolean>(true)
    
    const [hasLatestDataUpdate, setHasLatestDataUpdate] = useState<boolean>(false) // 뒤로 가기를 하면서 최신 데이터를 history 에 업로드 할 경우 setData의 값이 변경되지 않기 때문에 일어나지 않는 리랜더링 문제 해결을 위함  

    /* =============== 업데이트 함수 정의 =============== */
    const updateHistory = useCallback((updateData: T) => { // 업데이트 함수
        setHistory(prev => {
            const copy = isLatestIndex? [...prev]: prev.slice(0, index+1)
            setIsLatestIndex(true) // 현재 마지막 인덱스 선택

            const lastRecord = copy[copy.length-1]
            if (!isEqual(lastRecord, updateData)) {
                copy.push(updateData)
            } else {
                return prev
            }

            return copy
        })
    }, [index, isLatestIndex])

    /* =============== 상태 감지 정의 =============== */
    useEffect(() => { // 데이터 변경에 따른 업데이트
        if (!data || !canHistoryUpdate) {
            setCanHistoryUpdate(true)
            return
        }
        
        updateHistory(data)
    }, [data])

    useEffect(() => { // 마지막 인덱스 선택
        if (isUndo || isRedo || history.length <= 0) return
        setIndex(history.length-1)
    }, [history]);

    useEffect(() => { // STEP 2 새로운 데이터로 업로드 step1은 아래에
        if (!hasLatestDataUpdate) return
        const selectedIndex = (history.length-2>=0)? history.length-2: 0
        setCanHistoryUpdate(false) // history 업로드 방지
        setData(history[selectedIndex])

        setHasLatestDataUpdate(false)
    }, [hasLatestDataUpdate]);

    // history 업데이트 후 undo, redo 상태 업데이트
    useEffect(() => {
        if (isUndo) {
            const selectedIndex = (history.length-2>=0)? history.length-2: 0
            setIndex(prevIndex => {
                if (prevIndex === selectedIndex) {
                    setCanHistoryUpdate(false) // history 업로드 방지
                    setData(history[selectedIndex+1]) // STEP 1 리랜더링을 위한 최신 데이터 업로드 step2 는 위
                    setHasLatestDataUpdate(true) // STEP 2로 보내기
                }
                return selectedIndex
            })
            setIsUndo(false)
        }
        if (isRedo) {
            setIndex(history.length-1) // 마지막 인덱스 선택
            setIsLatestIndex(true)
            setIsRedo(false)
        }
    }, [history]);

    // undo redo 명령받은 직후 history 업데이트 여부 확인
    useEffect(() => {
        if (isUndo || isRedo) {
            const latestData = getLatestData()
            if (isEqual(latestData, history[index])) { // 업데이트 할 값과 현재 값 비교
                setIsUndoRedo(true) // 아래로
            } else {
                updateHistory(latestData) // history 업데이트 | 위로
            }
        }
    }, [isUndo, isRedo]);

    // history 업데이트 없이 undo, redo 상태 업데이트 인덱스로 인덱스 변경으로 이동
    useEffect(() => {
        if (!isUndoRedo) return

        setIsLatestIndex(false) // 아래 index 변경으로 인한 것을 실행시키기 위한 임시 값 어차피 그 아래에 true 가능하게 해뒀음
        if (isUndo) {
            setIndex(preIndex => {
                const newIndex = preIndex-1
                return (newIndex > 0)? newIndex: 0
            })
            setIsUndo(false)
        }
        if (isRedo) {
            setIndex(preIndex => {
                const newIndex = preIndex+1
                return (newIndex<history.length-1)? newIndex: history.length-1
            })
            setIsRedo(false)
        }
        setIsUndoRedo(false)
    }, [isUndoRedo]);

    useLayoutEffect(() => { // 인덱스 변경될 경우
        if (index < 0 || history.length === 0) return

        if (!isLatestIndex) { // index 변경으로 인한 것이라면
            setCanHistoryUpdate(false)
            setData(history[index])
        }

        setIsLatestIndex(index === history.length - 1)
    }, [index]);

    /* =============== 이벤트 리스너 =============== */
    useEffect(() => {
        eventManager.addEventListener('keydown', 'useUndoRedo', (event) => {
            const e = event as KeyboardEvent
            if (e.ctrlKey && e.key.toLowerCase() === 'z' ) {
                e.preventDefault() // 브라우저 기본 뒤로 가기 방지
                setIsUndo(true)
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'y' ) {
                e.preventDefault() // 브라우저 기본 앞으로 가기 방지
                setIsRedo(true)
            }
        })

        return () => {
            eventManager.removeEventListener('keydown', 'useUndoRedo')
        }
    }, []);

    return {updateHistory}
}

export default useUndoRedo