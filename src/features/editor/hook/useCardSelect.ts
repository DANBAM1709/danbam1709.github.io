import {GetDataHTMLElement} from "../RichEditor.tsx";
import {useEffect, useState} from "react";
import {CardProps} from "../CardSelector.tsx";
import {eventManager} from "../../../global/event.ts";

const useCardSelect = (cards: CardProps[], index: number|null, cardRefs: { [id: string]: GetDataHTMLElement | null }) => {
    const [isSelectPrev, setIsSelectPrev] = useState<boolean>(false)
    const [isSelectNext, setIsSelectNext] = useState<boolean>(false)

    useEffect(() => {
        if (!index) return
        console.log(cards[index]?.id)
    }, [index]);

    // 숨긴 카드가 중간에 있을 경우도 처리해야 함 따라서 먼저 카드 숨기고 활성화하는 기능부터 합시다
    useEffect(() => { // 앞 카드 선택
        if (!isSelectPrev) return

        setIsSelectPrev(false) // 초기화
    }, [isSelectPrev]);

    useEffect(() => { // 뒤 카드 선택
        if(!isSelectNext) return

        setIsSelectNext(false) // 초기화
    }, [isSelectNext]);

    useEffect(() => {
        eventManager.addEventListener('keydown', 'useCardSelect', (evt: Event) => {
            const e = evt as KeyboardEvent
            if (e.ctrlKey && e.key === '[') { // 앞 카드 선택
                e.preventDefault()
                setIsSelectPrev(true)
            }
            if (e.ctrlKey && e.key === ']') { // 뒤 카드 선택
                e.preventDefault()
                setIsSelectNext(true)
            }
        })

        return () => eventManager.removeEventListener('keydown', 'useCardSelect')
    }, []);


    return {}
}

export default useCardSelect