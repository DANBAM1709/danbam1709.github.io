import {createContext, Dispatch, MutableRefObject, SetStateAction} from "react";
import {ContentProps} from "../ContentSelector.tsx";


// 자식 컴포넌트에서 노출할 ref 타입
export interface ContentElement extends HTMLElement {
    getData: () => ContentProps['data']
}

interface ContentStoreContextType {
    contentRefs: MutableRefObject<{ [id: string]: ContentElement | null }>
    contents: ContentProps[]
    setContents: Dispatch<SetStateAction<ContentProps[]>>
}

const ContentStoreContext = createContext<ContentStoreContextType>({
    contentRefs: {current: {}},
    contents: [],
    setContents: () => {},
})

export default ContentStoreContext