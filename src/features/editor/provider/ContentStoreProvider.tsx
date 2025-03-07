import ContentStoreContext, {ContentElement} from "./ContentStoreContext.ts";
import {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {ContentProps} from "../ContentSelector.tsx";


const ContentStoreProvider = ({children}: {children: ReactNode}) => {
    const [contents, setContents] = useState<ContentProps[]>([])
    const contentRefs = useRef<{ [id: string]: ContentElement | null }>({}); // 객체를 card.id로 관리

    useEffect(() => {
        setContents([
            {data: {html: '1'}, id: crypto.randomUUID(), mode: 'basic'},
            {data: {html: '2'}, id: crypto.randomUUID(), mode: 'basic'},
            {data: {html: '3'}, id: crypto.randomUUID(), mode: 'basic'},
            {data: {html: '4'}, id: crypto.randomUUID(), mode: 'basic'},
        ])
    }, []);

    const value = useMemo(() => ({contents, setContents, contentRefs}), [contents])
    
    return (<ContentStoreContext.Provider value={value}>{children}</ContentStoreContext.Provider>)
}

export default ContentStoreProvider