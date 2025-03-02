import {
    CompositionEvent,
    Dispatch,
    FocusEvent,
    FormEvent,
    KeyboardEvent as ReactKeyboardEvent,
    SetStateAction,
    useCallback,
    useEffect, useLayoutEffect,
    useState
} from "react";
import {CardProps} from "./CardSelector.tsx";
import isEqual from "fast-deep-equal";
import {eventManager} from "../../global/event.ts";
import useHistory from "../../common/history/useHistory.ts";
import {GetDataHTMLElement} from "../../layout/RichEditor.tsx";
import useCursorManager from "./useCursorManager.ts";

type Cursor = { // 마커로 표시
    startPos: number
    endPos: number
    currentEditable: HTMLElement|null
} | null
interface Scroll {
    x: number
    y: number
}
type Data = {
    cards: CardProps[]
    cursor: Cursor
    scroll: Scroll
} | null

const useRichEditorHistory = (cards: CardProps[], setCards: Dispatch<SetStateAction<CardProps[]>>, cardRefs:  { [id: string]: GetDataHTMLElement | null }, getLatestCards: () => CardProps[]) => {
    const [data, setData] = useState<Data>(null)
    const [currentEditable, setCurrentEditable] = useState<HTMLElement|null>(null) // 현재 편집 중인 요소
    const [currentData, setCurrentData] = useState<Data|null>(null) // present

    const {getCursorOffsets, moveCursor} = useCursorManager()

    const getLatestScroll = useCallback((): Scroll => { // 최신 스크롤 위치
        const {scrollX, scrollY} = window
        return {
            x: scrollX,
            y: scrollY
        }
    }, []);

    const getDataCommonFunc = useCallback((getCards: () => CardProps[], isNotUpdate: boolean=true): Data => {
        const cursor = getCursorOffsets(currentEditable)
        let startPos = 0, endPos = 0
        if (cursor) {
            startPos = cursor.startPos
            endPos = cursor.endPos
        }
        const latestCards = getCards()
        if (isNotUpdate && currentData && isEqual(currentData.cards, latestCards)) {
            return currentData
        }
        return {
            cards: latestCards,
            cursor: {startPos: startPos, endPos: endPos, currentEditable: currentEditable},
            scroll: getLatestScroll()
        }
    }, [currentData, currentEditable, getCursorOffsets, getLatestScroll])

    // 모든 최신 데이터 가져오기 false 를 전달하면 카드랑 상관없이 데이터 업데이트
    const getLatestData = useCallback((isNotUpdate: boolean=true):Data => getDataCommonFunc(getLatestCards, isNotUpdate), [getLatestCards, getDataCommonFunc])
    // 카드 업데이트시 데이터 업데이트
    const createCardUpdateData = useCallback(():Data => getDataCommonFunc(() => cards), [cards, getDataCommonFunc])

    // ------ 카드 업데이트 ------
    const [isCardUpdate, setIsCardUpdate] = useState(false) // undo|redo 시 중복 업 방지
    const [isDataUpdate, setIsDataUpdate] = useState(false) // undo|redo 시 중복 업 방지
    const [isUpdateToRender, setIsUpdateToRender] = useState(false) // undo|redo 시 중복 업 방지
    const [isUpdateNoRender, setIsUpdateNoRender] = useState(false) // 랜더링 없이 커서 위치만 이동

    useEffect(() => { // 카드 변경으로 인한 상태 업데이트
        if (!cards || cards.length === 0) return
        if (isEqual(cards, data?.cards)) return
        if (isDataUpdate) return
        setIsCardUpdate(true)
        setData(createCardUpdateData())
    }, [cards]);

    // ------ undo|redo 업데이트 ------
    useEffect(() => { // undo|redo 상태 업데이트
        if (!data || isCardUpdate) return;
        setIsDataUpdate(true)

        if (isEqual(data.cards, cards)) {
            setIsUpdateNoRender(true) // 랜더링 없는 데이터 업데이트
        } else {
            setCards(data.cards) // 카드 랜더링
            setIsUpdateToRender(true) // 랜더링 후 커서, 스크롤 이동 검증용
        }
    }, [data])

    const {present, updateHistory, undo, redo} = useHistory<Data>(data, setData, getLatestData)
    // 설정 초기화 setData 되기 전에 present 먼저 변경되므로 OK
    useEffect(() => {
        setCurrentData(present)
        setIsDataUpdate(false)
        setIsCardUpdate(false)
    }, [present]);
    // 카드 업데이트 없이 커서 이동 등 undo redo 이벤트
    useEffect(() => {
        if (isUpdateNoRender && data?.cursor) {
            const {startPos, endPos, currentEditable: node} = data.cursor
            moveCursor(node, startPos, endPos)
            setIsUpdateNoRender(false)
        }
    }, [isUpdateNoRender]);
    useEffect(() => { // data 변경으로 인한 카드 랜더링 후
        eventManager.addEventListener('customTextAreaChange', 'RichEditor', () => {
            if (!isUpdateToRender || !data?.cursor) return

            const {startPos, endPos, currentEditable: node} = data.cursor
            moveCursor(node, startPos, endPos)
            setIsUpdateToRender(false)
        })

        return () => eventManager.removeEventListener('customTextAreaChange', 'RichEditor')
    }, [isUpdateToRender, data, cards, moveCursor]);

    const [prevUnicode, setPrevUnicode] = useState<number>(-1) // 한글 삭제 감지를 위함
    const [isInValidation, setIsInValidation] = useState<boolean>(false) // beforeInputTrigger 가 되는지 여부를 감지하는 검증 단계로 들어가는 그런 것
    const [isEraseMode, setIsEraseMode] = useState<boolean|null>(null) // 삭제 모드 null 은 초기상태

    // 삭제 모드 또는 글 쓰는 모드로 전환되는 타이밍 저장
    useLayoutEffect(() => {
        if (isEraseMode === null) {
            updateHistory(getLatestData(false)) // 초기 상태가 아닐 때
            return
        }
        // 삭제 | 입력 모드 전환 타이밍
        updateHistory(getLatestData()) // 초기 상태가 아닐 때
    }, [isEraseMode]);

    const handleCard = { // history 업데이트를 위한 이벤트 핸들러
        onFocus: (e: FocusEvent<HTMLDivElement>) => {
            setCurrentEditable(e.currentTarget as HTMLElement)
        },
        onBlur: () => { // blur 가 먼저임
            setCurrentEditable(null) // 선택 요소 제거
        },
        onMouseDown: () => {
            setIsEraseMode(null)
        },
        onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Tab') {
                e.preventDefault()
                updateHistory(getLatestData())
            }
            if (e.key === 'Backspace' || e.key === 'Delete') { // 조합형 문자가 아닌데 글 지울 때
                setIsEraseMode(true) // 삭제
            }

            // 커서 위치 변경에 영향을 줄 수 있는 키 목록
            const cursorMoveKeys = [
                'ArrowLeft',  // 좌측 방향키
                'ArrowRight', // 우측 방향키
                'ArrowUp',    // 상단 방향키
                'ArrowDown',  // 하단 방향키
                'Home',       // Home 키
                'End',        // End 키
                'PageUp',     // PageUp 키
                'PageDown'    // PageDown 키
            ];
            if (cursorMoveKeys.includes(e.key)) { // 이 경우 selectionchange 로 다음 커서 위치 인지해야 할거 같은디
                setIsEraseMode(null) // 초기상태로 돌리기
            }
        },
        onBeforeInput: (e: FormEvent<HTMLDivElement>) => { // 검증해봤는데 글 쓰는 중임
            setIsInValidation(false) // 초기화
            const native = e.nativeEvent as InputEvent

            if (native.data && native.data.length > 0) { // 조합형 문자가 아닐 때
                setIsEraseMode(false)  // 쓰는 중임
            }
        },
        onInput: () =>{
            if (isInValidation) { // 글 삭제인 경우. 아 문자 한 개 거슬려..
                setIsEraseMode(true) // 삭제
                setIsInValidation(false) // 초기화
            }
        },
        onCompositionStart: () => { // input 전 이벤트 초성 작성
            setPrevUnicode(-1) // 무조건 -1 일 수 밖에...
        },
        onCompositionUpdate: (e: CompositionEvent<HTMLDivElement>) => { // 화면 랜더링 전이라는 거 같음
            const charCode = e.data.charCodeAt(0)
            const uniCode = isNaN(charCode)? -1: charCode

            setPrevUnicode(uniCode)

            if (uniCode < 0) { // NaN 은 삭제
                setIsEraseMode(true) // 삭제
                return
            }

            if (prevUnicode === uniCode) return;

            if (prevUnicode < uniCode) {
                setIsEraseMode(false) // 쓰는 중
            } else {
                setIsInValidation(true) // 삭제일 수도 아닐 수도 있으므로 검증 모드로 넘어감
            }
        },
    }

    return {handleCard, undo, redo}

}

export default useRichEditorHistory