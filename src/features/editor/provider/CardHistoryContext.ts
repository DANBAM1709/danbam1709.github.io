import {createContext, Dispatch, SetStateAction} from "react";
import {CardProps} from "../CardSelector.tsx";
import {CursorIndices} from "../../../hook/useCursorManager.ts";

export interface UpdateHistoryProps {
    cards: CardProps[],
    cursor?: Cursor,
    scroll?: Scroll
}

interface CardHistoryContextType {
    setCurrentEditElement: Dispatch<SetStateAction<HTMLElement|null>>
    updateHistory: (data?: UpdateHistoryProps) => void
    isUndoRedo: boolean
}
export type Cursor = CursorIndices & {element: HTMLElement|null} | null
export type Scroll = {
    x: number
    y: number
}

export interface CardsData {
    cards: CardProps[],
    cursor: Cursor
    scroll: Scroll
}

const CardHistoryContext = createContext<CardHistoryContextType>({
    setCurrentEditElement: () => {},
    updateHistory: () => {},
    isUndoRedo: false
})

export default CardHistoryContext