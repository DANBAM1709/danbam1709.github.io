import {CardProps} from "./CardSelector.tsx";
import {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import {GetDataHTMLElement} from "../../layout/RichEditor.tsx";
import isEqual from 'fast-deep-equal';
import {eventManager} from "../../global/event.ts";

interface Cursor {
    startContainer: Node
    startOffset: number
    endContainer: Node
    endOffset: number
}
interface Scroll {
    x: number
    y: number
}

type History = {
    cards: CardProps[]
    cursor: Cursor|null
    scroll: Scroll
}

const useDataManager = (cards: CardProps[], setCards: Dispatch<SetStateAction<CardProps[]>>, cardRefs: { [id: string]: GetDataHTMLElement | null }) => {
    const canTrackHistory = useRef<boolean>(true) // 이곳에서 cards 를 변경했는지 확인
    const [history, setHistory] = useState<History[]>([])
    const [isUndo, setIsUndo] = useState<boolean>(false) // 뒤로
    const [isRedo, setIsRedo] = useState<boolean>(false) // 앞으로
    const [index, setIndex] = useState<number>(-1) // 현재 선택된 인덱스

    /* =============== 함수 정의 =============== */
    // 현재 커서 위치
    const getLatestCursor = (): Cursor|null => {
        const selection = window.getSelection()

        if (!selection || selection.rangeCount === 0) return null
        const range = selection.getRangeAt(0)
        const {startContainer, startOffset, endContainer, endOffset} = range
        return {
            startContainer: startContainer,
            startOffset: startOffset,
            endContainer: endContainer,
            endOffset: endOffset
        }
    }
    // 현재 스크롤 위치
    const getLatestScroll = (): Scroll => {
        const {scrollX, scrollY} = window
        return {
            x: scrollX,
            y: scrollY
        }
    }
    // 새로운 기록
    const getNewRecord = () => {
        return {
            cards: cards,
            cursor: getLatestCursor(),
            scroll: getLatestScroll(),
        }
    }

    /* =============== history 제어 =============== */
    // 카드 상태 변경 시 history 에 추가
    useEffect(() => {
        if (cards.length === 0) return // 랜더링 전 제외
        if (!canTrackHistory.current) { // history 에 추가할 지 여부 기본 true
            canTrackHistory.current = true
            return
        }

        setHistory(prev => {
            const copy = [...prev]
            const lastRecord = copy[copy.length-1] // 가장 마지막 기록
            const newRecord = getNewRecord() // 새로운 기록
            if (!isEqual(lastRecord?.cards ?? {}, newRecord?.cards ?? {})) {
                copy.push(newRecord)
            }
            return copy
        })
    }, [cards]);

    // history 변경시 자동으로 선택 인덱스 변경
    useEffect(() => {
        setIndex(history.length-1)
    }, [history])

    // 인덱스 변경 시 재랜더링
    useEffect(() => {
        canTrackHistory.current = false // history X
        if (index >= 0) {
            setCards(history[index].cards)
        }
    }, [index]);

    /* =============== Undo & Redo =============== */
    useEffect(() => { // 뒤로 가기
        if (!isUndo) return

        setIndex(pre => {
            if (pre > 0) {
                return pre - 1
            } else return 0
        })
        setIsUndo(false)
    }, [isUndo])
    useEffect(() => { // 앞으로 가기
        if (!isRedo) return
        setIndex(pre => {
            if (pre < history.length-1) {
                return pre + 1
            } else return history.length-1
        })
        setIsRedo(false)
    }, [isRedo])

    /* =============== 이벤트 리스너 =============== */
    useEffect(() => {
        eventManager.addEventListener('keydown', 'useDataManager', (event) => {
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
    }, []);

    return {}
}

export default useDataManager