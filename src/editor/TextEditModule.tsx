import styled from "styled-components";
import PlusButton from "../shared/components/PlusButton.tsx";
import CustomTextArea from "./CustomTextArea.tsx";
import {TextFormattingToolbar} from "./TextFormattingToolbar.tsx";
import {useEffect, useMemo, useState} from "react";
import {eventManager} from "../shared/utils/event.ts";

const Container = styled.div`
    display: flex;
`

const TextEditModule = () => {
    const [pos, setPos] = useState({x: 0, y: 0}) // 툴바 위치 조정
    const [isSelected, setIsSelected] = useState(false) // 선택 영역이 있는지 확인

    /* 선택 영역에 따라 툴바 위치 조정 */
    useEffect(() => {
        const selection = window.getSelection()

        const handleSelectionChange = ()=> {
            if (selection && !selection.isCollapsed) { // 선택 영역이 있는 경우
                const range = selection.getRangeAt(0)

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
        return {
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            display: `${isSelected? 'block' : 'none'}`
        }
    }, [pos, isSelected])

    return (<Container>
        <TextFormattingToolbar style={toolbarStyle} />
        <div>
            <div style={{marginTop: 'calc(var(--line-height, 1.5em) / 2)'}}>&nbsp;<PlusButton /></div>
        </div>
        <CustomTextArea />
        <div>흐음</div>
    </Container>)
}

export default TextEditModule