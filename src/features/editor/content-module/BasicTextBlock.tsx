import {forwardRef, useImperativeHandle, useRef} from "react";
import {InheritContentProps} from "../ContentSelector.tsx";
import RichTextArea from "../widget/RichTextArea.tsx";
import {CustomTextAreaElement} from "../../../component/CustomTextArea.tsx";
import {ContentElement} from "../provider/ContentStoreContext.ts";

const BasicTextBlock = forwardRef<ContentElement, InheritContentProps>(({data}, ref) => {
    const targetRef = useRef<CustomTextAreaElement|null>(null)

    useImperativeHandle(ref, () => { // ref 로 접근 가능한 데이터 정의
        if (targetRef.current) {
            return Object.assign(targetRef.current, {
                getData: () => ({html: targetRef.current!.innerHTML})
            }) as ContentElement
        }
        throw new Error('BasicTextBlock ref error!')
    }, []);

    return <RichTextArea content={data} ref={targetRef} />
})
//
// const BasicCard = forwardRef<GetDataHTMLElement, InheritCardProps>(({data}, ref) => {
//     const targetRef = useRef<CustomTextAreaElement>(null)
//     const selection = useMemo(() => window.getSelection(), []) // contenteditable 이 빈 상태에서 랜더링되면 랜더링 전 가져온 selection 은 해당 요소에서 null 이 됨
//     const {dispatch} = useRichEditorContext()
//
//     const handleTextArea = {
//         onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
//             const con = { // 조건 모음
//                 empty: e.currentTarget.innerHTML === '<br>' || e.currentTarget.innerText === '', // 내용이 없다면
//                 delete: e.key === 'Backspace', // 블록 삭제
//                 up: e.key === 'ArrowUp', // 블록 이동 위로
//                 down: e.key === 'ArrowDown', // 블록 이동 아래로
//             }
//
//             // 방향키 Up
//             if (con.up) {
//                 if (!selection) return
//                 const range = selection.getRangeAt(0)
//
//                 const rangeTop = range.getBoundingClientRect().top
//                 const top = e.currentTarget.getBoundingClientRect().top
//
//                 const prev = range.startContainer.previousSibling
//
//                 const empty = !prev || (e.currentTarget === range.startContainer)
//                 const condition1 = rangeTop === 0 && empty;
//                 const condition2 = rangeTop !== 0 && (rangeTop - top) < 5 // 커서와 끝의 오차 임의값 5
//
//                 if (condition1 || condition2) {
//                     e.preventDefault()
//                     console.log('위로')
//                 }
//             }
//
//             // 방향키 Down
//             if (con.down) {
//                 if (!selection) return
//                 const range = selection.getRangeAt(0)
//
//                 const rangeBottom = range.getBoundingClientRect().bottom
//                 const bottom = e.currentTarget.getBoundingClientRect().bottom
//
//                 const condition1 = rangeBottom === 0 && !range.endContainer.nextSibling // 마지막 줄이면서 내용물 없을 때 Br 태그를 가리키며 rangeBottom=0 이 되므로
//                 const condition2 = (bottom - rangeBottom) < 5 // 커서와 끝의 오차 임의값 5
//
//                 if (condition1 || condition2) {
//                     e.preventDefault()
//                     console.log('아래로')
//                 }
//             }
//         },
//         onFocus: () => {
//             dispatch({type: 'TOGGLE_TOOLTIP', payload: true})
//         },
//         onBlur: () => {
//             dispatch({type: 'TOGGLE_TOOLTIP', payload: false})
//         },
//     }
//
//     return (<BasicTextArea ref={targetRef} {...handleTextArea} html={data} />)})

export default BasicTextBlock