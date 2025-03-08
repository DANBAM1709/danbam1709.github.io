import {createContext, Dispatch, SetStateAction} from "react";
import {ContentProps} from "../ContentSelector.tsx";
import {Cursor, Scroll} from "./ContentStoreContext.ts";

export interface UpdateHistoryProps {
    contents?: ContentProps[],
    cursor?: Cursor,
    scroll?: Scroll,
    contentUpdate?: boolean // setContents(latestContents) 여부
}

interface ContentHistoryContextType {
    setCurrentEditElement: Dispatch<SetStateAction<HTMLElement|null>>
    updateHistory: (data?: UpdateHistoryProps) => void
    isUndoRedo: boolean
}

export interface ContentsData {
    contents: ContentProps[],
    cursor: Cursor
    scroll: Scroll
}

const ContentHistoryContext = createContext<ContentHistoryContextType>({
    setCurrentEditElement: () => {},
    updateHistory: () => {},
    isUndoRedo: false
})

export default ContentHistoryContext