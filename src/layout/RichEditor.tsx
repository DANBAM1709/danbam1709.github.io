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
    DragOption,
    PlusButton,
    TopDropZone
} from "./RichEditorUI.ts";
import {MouseEvent, useEffect, useRef, useState} from "react";
import TooltipWithComponent from "../common/TooltipWithComponent.tsx";
import CardSelector, {CardProps} from "../editor/CardSelector.tsx";
import Draggable from "../dragdrop/Draggable.tsx";
import DragDropProvider from "../dragdrop/DragDropProvider.tsx";
import useDrop from "../dragdrop/useDrop.tsx";
import DropZone from "../dragdrop/DropZone.tsx";
import {useTooltip} from "../global/hook.ts";
import SelectProvider from "../select/SelectProvider.tsx";
import Options from "../select/Options.tsx";
import Comment from '../assets/svg/comment.svg?react'
import ColorPicker from '../assets/svg/color-picker.svg?react'
import Trash from '../assets/svg/trash.svg?react'
import Copy from '../assets/svg/copy.svg?react'
import Swap from '../assets/svg/swap.svg?react'
import TextToolbar from "../editor/TextToolbar.tsx";
import {useRichEditContext} from "../editor/RichEditorReducer.ts";
import useUndoRedo from "../editor/useUndoRedo.ts";

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
    
    .not-allowed { // 자기 자신에 드롭 불가 스타일
        cursor: none !important;
    }
`

// 자식 컴포넌트에서 노출할 ref 타입
export interface GetDataHTMLElement extends HTMLElement {
    getData: () => string;
}

const RichEditor = () => {
    const cardRefs = useRef<(GetDataHTMLElement|null)[]>([]) // 카드 배열 ref [], 0: 제목
    const [cards, setCards] = useState<CardProps[]>([
        {id: crypto.randomUUID(), mode: 'title', data: '제목이옹'},
        {id: crypto.randomUUID(), mode: 'default', data: '1'},
        {id: crypto.randomUUID(), mode: 'default', data: '2'},
        {id: crypto.randomUUID(), mode: 'default', data: '3'},
        {id: crypto.randomUUID(), mode: 'default', data: '4'},
    ]) // 출력할 데이터

    const tooltip = useTooltip()
    const {state, dispatch} = useRichEditContext()
    const {present, set, isUndoRedo, setIsUndoRedo} = useUndoRedo(cards)

    // undo|redo 뒤로|앞으로
    useEffect(() => {
        if (!isUndoRedo) { // 카드 history 저장
            set(cards)
        } else { // undo | redo 업데이트
            setCards(present.present)
            setIsUndoRedo(false)
        }
    }, [isUndoRedo, cards]);

    // 카드 삭제
    useEffect(() => {
        const index = cardRefs.current.findIndex(ref => ref === state.deleteEl);
        if (index > 0) {
            setCards(card => card.filter((_, i) => i !== index))
            cardRefs.current[index-1]?.focus()
        }
    }, [state.deleteEl]);

    // 드래그 앤 드롭 정의
    const handleDrop = useDrop({
        dropTarget: cardRefs.current[state.dragIndex],
        onDragStartBefore: (e?: MouseEvent<HTMLElement>) => {
            const index = parseInt(e?.currentTarget.dataset.targetIndex ?? '0')
            dispatch({type: 'DRAG_INDEX_UPDATE', payload: index})
        },
        onDragOver: (e?: MouseEvent<HTMLElement>) => {
            const dragIndex = state.dragIndex
            let dropIndex = parseInt(e?.currentTarget.dataset.selectIndex ?? '-1')

            if (dropIndex + 1 == dragIndex || dragIndex == dropIndex) { // 이동할 위치가 자기 자신이면
                dropIndex = -1
            }
            console.log(dragIndex)
            dispatch({type: 'DROP_INDEX_UPDATE', payload: dropIndex})
        },
        onDragOut: () => {
            dispatch({type: 'DROP_INDEX_UPDATE', payload: -1})
        },
        onDrop: () => {
            const [dropIndex, dragIndex] = [state.dropIndex, state.dragIndex]
            if (dropIndex === -1) return // 이동 X

            setCards(prev => { // 위치 이동
                const copy = [...prev];
                const [element] = copy.splice(dragIndex, 1);
                const insertIndex = dragIndex <= dropIndex ? dropIndex : dropIndex + 1;
                copy.splice(insertIndex, 0, element);
                return copy;
            });
        },
    })

    const handleAddCard = (index: number) => ({
        onClick: () => {
            const addIndex = index + 1
        }
    })

    const onDeleteCard = (index: number) => dispatch({type: 'DELETE_CARD', payload: cardRefs.current[index]!})

    // 카드 데이터 변경
    const onCardsUpdate = () => {
        setCards(prev => {
            return prev.map((card, index) => ({
                id: card.id,
                mode: card.mode,
                data: cardRefs.current[index]?.getData() ?? "", // getData()가 undefined면 빈 문자열을 사용
            }));
        });
    }

    return (<DragDropProvider useDrop={handleDrop}><Container>
        {cards.map((card, index) => {
            return (<Section key={card.id} data-lastblock={cards.length === index+1? 'true': undefined}>
                <DraggableCard>
                    {/* 제목이면 드래그 버튼 제외 */}
                    {index !== 0? <ActionTool>
                        <Draggable data-target-index={index}><SelectProvider>
                                {/* DragBtn = SelectBtn */}
                                <TooltipWithComponent Component={<DragButton><Grab /></DragButton>} summary={tooltip.editorDragBtn} />
                                <Options>
                                    {/* DragOption = Option */}
                                    <DragOption><Comment />댓글</DragOption>
                                    <DragOption onClick={()=>onDeleteCard(index)}><Trash />삭제</DragOption>
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
                    <Card><CardSelector ref={el => cardRefs.current[index]=el} mode={card.mode} data={card.data} /></Card>
                </DraggableCard>
                {/* 카드 나누는 기준 + 카드 추가 */}
                <CardDivider>
                    {state.dropIndex === index? <CardDividerLine/>: null}
                    <TooltipWithComponent Component={<PlusButton {...handleAddCard(index)}><Plus /></PlusButton>} summary={tooltip.editorPlusBtn} />
                </CardDivider>
                {/* 드롭 영역 상|하 (드래그 상태!==-1 && 현재 드롭할 곳이 아님 === -1) */}
                <DropZone data-select-index={index-1}><TopDropZone className={(state.dragIndex !== -1) && (state.dropIndex === -1)? 'not-allowed':''} /></DropZone>
                <DropZone data-select-index={index}><BottomDropZone className={(state.dragIndex !== -1)  && (state.dropIndex === -1)? 'not-allowed':''} /></DropZone>
            </Section>)
        })}
        {state.isTooltip? <TextToolbar />:null}
    </Container></DragDropProvider>)
}

export default RichEditor