import styled from 'styled-components';
import {useState, useMemo, KeyboardEvent, useEffect} from "react";
import {TextFormattingToolbar} from "./TextFormattingToolbar.tsx";
import {eventManager} from "../shared/utils/event.ts";
import { StyledComponent, dynamicStyles } from "../shared/mixins/dynamicStyle.ts";

const Container = styled.div<StyledComponent>`
    /* 테스트용 css */
    background-color: gray;
    color: whitesmoke;
    font-size: 25px;
    //font-weight: bold;
    
    /* 실제 반영할 css  */
    width: 100%;
    white-space: pre-wrap;
    display: inline-block; // block 의 경우 엔터 기본 이벤트 규칙이 다소 엉망임..
    
    &:focus {
        outline: none;
    }
    
    /* 동적 스타일 */
    ${dynamicStyles} 
`

const CustomTextArea = (props: StyledComponent) => {
    const [pos, setPos] = useState({x: 0, y: 0}) // 툴바 위치 조정
    const [isSelected, setIsSelected] = useState(false) // 선택 영역이 있는지 확인

    /* 선택 영역에 따라 툴바 위치 조정 */
    useEffect(() => {
        const selection = window.getSelection()

        const handleSelectionChange = ()=> {
            if (selection && !selection.isCollapsed) { // 선택 영역이 있는 경우
                const range = selection.getRangeAt(0)
                // const selectedText = selection.toString()

                const rect = range.getClientRects()
                const firstRect = rect[0]
                const lastRect = rect[rect.length-1]

                const topSpace = 40 // 선택 영역보다 올릴 위치 임시 위치
                let [x, y] = [firstRect.left, firstRect.top-topSpace]

                if (firstRect.top < topSpace && lastRect.bottom > 0) { // 선택 영역이 안보이는 위치부터 보이는 위치까지 있는 경우
                    [x, y] = [0, 0]
                }

                setPos({x: x, y: y})
                setIsSelected(true)
            } else { // 선택 영역이 없는 경우
                setIsSelected(false)
            }
        }

        eventManager.addEventListener('selectionchange', 'CustomTextAreaSelect', handleSelectionChange)
        eventManager.addEventListener('scroll', 'CustomTextAreaScroll', handleSelectionChange)
        return () => eventManager.removeEventListener('scroll', 'CustomTextArea')
    }, []);

    const toolbarStyle= useMemo(() => { // 툴바 위치 조정
        return `
            left: ${pos.x}px;
            top: ${pos.y}px; 
            display: ${isSelected? 'block' : 'none'};
        `
    }, [pos, isSelected])

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
        <>
            <TextFormattingToolbar $customStyles={toolbarStyle} />
            <Container contentEditable={true}
                       onKeyDown={handleKeyDown}
                       $customStyles={props.$customStyles}
             />
        </>
    )
}

export default CustomTextArea