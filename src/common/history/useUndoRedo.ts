import {Dispatch, SetStateAction, useEffect, useLayoutEffect, useState} from "react";
import isEqual from "fast-deep-equal";
import {eventManager} from "../../global/event.ts";

/*
useUndoRedo<T> 명시할 것 <br />
data: 저장할 데이터 변경됨을 인식하고 history 에 저장됨 <br />
setData: 데이터를 저장할 것을 가져오기 <br />
getLatestData: () => T[] 최근 데이터 가져오기(데이터만!) <br />
return {history: data[], index: 현재 위치, canHistoryUpdate: data 변경시 history 추가 가능 여부}
 */
const useUndoRedo = <T,>(data:T, setData: Dispatch<SetStateAction<T>>, getLatestData: ()=>T) => {
    const [isUndo, setIsUndo] = useState<boolean>(false) // 뒤로
    const [isRedo, setIsRedo] = useState<boolean>(false) // 앞으로
    const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false)
    const [history, setHistory] = useState<T[]>([])
    const [index, setIndex] = useState<number>(-1)
    const [canHistoryUpdate, setCanHistoryUpdate] = useState<boolean>(true) // history 추가 가능 여부
    const [isLatestIndex, setIsLatestIndex] = useState<boolean>(true)

    useEffect(() => {
        if (!data || !canHistoryUpdate) {
            setCanHistoryUpdate(true)
            return
        }

        setHistory(prev => {
            const copy = isLatestIndex? [...prev]: prev.slice(0, index+1)
            setIsLatestIndex(true) // 현재 마지막 인덱스 선택

            const lastRecord = copy[copy.length-1]
            if (!isEqual(lastRecord, data)) {
                copy.push(data)
            } else {
                return prev
            }

            return copy
        })
    }, [data])

    useEffect(() => { // 마지막 인덱스 선택
        if (isUndo || isRedo || history.length <= 0) return
        setIndex(history.length-1)
    }, [history]);

    useEffect(() => {
        if (isUndo) {
            const selectedIndex = (history.length-2>=0)? history.length-2: 0
            setIndex(prevIndex => {
                if (prevIndex === selectedIndex) {
                    setCanHistoryUpdate(false)
                    setData(history[selectedIndex])
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

    useEffect(() => {
        if (isUndo || isRedo) {
            const latestData = getLatestData()
            if (isEqual(latestData, data)) { // 업데이트 할 값과 현재 값 비교
                setIsUndoRedo(true)
            } else {
                setData(latestData) // history 업데이트
            }
        }
    }, [isUndo, isRedo]);

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

    return {history, index, canHistoryUpdate}
}

export default useUndoRedo