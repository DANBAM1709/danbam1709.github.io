import CardStoreContext, {CardElement} from "./CardStoreContext.ts";
import {ReactNode, useMemo, useRef, useState} from "react";
import {CardProps} from "../CardSelector.tsx";


const CardStoreProvider = ({children}: {children: ReactNode}) => {
    const [cards, setCards] = useState<CardProps[]>([])
    const cardRefs = useRef<{ [id: string]: CardElement | null }>({}); // 객체를 card.id로 관리

    const value = useMemo(() => ({cards, setCards, cardRefs}), [cards, setCards, cardRefs])
    
    return (<CardStoreContext.Provider value={value}>{children}</CardStoreContext.Provider>)
}

export default CardStoreProvider