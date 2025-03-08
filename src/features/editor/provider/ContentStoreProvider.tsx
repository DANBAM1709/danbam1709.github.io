import ContentStoreContext, {ContentElement, Cursor, Scroll} from "../context/ContentStoreContext.ts";
import {ReactNode, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ContentProps} from "../ContentSelector.tsx";
import useCursorManager from "../../../hook/useCursorManager.ts";


const ContentStoreProvider = ({children}: {children: ReactNode}) => {
    const [contents, setContents] = useState<ContentProps[]>([])
    const contentRefs = useRef<{ [id: string]: ContentElement | null }>({}); // 객체를 card.id로 관리

    const {getCursorIndices} = useCursorManager()
    useEffect(() => {
        setContents([
            {data: {html: '1'}, id: crypto.randomUUID(), mode: 'basic'},
            {data: {html: '2'}, id: crypto.randomUUID(), mode: 'basic'},
            {data: {html: '3'}, id: crypto.randomUUID(), mode: 'basic'},
            {data: {html: '4'}, id: crypto.randomUUID(), mode: 'basic'},
        ])
    }, []);
    // ========= 최신 데이터 가져오는 함수 =========
    const getLatestCursor = useCallback((element: HTMLElement|null):Cursor|null => {
        if (!element) return null
        const cursorPos = getCursorIndices(element)
        if (!cursorPos) throw new Error('ContentHistoryProvider: cursorPos is null')

        const {startIndex, endIndex} = cursorPos
        return {startIndex: startIndex, endIndex: endIndex, element: element};
    }, [getCursorIndices])
    const getLatestScroll = useCallback((): Scroll => {
        return {x: window.scrollX, y: window.scrollY};
    }, [])
    const getLatestContents = useCallback(():ContentProps[] => { // 최신 카드 데이터
        if (!contents) throw new Error('ContentHistoryProvider: A problem occurred while fetching the latest cards')
        return (contents.map((content) => ({
            data: contentRefs.current[content.id]?.getData() ?? content.data,
            id: content.id,
            mode: content.mode,
        })));
    }, [contents, contentRefs]);

    const value = useMemo(() => ({contents, contentRefs, setContents, getLatestScroll, getLatestCursor, getLatestContents}), [contents, getLatestContents, getLatestCursor, getLatestScroll])
    
    return (<ContentStoreContext.Provider value={value}>{children}</ContentStoreContext.Provider>)
}

export default ContentStoreProvider