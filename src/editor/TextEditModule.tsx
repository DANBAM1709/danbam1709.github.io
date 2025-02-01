import styled from "styled-components";
import CustomTextArea from "./CustomTextArea.tsx";
import {TextFormattingToolbar} from "./TextFormattingToolbar.tsx";
import {useEffect, useMemo, useState} from "react";
import {eventManager} from "../shared/utils/event.ts";
import SoftBtn from "../shared/component/SoftBtn.tsx";
import TooltipWrapper from "../shared/component/TooltipWrapper.tsx";

const Container = styled.div`
    display: flex;
    position: relative;
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

    const toolbarPosition= useMemo(() => { // 툴바 위치 조정
        return {
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            display: `${isSelected? 'block' : 'none'}`
        }
    }, [pos, isSelected])

    return (<Container>
        <TextFormattingToolbar style={toolbarPosition} />
        <div style={{position:"absolute", display: 'flex', marginRight: '4px', left: '-45px'}}>
            {/* + */}
            <TooltipWrapper summary={'클릭해서 아래에 추가\n위에 블록을 추가하려면 alt+클릭'}>
                <SoftBtn style={{width: '24px', height: '24px', padding: 0, marginRight: '2px'}}>
                    <img src={`plus.svg`} alt={'plus.svga'} width={'16px'} height={'16px'} />
                </SoftBtn>
            </TooltipWrapper>
            {/* grab */}
            <TooltipWrapper summary={'드래그해서 옮기기'}>
                <SoftBtn style={{cursor: 'grab', fill: 'rgba(55, 53, 47, 0.35)', width: '18px', height: '24px', padding: 0}}>
                    <img src={'grab.svg'} alt={'grab.svg'} width={'14px'} height={'14px'} />
                </SoftBtn>
            </TooltipWrapper>
        </div>
        <CustomTextArea />
    </Container>)
}

export default TextEditModule