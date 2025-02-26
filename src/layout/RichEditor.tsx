import styled from "styled-components";
import MainContainer from "../common/base-style/MainContainer.tsx";
import Section from "../common/base-style/Section.tsx";
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
    DragOption,
    PlusButton,
    TopDropZone
} from "./RichEditor.ui.ts";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import TooltipWithComponent from "../common/component/TooltipWithComponent.tsx";
import CardSelector, {CardProps} from "../features/editor/CardSelector.tsx";
import Draggable from "../common/dragdrop/Draggable.tsx";
import DragDropProvider from "../common/dragdrop/DragDropProvider.tsx";
import DropZone from "../common/dragdrop/DropZone.tsx";
import {useTooltip} from "../global/hook.ts";
import SelectProvider from "../common/select/SelectProvider.tsx";
import Options from "../common/select/Options.tsx";
import Comment from '../assets/svg/comment.svg?react'
import ColorPicker from '../assets/svg/color-picker.svg?react'
import Trash from '../assets/svg/trash.svg?react'
import Copy from '../assets/svg/copy.svg?react'
import Swap from '../assets/svg/swap.svg?react'
import TextToolbar from "../features/editor/TextToolbar.tsx";
import {useRichEditorContext} from "../common/contexts/LayoutContext.ts";
import useCardDrag from "../features/editor/useCardDrag.ts";
import useDataManager from "../features/editor/useDataManager.ts";
import {flushSync} from "react-dom";
import isEqual from "fast-deep-equal";

const Container = styled(MainContainer)`
    font-size: 20px;
    padding-top: 80px;
    
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
    
    .not-allowed { // 자기 자신에 드롭 불가
        //cursor: default !important;
    }
`

// 자식 컴포넌트에서 노출할 ref 타입
export interface GetDataHTMLElement extends HTMLElement {
    getData: () => string;
}


export type StageCardsFunc = (cards: CardProps[]) => CardProps[]

const RichEditor = () => {
    const cardRefs = useRef<{ [id: string]: GetDataHTMLElement | null }>({}); // 객체를 card.id로 관리
    const [cards, setCards] = useState<CardProps[]>([
        {id: crypto.randomUUID(), mode: 'title', data: '제목이옹'},
        {id: crypto.randomUUID(), mode: 'default', data: '1'},
        {id: crypto.randomUUID(), mode: 'default', data: '2'},
        {id: crypto.randomUUID(), mode: 'default', data: '3'},
        {id: crypto.randomUUID(), mode: 'default', data: '4'},
    ]) // 출력할 데이터
    const [stagedCardsFunc, setStagedCardsFunc] = useState<StageCardsFunc>(()=>()=>[]) // 업데이트 될 카드 임시 저장

    const [isUpdate, setIsUpdate] = useState(false)
    const {handleDrop, fromIndex, toIndex} = useCardDrag(cards, cardRefs.current, setStagedCardsFunc) // 카드 드래그&드랍 이동
    const {editorDragBtn, editorPlusBtn} = useTooltip()
    const {state: {isTooltip}} = useRichEditorContext()
    useDataManager(cards, setCards, cardRefs.current)

    const updateCards = useCallback(() => {
        setCards(pre => pre.map((card) => ({
            id: card.id,
            mode: card.mode,
            data: cardRefs.current[card.id]?.getData() ?? card.data,
        })))
    }, [])

    useEffect(() => {
        if (!stagedCardsFunc) return
        updateCards()
        setIsUpdate(true)
    }, [stagedCardsFunc]);

    useEffect(() => {
        if (isUpdate) {
            setCards(pre => stagedCardsFunc(pre))
            setIsUpdate(false)
        }
    }, [isUpdate]);


    const handleAddCard = (index: number) => ({
        onClick: () => {
            // const addIndex = index + 1
        }
    })

    const handleDeleteCard = (index: number) => ({
        onClick: () => {
            // onDeleteCard(index)
        }
    })

    return (<DragDropProvider useDrop={handleDrop}><Container>
        {cards.map((card, index) => {
            return (<Section key={card.id} data-lastblock={cards.length === index+1? 'true': undefined}>
                <DraggableCard>
                    {/* 제목이면 드래그 버튼 제외 */}
                    {index !== 0? <ActionTool>
                        <Draggable data-target-index={index}><SelectProvider>
                                {/* DragBtn = SelectBtn */}
                                <TooltipWithComponent Component={<DragButton><Grab /></DragButton>} summary={editorDragBtn} />
                                <Options>
                                    {/* DragOption = Option */}
                                    <DragOption><Comment />댓글</DragOption>
                                    <DragOption {...handleDeleteCard(index)}><Trash />삭제</DragOption>
                                    <DragOption><Copy />복제</DragOption>
                                    <DragOption><Swap />전환</DragOption>
                                    <SelectProvider>
                                        <DragButton><ColorPicker />색 진심 뭐지</DragButton>
                                        <Options>
                                            호엥
                                        </Options>
                                    </SelectProvider>
                                </Options>
                        </SelectProvider></Draggable>
                    </ActionTool>: null}
                    {/* 카드 선택 */}
                    <Card><CardSelector ref={el => {
                        if (el) {
                            cardRefs.current[card.id] = el
                        } else { // 언마운트시 실행된다는데 확인 필요
                            delete cardRefs.current[card.id]
                        }
                    }} mode={card.mode} data={card.data} /></Card>
                </DraggableCard>
                {/* 카드 나누는 기준 + 카드 추가 */}
                <CardDivider>
                    {toIndex === index? <CardDividerLine/>: null}
                    <TooltipWithComponent Component={<PlusButton {...handleAddCard(index)}><Plus /></PlusButton>} summary={editorPlusBtn} />
                </CardDivider>
                {/* 드롭 영역 상|하 (드래그 상태!==-1 && 현재 드롭할 곳이 아님 === -1) */}
                <DropZone data-select-index={index-1}><TopDropZone className={(fromIndex !== -1) && (toIndex === -1)? 'not-allowed':''} /></DropZone>
                <DropZone data-select-index={index}><BottomDropZone className={(fromIndex !== -1)  && (toIndex === -1)? 'not-allowed':''} /></DropZone>
            </Section>)
        })}
        {isTooltip? <TextToolbar />:null}
    </Container></DragDropProvider>)
}

export default RichEditor