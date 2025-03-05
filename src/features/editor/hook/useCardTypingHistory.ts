// 커서 이동 인지 키
import {KeyboardEvent, FormEvent, CompositionEvent, useContext, useEffect, useState} from "react";
import CardHistoryContext from "../provider/CardHistoryContext.ts";
import {CustomTextAreaElement} from "../../../component/CustomTextArea.tsx";

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

const useCardTypingHistory = (target: CustomTextAreaElement|null) => {
    const {isUndoRedo, updateHistory, setCurrentEditElement} = useContext(CardHistoryContext)

    // ================= history 관리 =================
    const [prevUnicode, setPrevUnicode] = useState<number>(-1) // 한글 삭제 감지를 위함
    const [isInValidation, setIsInValidation] = useState<boolean>(false) // beforeInputTrigger 가 되는지 여부를 감지하는 검증 단계로 들어가는 그런 것
    const [isFirstRender, setIsFirstRender] = useState<boolean>(false)
    const [isEraseMode, setIsEraseMode] = useState<boolean | null>(null) // 입력, 삭제 감지 커서 이동시 null 로 초기화
    const [isFocus, setIsFocus] = useState<boolean>(false) // 커서가 포커스 된 경우

    useEffect(() => {
        setIsFirstRender(true)
        if (!isFirstRender || isEraseMode === null) return // 첫 랜더링시 막기
        updateHistory() // 입력, 삭제 모드 전환시 데이터 업데이트
    }, [isEraseMode]);

    const handleTypingHistory = {
        onFocus: () => {
            setIsFocus(true)
            setCurrentEditElement(target)
        },
        onBlur: () => { // 여기도 null 이 아닌 경우 저장하면 됨
            setIsFocus(false)
            setIsEraseMode(null)
            setCurrentEditElement(null) // blur 가 먼저일 거임
            if (isEraseMode === null || isUndoRedo) return
            updateHistory() // 타이핑 마지막 위치이고 isUndoRedo 가 아니라면 저장
        },
        onMouseDown: () => {
            setIsEraseMode(null)
            if (isFocus && isEraseMode !== null) { // 기존에 포커스 상태라면
                updateHistory() // 저장
            }
        },
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
            const con = {
                Tab: e.key === 'Tab',
                Space: e.key ===' ',
                Erase: e.key === 'Backspace' || e.key === 'Delete',
                CursorMove: cursorMoveKeys.includes(e.key) || (e.ctrlKey && e.key.toLowerCase() === 'a')
            }

            if (con.Tab) {
                e.preventDefault()
                updateHistory() // 저장
            }
            if (con.Space) { // 공백 입력
                setIsEraseMode(false)
            }
            if (con.Erase) {
                setIsEraseMode(true) // 삭제 모드
            }
            if (con.CursorMove) { // 커서 이동전 인식
                setIsEraseMode(null) // 여긴 음 어칼까.. 그냥 저장하면 안되지 마지막 확인해야함
                if (isEraseMode === null) return
                updateHistory() // 타이핑 마지막 위치 저장
            }
        },
        onBeforeInput: (e: FormEvent<HTMLDivElement>) => { // 검증해봤는데 글 쓰는 중임
            setIsInValidation(false) // 초기화
            const native = e.nativeEvent as InputEvent

            if (native.data && native.data.length > 0) { // 조합형 문자가 아닐 때, space 는 undefined 이므로 별도로 처리
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
            setIsEraseMode(false) // 초성이므로 무조건 입력
            setPrevUnicode(-1) // 무조건 -1 일 수 밖에...
            console.log('에엥?')
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

    return handleTypingHistory
}

export default useCardTypingHistory