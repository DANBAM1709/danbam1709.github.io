import styled from "styled-components";
import MainContainer from "../base/MainContainer.tsx";
import Section from "../base/Section.tsx";
import Plus from '../assets/svg/plus.svg?react'
import Grab from '../assets/svg/grab.svg?react'
import {
    ActionTool,
    BottomDropZone,
    Card,
    CardDivider,
    CardDividerLine,
    DragButton,
    DraggableCard,
    PlusButton,
    TopDropZone
} from "../editor/EditorUI.ts";
import {MouseEvent, useEffect, useRef, useState} from "react";
import TooltipWithComponent from "../common/TooltipWithComponent.tsx";
import CardSelector, {CardProps} from "../editor/CardSelector.tsx";
import Draggable from "../dragdrop/Draggable.tsx";
import DragDropProvider from "../dragdrop/DragDropProvider.tsx";
import useDrop from "../dragdrop/useDrop.tsx";
import DropZone from "../dragdrop/DropZone.tsx";
import EditorProvider from "../editor/EditorProvider.tsx";

const Container = styled(MainContainer)`
    font-size: 20px;
    
    ${Card}, ${CardDivider} {
        min-width: var(--content-width);
        width: var(--content-width);
    }
    ${DragButton} {
        width: 10px;
        box-sizing: border-box;
    }
    ${ActionTool} {
        margin-right: 10px;
    }
    ${DraggableCard} {
        margin-right: 26px;
    }

    ${Section}[data-lastblock='true'] ${BottomDropZone}{
        padding-bottom: 5em;
    }
    // ${PlusButton} {
    //     display: none;
    // }
    // ${Section}:focus-within ${PlusButton}{
    //     display: flex;
    // }
`

const CustomRichEditor = () => {
    const cardRefs = useRef<(HTMLElement|null)[]>([]) // 카드 배열 ref [], 0: 제목
    const [cards, setCards] = useState<CardProps[]>([]) // 출력할 데이터
    const [targetIndex, setTargetIndex] = useState<number>(-1) // 이동할 컴포넌트
    const [addIndex, setAddIndex] = useState<number>(-1)

    useEffect(() => {
        setCards([
            {id: crypto.randomUUID(), mode: 'title', data: '제목이옹'},
            {id: crypto.randomUUID(), mode: 'default', data: '1'},
            {id: crypto.randomUUID(), mode: 'default', data: '2'},
            {id: crypto.randomUUID(), mode: 'default', data: '3'},
            {id: crypto.randomUUID(), mode: 'default', data: '4'},
        ])
    }, []);

    // 드래그 앤 드롭 정의
    const handleDrop = useDrop({
        dropTarget: cardRefs.current[targetIndex],
        onDragOver: (e?: MouseEvent<HTMLElement>) => {
            const index = parseInt(e?.currentTarget.dataset.selectIndex ?? '-1')
            if (index === targetIndex) {
                setAddIndex(-1)
            } else {
                setAddIndex(index)
            }
        },
        onDragOut: () => {
            setAddIndex(-1)
        },
        onDrop: () => {
            if (addIndex === -1) return // 이동 X

            setCards(prev => { // 위치 이동
                const copy = [...prev];
                copy.splice(addIndex + 1, 0, copy.splice(targetIndex, 1)[0]);
                return copy;
            });
        },
    })

    // 드래그 전 위치 확인
    const handleDragBefore = {
        onMouseEnter: (e: MouseEvent<HTMLElement>) => {
            if (handleDrop.isDrag) return // 드리그 중 무시
            const index = parseInt(e?.currentTarget.dataset.targetIndex ?? '0')
            setTargetIndex(index)
        }
    }

    return (<DragDropProvider useDrop={handleDrop}><Container>
        {cards.map((card, index) => {
            return (<Section key={card.id} data-lastblock={cards.length === index+1? 'true': undefined}>
                <DraggableCard>
                    {/* 제목이면 드래그 버튼 제외 */}
                    {index !== 0? <ActionTool {...handleDragBefore} data-target-index={index}>
                        <Draggable><TooltipWithComponent Component={<DragButton><Grab /></DragButton>} summary={'쓰읍'} /></Draggable>
                    </ActionTool>: null}
                    {/* 카드 선택 */}
                    <Card ref={el => cardRefs.current[index]=el}><CardSelector mode={card.mode} data={card.data} /></Card>
                </DraggableCard>
                {/* 카드 나누는 기준 */}
                <CardDivider>
                    {addIndex === index? <CardDividerLine/>: null}
                    <TooltipWithComponent Component={<PlusButton><Plus /></PlusButton>} summary={'클릭해서 블록 추가'} />
                </CardDivider>
                <DropZone data-select-index={index-1}><TopDropZone/></DropZone>
                <DropZone data-select-index={index}><BottomDropZone/></DropZone>
            </Section>)
        })}
    </Container></DragDropProvider>)
}

const RichEditor = () => (<EditorProvider><CustomRichEditor /></EditorProvider>)

export default RichEditor