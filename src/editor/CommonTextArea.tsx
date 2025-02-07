import styled from 'styled-components';
import {ComponentPropsWithoutRef, forwardRef, KeyboardEvent, FocusEvent, useMemo} from "react";

const Container = styled.div`
    flex: 1;
    min-width: 0; // flex: 1 일 때  내부 콘텐츠가 넘쳐 너비가 길어지는 것을 방지함
    width: 100%;
    white-space: pre-wrap;
    word-break: break-word;
    //display: inline-block; // block 의 경우 엔터 기본 이벤트 규칙이 다소 엉망임..
    outline: none !important;
    border: none !important;
    
    &:focus {
        outline: none;
        border: none;
    }
`

const CommonTextArea = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(({onFocus, onBlur, onKeyDown, ...props}, ref) => {
    const selection = useMemo(() => window.getSelection(), [])

    const handler = {
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Tab') { // Tab -> /t
                e.preventDefault()

                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0)
                    range.deleteContents() // 선택영역 삭제

                    const tabNode = document.createTextNode('\t')
                    range.insertNode(tabNode)
                    range.setStartAfter(tabNode) // 커서 이동
                }
            }

            if (onKeyDown) onKeyDown(e)
        },
        onFocus: (e: FocusEvent<HTMLDivElement>) => {
            e.currentTarget.classList.add('focus')
            if (onFocus) onFocus(e)
        }
        ,
        onBlur: (e: FocusEvent<HTMLDivElement>) => {  // 브라우저 기본 동작 전부 지웠을 때 <br> 만 남는 현상 방지
            e.currentTarget.classList.remove('focus')
            // display: block 으로 변경 후 전체 지우면 완전 삭제됨 오히려 좋을지도?
            if (e.currentTarget.innerHTML === '<br>') e.currentTarget.innerHTML = ''
            if (onBlur) onBlur(e)
        }
    }

    return (
        <Container ref={ref} tabIndex={0} contentEditable={true}
                   suppressContentEditableWarning={true}
                   {...handler} {...props}
        />
    )
})

export default CommonTextArea