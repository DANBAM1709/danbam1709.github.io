import styled from 'styled-components';
import {FocusEvent, forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import ContentEditable, {ContentEditableEvent} from "react-contenteditable";

const Container = styled(ContentEditable)`
    flex: 1;
    min-width: 0; // flex: 1 일 때  내부 콘텐츠가 넘쳐 너비가 길어지는 것을 방지함
    width: 100%;
    white-space: pre-wrap;
    word-break: break-word;
    display: inline-block; // block 의 경우 엔터 기본 이벤트 규칙이 다소 엉망임..
    
    &:focus {
        outline: none;
        border: none;
        background: rgba(173, 216, 230, 0.1);
    }
`

export interface CustomTextAreaElement extends HTMLDivElement {
    setInnerHTML(newHTML: string): void;
}
export type CustomTextAreaProps = {content?: {html: string}}

const CustomTextArea = forwardRef<CustomTextAreaElement, CustomTextAreaProps>(({content}, ref) => {
    const selection = useMemo(() => window.getSelection(), [])
    const [innerHTML, setInnerHTML] = useState<string>('')
    const textAreaRef = useRef<CustomTextAreaElement>(null)

    useImperativeHandle(ref, () => {
        if (textAreaRef.current) {
            return Object.assign(textAreaRef.current, {
                setInnerHTML: (newHTML: string) => {
                    setInnerHTML(newHTML)
                }
            }) as CustomTextAreaElement
        }
        throw new Error('TextArea ref error!')
    });

    useEffect(() => {
        setInnerHTML(content?.html ?? '')
    }, [content]);

    const handler = {
        onChange: (e: ContentEditableEvent) => {
            setInnerHTML(e.target.value)
        },
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Tab') { // Tab -> /t
                e.preventDefault()

                if (!selection) return
                const range = selection.getRangeAt(0)
                range.deleteContents() // 선택영역 삭제
                const tabNode = document.createTextNode('\t')
                range.insertNode(tabNode)
                range.setStartAfter(tabNode) // 커서 이동

                setInnerHTML(e.currentTarget.innerHTML ?? '')
            }

            if (e.key === 'Escape') { // ESC 선택영역 없애기
                if (!selection) return
                selection.collapse(selection.focusNode, selection.focusOffset)
            }

        },
        onBlur: (e: FocusEvent<HTMLDivElement>) => {  // 브라우저 기본 동작 전부 지웠을 때 <br> 만 남는 현상 방지 data-placeholder 를 쓰기 위함
            if (e.currentTarget.innerHTML === '<br>') e.currentTarget.innerHTML = ''
        }
    }

    return (
        <Container innerRef={textAreaRef} tabIndex={0} tagName={'div'}
                   suppressContentEditableWarning={true} html={innerHTML}
                   {...handler}
        />
    )
})

export default CustomTextArea