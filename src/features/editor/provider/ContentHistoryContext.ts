import {createContext, Dispatch, SetStateAction} from "react";
import {CursorIndices} from "../../../hook/useCursorManager.ts";
import {ContentProps} from "../ContentSelector.tsx";

export interface UpdateHistoryProps {
    contents: ContentProps[],
    cursor?: Cursor,
    scroll?: Scroll
}

interface ContentHistoryContextType {
    setCurrentEditElement: Dispatch<SetStateAction<HTMLElement|null>>
    updateHistory: (data?: UpdateHistoryProps) => void
    isUndoRedo: boolean
}
export type Cursor = CursorIndices & {element: HTMLElement|null} | null
export type Scroll = {
    x: number
    y: number
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