import {MouseEvent, useMemo, useState} from "react";
import useDrop from "../../../common/dragdrop/useDrop.tsx";
import {GetDataHTMLElement} from "../RichEditor.tsx";
import {CardProps} from "../CardSelector.tsx";

/*
cardRefs: MutableRefObject<(GetDataHTMLElement|null)[]>, <br />
setCardsFunc: Dispatch<SetStateAction<StageCardsFunc>> <br />
return handleDrop: provider 에 제공할 useDrop 객체 | fromIndex: 드래그할 위치 | toIndex: 드랍 위치}
 */
const useCardDragDrop = (cards: CardProps[], cardRefs: { [id: string]: GetDataHTMLElement | null }, updateHistory: (updateCards?: CardProps[]) => void) => {
    const [fromIndex, setFromIndex] = useState(-1) // 드래그 할 위치
    const [toIndex, setToIndex] = useState(-1) // 드랍할 위치

    const handleEvent = useMemo(() => ({
        dropTarget: cardRefs[cards[fromIndex]?.id],
        onDragStartBefore: (e?: MouseEvent<HTMLElement>) => { // 드래그 전 이미지 복사를 위한 타겟 설정
            const index = parseInt(e?.currentTarget.dataset.targetIndex ?? '0')
            setFromIndex(index)
        },
        onDragStart: () => {
            updateHistory()
        },
        onDragOver: (e?: MouseEvent<HTMLElement>) => { // 드래그 시 파란색 바 표시
            let dropIndex = parseInt(e?.currentTarget.dataset.selectIndex ?? '-1')

            if (dropIndex === fromIndex) { // 이동할 위치가 자기 자신 아래라면
                dropIndex = -1
            }
            setToIndex(dropIndex)
        },
        onDragOut: () => { // 파란색 바 제거
            setToIndex(-1)
        },
        onDrop: () => {
            if (toIndex === -1 || !cards) return // 이동 X
            const copy = [...cards];
            const insertIndex = fromIndex <= toIndex ? toIndex:toIndex+1 // 이동할 위치
            const [target] = copy.splice(fromIndex, 1) // splice: 삭제 요소 리턴
            copy.splice(insertIndex, 0, target); // 시작 위치, 제거할 요소 개수, 추가할 요소들

            updateHistory(copy)
        },
    }), [cardRefs, cards, fromIndex, toIndex, updateHistory])
    const handleDrop = useDrop(handleEvent)

    return {handleDrop, fromIndex, toIndex}
}

export default useCardDragDrop