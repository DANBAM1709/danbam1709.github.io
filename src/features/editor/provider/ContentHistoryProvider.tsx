import {ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import ContentStoreContext from "../context/ContentStoreContext.ts";
import useHistoryManager from "../../../hook/useHistoryManager.ts";
import useCursorManager from "../../../hook/useCursorManager.ts";
import ContentHistoryContext, {ContentsData, UpdateHistoryProps} from "../context/ContentHistoryContext.ts";
import isEqual from "fast-deep-equal";
import {throttle} from "lodash";
import {eventManager} from "../../../utils/eventManager.ts";
import GhostContainer from "../../../base-style/GhostContainer.tsx";

const ContentHistoryProvider = ({children}: {children: ReactNode}) => {
    const {setContents, getLatestCursor, getLatestContents, getLatestScroll} = useContext(ContentStoreContext)
    const [currentEditElement, setCurrentEditElement] = useState<HTMLElement | null>(null)
    const {trigger, current, undo, redo, updateHistory} = useHistoryManager<ContentsData>()
    const {setCursorRangeByIndices} = useCursorManager()

    // ========= 업데이트 함수 정의 =========
    const updateHistoryOverride = useCallback((param?: UpdateHistoryProps) => {
        const defaultParams = {
            contents: getLatestContents(),
            cursor: getLatestCursor(currentEditElement), // null 가능
            scroll: getLatestScroll(),
            contentUpdate: false // true 인 경우 setContents
        }
        const effectiveParams = param ? {...defaultParams, ...param} : defaultParams
        const {contents, cursor, scroll, contentUpdate} = effectiveParams

        let updateData = {
            contents: contents,
            cursor: cursor,
            scroll: scroll
        }
        if (current && isEqual(contents, current?.contents) && (isEqual(cursor, current?.cursor) || !cursor)) { // 업데이트 전 기록이 있고 content 가 동일하고 커서 위치가 동일하거나 없다면
            updateData = current
        }
        if (contentUpdate) setContents(updateData.contents) // blur 인 경우 이걸로 자주 남발하면 커서 위치가 마구잡이로 이동할 거임
        updateHistory(updateData)
    }, [current, currentEditElement, getLatestContents, getLatestCursor, getLatestScroll, setContents, updateHistory])

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
                    // 혹시라도 작성 중이 아니라면.. 커서 에러 발생 CardTextArea 를 확인할 것!
                    if (!latestContents) throw new Error('ContentHistoryProvider: Undo operation failed. missing cards during history update.')

                    updateHistoryOverride({contents: latestContents})
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

    useLayoutEffect(() => { // undo | redo 이벤트가 발생하면
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

    // ---------- Undo | Redo 랜더링 감지 이벤 ----------
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => { // 리랜더링 감지 이벤트
        if (!containerRef.current) return

        const observer = new MutationObserver(() => {
            const event = new CustomEvent('rendered')
            document.dispatchEvent(event) // html 변경시 이벤트
        });

        observer.observe(containerRef.current, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect()
    }, []);
    useEffect(() => { // Content 가 변경되었을 경우 랜더링 후 커서 등 이동
        eventManager.addEventListener('rendered', 'ContentHistoryProvider', () => {
            setCanUpdatePosition(false)
            if (!canUpdatePosition || !current?.cursor) return
            const {startIndex, endIndex, element: node} = current.cursor
            setCursorRangeByIndices(node, {startIndex, endIndex})
        })

        return () => eventManager.removeEventListener('rendered', 'ContentHistoryProvider')
    }, [setCursorRangeByIndices, canUpdatePosition, current]);

    const value = useMemo(() => ({updateHistory: updateHistoryOverride, setCurrentEditElement, isUndoRedo}), [isUndoRedo, updateHistoryOverride])
    return (<ContentHistoryContext.Provider value={value}>
        <GhostContainer ref={containerRef}>{children}</GhostContainer>
    </ContentHistoryContext.Provider>)
}

export default ContentHistoryProvider