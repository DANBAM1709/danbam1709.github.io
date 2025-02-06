import styled from 'styled-components';
import {ComponentPropsWithoutRef, forwardRef, KeyboardEvent, useMemo} from "react";

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

const CustomTextArea = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(({onInput, onKeyDown, ...props}, ref) => {
    const selection = useMemo(() => window.getSelection(), [])

    // display: block 으로 변경 후 전체 지우면 완전 삭제됨 오히려 좋을지도?
    const handleInput = (e:KeyboardEvent<HTMLDivElement>) => { // 브라우저 기본 동작 전부 지웠을 때 <br> 만 남는 현상 방지
        if (e.currentTarget.innerHTML === '<br>') e.currentTarget.innerHTML = ''
        if (onInput) onInput(e)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => { // 키보드 이벤트
        if (e.key === 'Tab') { // Tab -> /t
            e.preventDefault()
            const selection = window.getSelection()

            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                range.deleteContents() // 선택영역 삭제

                const tabNode = document.createTextNode('\t')
                range.insertNode(tabNode)
                range.setStartAfter(tabNode) // 커서 이동
            }
        }

        // display:block 첫 줄 텍스트 노드로 들어간 것을 Div 로 바꿔치기
        if (e.currentTarget.firstChild?.nodeType === Node.TEXT_NODE) {
            const range = selection!.getRangeAt(0)
            let container = range.startContainer
            const offset = range.startOffset

            const newDiv = document.createElement('div')
            newDiv.textContent = e.currentTarget.firstChild.textContent ?? ''
            e.currentTarget.replaceChild(newDiv, e.currentTarget.firstChild)

            console.log(container, offset)
            if (container !== range.startContainer) { // 바꿔치기 되었다면
                container = newDiv.firstChild!
            }

            // const newRange = document.createRange()
            range.setStart(container, offset)
            range.collapse(true)
        }

        if (onKeyDown) onKeyDown(e)
    }

    return (
        <Container ref={ref} tabIndex={0} contentEditable={true}
                   onInput={handleInput} onKeyDown={handleKeyDown}
                   suppressContentEditableWarning={true}
                   {...props}
        />
    )
})

export default CustomTextArea