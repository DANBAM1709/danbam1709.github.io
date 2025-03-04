import styled from "styled-components";
import CustomTextArea, {CustomTextAreaElement} from "../../../component/CustomTextArea.tsx";
import {FocusEvent, forwardRef, KeyboardEvent, useImperativeHandle, useMemo, useRef} from "react";
import {GetDataHTMLElement} from "../RichEditor.tsx";
import {useRichEditorContext} from "../../../contexts/LayoutContext.ts";
import {InheritCardProps} from "../CardSelector.tsx";

const BasicTextArea = styled(CustomTextArea)`
    display: block;
`

const BasicCard = forwardRef<GetDataHTMLElement, InheritCardProps>(({data, onBlur, onFocus, onKeyDown, ...rest}, ref) => {
    const targetRef = useRef<CustomTextAreaElement>(null)
    const selection = useMemo(() => window.getSelection(), []) // contenteditable 이 빈 상태에서 랜더링되면 랜더링 전 가져온 selection 은 해당 요소에서 null 이 됨
    const {dispatch} = useRichEditorContext()

    useImperativeHandle(ref, () => {
        if (targetRef.current) {
            return Object.assign(targetRef.current, {
                getData: () => ({html: targetRef.current!.innerHTML})
            }) as GetDataHTMLElement
        }
        throw new Error('BasicStyle ref error!')
    }, []);

    const handleTextArea = {
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            const con = { // 조건 모음
                empty: e.currentTarget.innerHTML === '<br>' || e.currentTarget.innerText === '', // 내용이 없다면
                delete: e.key === 'Backspace', // 블록 삭제
                up: e.key === 'ArrowUp', // 블록 이동 위로
                down: e.key === 'ArrowDown', // 블록 이동 아래로
            }

            // 방향키 Up
            if (con.up) {
                if (!selection) return
                const range = selection.getRangeAt(0)

                const rangeTop = range.getBoundingClientRect().top
                const top = e.currentTarget.getBoundingClientRect().top

                const prev = range.startContainer.previousSibling

                const empty = !prev || (e.currentTarget === range.startContainer)
                const condition1 = rangeTop === 0 && empty;
                const condition2 = rangeTop !== 0 && (rangeTop - top) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    e.preventDefault()
                    console.log('위로')
                }
            }

            // 방향키 Down
            if (con.down) {
                if (!selection) return
                const range = selection.getRangeAt(0)

                const rangeBottom = range.getBoundingClientRect().bottom
                const bottom = e.currentTarget.getBoundingClientRect().bottom

                const condition1 = rangeBottom === 0 && !range.endContainer.nextSibling // 마지막 줄이면서 내용물 없을 때 Br 태그를 가리키며 rangeBottom=0 이 되므로
                const condition2 = (bottom - rangeBottom) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    e.preventDefault()
                    console.log('아래로')
                }
            }
            if (onKeyDown) onKeyDown(e)
        },
        onFocus: (e: FocusEvent<HTMLDivElement>) => {
            dispatch({type: 'TOGGLE_TOOLTIP', payload: true})
            if (onFocus) onFocus(e)
        },
        onBlur: (e: FocusEvent<HTMLDivElement>) => {
            dispatch({type: 'TOGGLE_TOOLTIP', payload: false})
            if (onBlur) onBlur(e)
        },
    }

    return (<BasicTextArea ref={targetRef} {...handleTextArea} {...rest} html={data} />)})

export default BasicCard