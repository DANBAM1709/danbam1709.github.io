import styled from 'styled-components';
import {KeyboardEvent, ComponentPropsWithoutRef} from "react";

const Container = styled.div`
    /* 테스트용 css */
    //background-color: gray;
    //color: whitesmoke;
    font-size: 25px;
    //font-weight: bold;
    
    /* 실제 반영할 css  */
    flex: 1;
    min-width: 0; // 내부 콘텐츠가 넘쳐 길어지는 것을 방지함
    width: 100%;
    white-space: pre-wrap;
    display: inline-block; // block 의 경우 엔터 기본 이벤트 규칙이 다소 엉망임..
    
    &:focus {
        outline: none;
    }
`

const CustomTextArea = ({...rest}: ComponentPropsWithoutRef<'div'>) => {

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
    }

    return (
        <Container contentEditable={true}
                   onKeyDown={handleKeyDown}
                   {...rest}
        />
    )
}

export default CustomTextArea