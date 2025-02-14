import styled from "styled-components";
import MainContainer from "../base/MainContainer.tsx";
import Section from "../base/Section.tsx";
import Plus from '../assets/svg/plus.svg?react'
import Grab from '../assets/svg/grab.svg?react'
import {
    ActionTool,
    Card,
    CardDivider,
    CardDividerLine, CardDropZone,
    DragButton,
    DraggableCard,
    PlusButton,
    Title
} from "../editor/EditorUI.ts";
import {MouseEvent, useEffect, useRef, useState} from "react";
import TooltipWithComponent from "../common/TooltipWithComponent.tsx";
import TemplateSelector, {TemplateSelectorProps} from "../editor/TemplateSelector.tsx";
import Draggable from "../dragdrop/Draggable.tsx";
import DragDropProvider from "../dragdrop/DragDropProvider.tsx";
import useDrop from "../dragdrop/useDrop.tsx";
import DropZone from "../dragdrop/DropZone.tsx";

const Container = styled(MainContainer)`
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

    // ${PlusButton} {
    //     display: none;
    // }
    // ${Section}:focus-within ${PlusButton}{
    //     display: flex;
    // }
`

// type DataType = {[key: string]: string | string[] }| string

type CardProps = {
    id: string
} & TemplateSelectorProps

const RichEditor = () => {
    const [dropTarget, setDropTarget] = useState<HTMLElement|null>(null) // 이동할 컴포넌트
    const titleRef = useRef<HTMLDivElement>(null) // 제목 textarea
    const cardRefs = useRef<(HTMLElement|null)[]>([]) // 카드 배열 ref []
    const [cards, setCards] = useState<CardProps[]>([]) // 출력할 데이터

    // 드래그 앤 드롭 정의
    const handleDrop = useDrop({
        dropTarget: dropTarget,
        onDragStart: (e?: MouseEvent<HTMLElement>) => {
            // const index = parseInt(e?.currentTarget.dataset.index ?? '0')
            // setDropTarget(cardRefs.current[index])
        },
        // onDragOver: () => {
        //   console.log(dropTarget)
        // },
        onDrop: (e?: MouseEvent<HTMLElement>) => {
            const i = e?.currentTarget.dataset.index ?? '-1'
            const index = parseInt(i) + 1 // 0: 제목
        }
    })

    useEffect(() => {
        setCards([
            {id: crypto.randomUUID(), mode: 'default', data: '1'},
            {id: crypto.randomUUID(), mode: 'default', data: '2'},
            {id: crypto.randomUUID(), mode: 'default', data: '2'},
            {id: crypto.randomUUID(), mode: 'default', data: '2'},
        ])
    }, []);

    // 드래그 전 위치 확인
    const handleDragBefore = {
        onMouseEnter: (e: MouseEvent<HTMLElement>) => {
            const index = parseInt(e?.currentTarget.dataset.index ?? '0')
            setDropTarget(cardRefs.current[index])
        }
    }

    const handleAddCard = (index: number) => ({
        onClick: (e: MouseEvent<HTMLDivElement>) => {
            console.log(index)
        }
    })

    return (<DragDropProvider useDrop={handleDrop}><Container>
        {/* 제목 */}
        <Section>
            {/* 카드 */}
            <Card><Title ref={titleRef} data-placeholder={'제목'}></Title></Card>
            {/* divider */}
            <CardDivider>
                <DropZone><CardDropZone /></DropZone>
                <CardDividerLine />
                <TooltipWithComponent Component={<PlusButton><Plus /></PlusButton>} summary={'클릭해서 블록 추가'} />
            </CardDivider>
        </Section>
        {/* 내용 */}
        {cards.map((card, index) => {
            return (<Section key={card.id}>
                {/* 카드 */}
                <DraggableCard>
                    <ActionTool {...handleDragBefore} data-index={index}>
                        <Draggable><TooltipWithComponent Component={<DragButton><Grab /></DragButton>} summary={'쓰읍'} /></Draggable>
                    </ActionTool>
                    <Card ref={el => cardRefs.current[index]=el}><TemplateSelector mode={card.mode} data={card.data} /> </Card>
                </DraggableCard>
                {/* divider */}
                <CardDivider>
                    <DropZone><CardDropZone /></DropZone>
                    <CardDividerLine />
                    <TooltipWithComponent Component={<PlusButton><Plus /></PlusButton>} summary={'클릭해서 블록 추가'} />
                </CardDivider>
            </Section>)
        })}
    </Container></DragDropProvider>)
}

export default RichEditor