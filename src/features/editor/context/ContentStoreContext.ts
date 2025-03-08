import {createContext, Dispatch, MutableRefObject, SetStateAction} from "react";
import {ContentProps} from "../ContentSelector.tsx";
import {CursorIndices} from "../../../hook/useCursorManager.ts";

export type Cursor = CursorIndices & {element: HTMLElement|null} | null
export type Scroll = {
    x: number
    y: number
}

// 자식 컴포넌트에서 노출할 ref 타입
export interface ContentElement extends HTMLElement {
    getData: () => ContentProps['data']
}

interface ContentStoreContextType {
    contentRefs: MutableRefObject<{ [id: string]: ContentElement | null }>
    contents: ContentProps[]
    setContents: Dispatch<SetStateAction<ContentProps[]>>
    getLatestScroll: () => Scroll
    getLatestCursor: (element: HTMLElement|null) => Cursor|null
    getLatestContents: () => ContentProps[]
}

const ContentStoreContext = createContext<ContentStoreContextType>({
    contentRefs: {current: {}},
    contents: [],
    setContents: () => {},
    getLatestScroll: () => ({x: 0, y: 0} as Scroll),
    getLatestCursor: () => null,
    getLatestContents: () => [],
})

export default ContentStoreContext