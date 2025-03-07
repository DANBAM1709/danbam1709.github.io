import {ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import ContentStoreContext from "./ContentStoreContext.ts";
import useHistoryManager from "../../../hook/useHistoryManager.ts";
import {ContentProps} from "../ContentSelector.tsx";
import useCursorManager from "../../../hook/useCursorManager.ts";
import ContentHistoryContext, {ContentsData, Cursor, Scroll, UpdateHistoryProps} from "./ContentHistoryContext.ts";
import isEqual from "fast-deep-equal";
import {throttle} from "lodash";
import {eventManager} from "../../../utils/eventManager.ts";

const ContentHistoryProvider = ({children}: {children: ReactNode}) => {
    const {contents: originalContents, setContents, contentRefs} = useContext(ContentStoreContext)
    const [currentEditElement, setCurrentEditElement] = useState<HTMLElement | null>(null)
    const {trigger, current, undo, redo, updateHistory} = useHistoryManager<ContentsData>()
    const {setCursorRangeByIndices, getCursorIndices} = useCursorManager()

    // ========= 최신 데이터 가져오는 함수 =========
    const getLatestCursor = useCallback(():Cursor => {
        if (!currentEditElement) throw new Error('ContentHistoryProvider: currentEditElement is null')
        const cursorPos = getCursorIndices(currentEditElement)
        if (!cursorPos) throw new Error('ContentHistoryProvider: cursorPos is null')

        const {startIndex, endIndex} = cursorPos
        return {startIndex: startIndex, endIndex: endIndex, element: currentEditElement};
    }, [currentEditElement, getCursorIndices])
    const getLatestScroll = useCallback((): Scroll => {
        return {x: window.scrollX, y: window.scrollY};
    }, [])
    const getLatestContents = useCallback(():ContentProps[] => { // 최신 카드 데이터
        if (!originalContents) throw new Error('ContentHistoryProvider: A problem occurred while fetching the latest cards')
        return (originalContents.map((content) => ({
            data: contentRefs.current[content.id]?.getData() ?? content.data,
            id: content.id,
            mode: content.mode,
        })));
    }, [originalContents, contentRefs]);

    // ========= 업데이트 함수 정의 =========
    const updateHistoryOverride = useCallback((param?: UpdateHistoryProps) => {
        if (!currentEditElement) return
        const {contents, cursor=getLatestCursor(), scroll=getLatestScroll()} = param ?? {contents: getLatestContents(), cursor: getLatestCursor(), scroll: getLatestScroll()}
        let updateData = {
            contents: contents,
            cursor: cursor,
            scroll: scroll
        }
        if (current && isEqual(contents, current?.contents) && isEqual(cursor, current?.cursor)) {
            updateData = current
        }
        updateHistory(updateData)
    }, [current, currentEditElement, getLatestContents, getLatestCursor, getLatestScroll, updateHistory])

    // ========= undo | redo 이벤트 정의 =========
    const [isFirstUndo, setIsFirstUndo] = useState(true)
    const [isUndoRedo, setIsUndoRedo] = useState<boolean>(false) // undo, redo 일 때 Blur 에서 막기 위함
    const [isUndoRecorded, setIsUndoRecorded] = useState(false) // undo 시 history 업뎃을 했는가

    // 일정 시간동안 사용할 수 없도록 막기 속도 조절 repeat 너무 빨라서 역으로 부자연스러움
    const throttledUndo = throttle(() => undo(), 50, {trailing: false})
    const throttledRedo = throttle(() => redo(), 50 , {trailing: false})

    useEffect(() => { // history 업로드 시 업뎃 후 실행
        if (!isUndoRecorded) return
        undo()
        setIsUndoRecorded(false)
    }, [isUndoRecorded]);
    useEffect(() => {
        eventManager.addEventListener('keydown', 'ContentHistoryProvider', (evt: Event) => {
            const e = evt as KeyboardEvent
            const con = {
                isUndo: e.ctrlKey && e.key.toLowerCase() === 'z',
                isRedo: e.ctrlKey && e.key.toLowerCase() === 'y'
            }
            if (con.isUndo) {
                e.preventDefault() // 브라우저 기본 뒤로 가기 방지
                setIsFirstUndo(false)
                let isEqualCard = true // 카드 데이터가 같은지 검증, 같지 않다면 마지막 동작은 작성 중이었을 것
                let latestContents = undefined

                if (isFirstUndo) { // 첫번째 undo 라면 데이터 검증
                    latestContents = getLatestContents()
                    isEqualCard = isEqual(latestContents, current?.contents)
                }
                if (!isEqualCard) { // 첫 undo 시에만 검증
                    const cursor = getLatestCursor()

                    // 혹시라도 작성 중이 아니라면.. 커서 에러 발생 CardTextArea 를 확인할 것!
                    if (!cursor) throw new Error('ContentHistoryProvider: Undo operation failed. missing cursor during history update.')
                    if (!latestContents) throw new Error('ContentHistoryProvider: Undo operation failed. missing cards during history update.')

                    updateHistoryOverride({contents: latestContents, cursor: cursor})
                    setIsUndoRecorded(true) // 인덱스가 변할 때까지 기다릴 필요가 있어서
                    return;
                }

                if (e.repeat) throttledUndo() // 누르고 잇는 상태
                else undo()

            }
            if (con.isRedo) {
                e.preventDefault() // 브라우저 기본 앞으로 가기 방지
                if (e.repeat) throttledRedo() // 누르고 있는 상태
                else redo()
            }
            if (!con.isUndo && !con.isRedo) { // 둘 다 아닐 때
                setIsFirstUndo(true)
                setIsUndoRedo(false)
            } else {
                setIsUndoRedo(true)
            }
        })

        return () => eventManager.removeEventListener('keydown', 'ContentHistoryProvider')
    }, [current, getLatestContents, getLatestCursor, getLatestScroll, isFirstUndo, redo, throttledRedo, throttledUndo, undo, updateHistory, updateHistoryOverride]);


    // ========= undo | redo 발생하면 =========
    const [canUpdatePosition, setCanUpdatePosition] = useState<boolean>(false) // 랜더링 후 업데이트 position 확인
    useEffect(() => { // undo | redo 이벤트가 발생하면
        if (!current) return

        setCanUpdatePosition(true)
        const deepCopiedObject = structuredClone(current.contents);
        setContents(deepCopiedObject) // 아앗 이전과 기록이 완전히 동일하다면..
        const latestCards = getLatestContents()
        if (isEqual(latestCards, current.contents)) { // 랜더링이 없을 것이므로 커서 등 별도 처리
            setCanUpdatePosition(false)
            if (!current?.cursor) return
            const {startIndex, endIndex, element: node} = current.cursor
            setCursorRangeByIndices(node, {startIndex, endIndex})
        }
    }, [trigger]);

    // ---------- 카드 업뎃 후 랜더링 감지 이벤 ----------
    useEffect(() => {
        eventManager.addEventListener('rendered', 'RichEditor', () => {
            setCanUpdatePosition(false)
            if (!canUpdatePosition || !current?.cursor) return
            const {startIndex, endIndex, element: node} = current.cursor
            setCursorRangeByIndices(node, {startIndex, endIndex})
        })

        return () => eventManager.removeEventListener('rendered', 'RichEditor')
    }, [setCursorRangeByIndices, canUpdatePosition, current]);

    const value = useMemo(() => ({updateHistory: updateHistoryOverride, setCurrentEditElement, isUndoRedo}), [isUndoRedo, updateHistoryOverride])
    return (<ContentHistoryContext.Provider value={value}>{children}</ContentHistoryContext.Provider>)
}

export default ContentHistoryProvider