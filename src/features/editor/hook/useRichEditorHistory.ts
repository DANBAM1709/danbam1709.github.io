import {
    CompositionEvent,
    Dispatch,
    FormEvent,
    KeyboardEvent as ReactKeyboardEvent,
    SetStateAction,
    useEffect,
    useLayoutEffect,
    useState
} from "react";
import {CardProps} from "../CardSelector.tsx";
import {eventManager} from "../../../global/event.ts";
import useCursorManager from "../../../common/hook/useCursorManager.ts";
import useHistory from "../../../common/hook/useHistory.ts";
import {Data} from "../RichEditor.tsx";

const useRichEditorHistory = (setCards: Dispatch<SetStateAction<CardProps[]>>, getLatestData: (params?: {getCards?: () => CardProps[], canUpdate?: boolean}) => Data) => {

    // ========= history 관리를 위한 데이터 관리 =========
    const {present, current, undo, redo, updateHistory} = useHistory<Data>(getLatestData)

    const [canUpdatePosition, setCanUpdatePosition] = useState<boolean>(false) // 랜더링 후 업데이트 position 확인

    // ---------- undo | redo 발생하면 ----------
    useEffect(() => { // undo | redo 이벤트가 발생하면
        if (!current) return
        const data = current
        if (!data) return;

        const deepCopiedObject = structuredClone(data.cards);
        setCards(deepCopiedObject)
    }, [current, present]);
    useEffect(() => {
        if (!current) return
        setCanUpdatePosition(true)
    }, [present]);

    const {moveCursor} = useCursorManager()
    // ---------- 카드 업뎃 후 랜더링 감지 이벤 ----------
    useEffect(() => {
        eventManager.addEventListener('customTextAreaChange', 'RichEditor', () => {
            setCanUpdatePosition(false)
            console.log(canUpdatePosition)
            if (!canUpdatePosition || !current?.cursor) return
            const {startPos, endPos, element: node} = current.cursor
            moveCursor(node, startPos, endPos)
        })

        return () => eventManager.removeEventListener('customTextAreaChange', 'RichEditor')
    }, [moveCursor, canUpdatePosition, current]);

    // ------ history 저장 이벤 ------
    const [prevUnicode, setPrevUnicode] = useState<number>(-1) // 한글 삭제 감지를 위함
    const [isInValidation, setIsInValidation] = useState<boolean>(false) // beforeInputTrigger 가 되는지 여부를 감지하는 검증 단계로 들어가는 그런 것
    const [isEraseMode, setIsEraseMode] = useState<boolean|null>(null) // 삭제 모드 null 은 초기상태

    // 삭제 모드 또는 글 쓰는 모드로 전환되는 타이밍 저장
    useLayoutEffect(() => {
        if (isEraseMode === null) {
            updateHistory(getLatestData({canUpdate: true})) // 초기 상태가 아닐 때
            return
        }
        // 삭제 | 입력 모드 전환 타이밍
        updateHistory(getLatestData()) // 초기 상태가 아닐 때
    }, [isEraseMode]);

    const handleCard = { // history 업데이트를 위한 이벤트 핸들러
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

    return {handleCard, undo, redo, updateHistory, current}

}

export default useRichEditorHistory