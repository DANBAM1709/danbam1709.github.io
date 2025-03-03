// import {Dispatch, SetStateAction, useEffect} from "react";
// import {CardProps} from "../CardSelector.tsx";
// import {GetDataHTMLElement} from "../RichEditor.tsx";
//
// const useCardDelete = (deleteEl: HTMLElement|null, setCards: Dispatch<SetStateAction<CardProps[]>>, cardRefs: (GetDataHTMLElement|null)[]) => {
//
//
//     // useEffect(() => {
//     //     if(!deleteEl) return
//     //     setCards(cards => {
//     //         if (cards.length === 2) { // 제목과 기본 카드라면 삭제 막기
//     //             const defaultCard = cards[1]
//     //             const isDefaultEmpty = defaultCard.mode === 'default' && defaultCard.data === ''
//     //
//     //             if (!isDefaultEmpty) { // 첫 줄 기본 카드 검증 실패시 추가 데이터
//     //                 return [cards[0], {id: crypto.randomUUID(), mode: 'default', data: ''}]
//     //             }
//     //         }
//     //
//     //         const deleteIndex = cardRefs.findIndex(ref => ref === deleteEl) // 삭제 인덱스 확인
//     //         if (deleteIndex > 0) return cards.filter((_, i) => i !== deleteIndex) // 삭제할 요소가 있다면
//     //         return cards
//     //     })
//
//         // // 카드 삭제 후 이전 카드 선택.. 인데 이걸 나중에 바꿀거임
//         // const deleteIndex = cardRefs.current.findIndex(ref => ref === deleteEl);
//         // if (deleteIndex > 0) {
//         //     // 이전 노드 선택
//         //     const node = cardRefs.current[deleteIndex-1]!
//         //     const selection = window.getSelection()
//         //     if (selection) {
//         //         const range = document.createRange()
//         //         range.selectNodeContents(node)
//         //         range.collapse(false) // 마지막으로 이동
//         //
//         //         selection.removeAllRanges()
//         //         selection.addRange(range)
//         //     }
//         // }
//     // }, [deleteEl]);
//
//     return {}
// }
//
// export default useCardDelete