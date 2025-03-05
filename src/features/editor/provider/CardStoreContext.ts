import {createContext, Dispatch, MutableRefObject, SetStateAction} from "react";
import {CardProps} from "../CardSelector.tsx";


// 자식 컴포넌트에서 노출할 ref 타입
export interface CardElement extends HTMLElement {
    getData: () => CardProps['data']
}

interface CardStoreContextType {
    cardRefs: MutableRefObject<{ [id: string]: CardElement | null }>
    cards: CardProps[]
    setCards: Dispatch<SetStateAction<CardProps[]>>
}

const CardStoreContext = createContext<CardStoreContextType>({
    cardRefs: {current: {}},
    cards: [],
    setCards: () => {},
})

export default CardStoreContext