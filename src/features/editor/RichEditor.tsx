import styled from "styled-components";
import MainContainer from "../../base-style/MainContainer.tsx";
import Section from "../../base-style/Section.tsx";
import Plus from '../../assets/svg/plus.svg?react'
import Grab from '../../assets/svg/grab.svg?react'
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
import {FocusEvent, useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import TooltipWithComponent from "../../component/TooltipWithComponent.tsx";
import CardSelector, {CardProps} from "./CardSelector.tsx";
import Draggable from "../../dragdrop/Draggable.tsx";
import DragDropProvider from "../../dragdrop/DragDropProvider.tsx";
import DropZone from "../../dragdrop/DropZone.tsx";
import {useTooltip} from "../../global/hook.ts";
import SelectProvider from "../../select-option/SelectProvider.tsx";
import Options from "../../select-option/Options.tsx";
import Comment from '../../assets/svg/comment.svg?react'
import ColorPicker from '../../assets/svg/color-picker.svg?react'
import Trash from '../../assets/svg/trash.svg?react'
import Copy from '../../assets/svg/copy.svg?react'
import Swap from '../../assets/svg/swap.svg?react'
import TextToolbar from "./TextToolbar.tsx";
import {useRichEditorContext} from "../../contexts/LayoutContext.ts";
import {eventManager} from "../../utils/event.ts";
import useCardDragDrop from "./hook/useCardDragDrop.ts";
import useRichEditorHistory from "./hook/useRichEditorHistory.ts";
import useCursorManager from "../../hook/useCursorManager.ts";
import isEqual from "fast-deep-equal";
import useCardSelect from "./hook/useCardSelect.ts";
import {throttle} from "lodash";

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
`

// 자식 컴포넌트에서 노출할 ref 타입
export interface GetDataHTMLElement extends HTMLElement {
    getData: () => CardProps['data']
}
type Cursor = { // 마커로 표시
    startPos: number
    endPos: number
    element: HTMLElement|null
} | null
interface Scroll {
    x: number
    y: number
}
export type Data = {
    cards: CardProps[]
    cursor: Cursor
    scroll: Scroll
} | null

const RichEditor = () => {
    const cardRefs = useRef<{ [id: string]: GetDataHTMLElement | null }>({}); // 객체를 card.id로 관리
    const [cards, setCards] = useState<CardProps[]>([
        {data: {html: '제목이옹'}, id: crypto.randomUUID(), mode: 'title'},
        {data: {html: '1'}, id: crypto.randomUUID(), mode: 'default'},
        {data: {html: '2'}, id: crypto.randomUUID(), mode: 'default'},
        {data: {html: '3'}, id: crypto.randomUUID(), mode: 'default'},
        {data: {html: '4'}, id: crypto.randomUUID(), mode: 'default'},
    ]) // 출력할 데이터
    const {editorDragBtn, editorPlusBtn} = useTooltip()
    const {state: {isTooltip}} = useRichEditorContext()

    // ------ 최신 카드 데이터 가져오는 함수 ------
    const [currentEditElement, setCurrentEditElement] = useState<HTMLElement|null>(null) // 현재 편집 중인 요소
    const {getCursorOffsets} = useCursorManager()
    const getLatestScroll = useCallback(() => ({x: window.scrollX, y: window.scrollY}), [])
    const getLatestCards = useCallback(() => { // 최신 카드 데이터
        if (!cards) return cards
        return (cards.map((card) => ({
            data: cardRefs.current[card.id]?.getData() ?? card.data,
            id: card.id,
            mode: card.mode,
        })))
    }, [cards]);
    const [currentRecord, setCurrentRecord] = useState<Data|null>(null) // present
    const getLatestData = useCallback((params?: {getCards?: () => CardProps[], canUpdate?: boolean}): Data => {
        const { getCards = getLatestCards, canUpdate = false } = params || {}; // 선택적으로 인자 전달 가능
        const latestCards = getCards()
        if (!canUpdate && isEqual(currentRecord?.cards, latestCards)) return currentRecord

        const cursorPos = getCursorOffsets(currentEditElement)
        let cursor = null

        if (cursorPos) {
            const {startPos, endPos} = cursorPos
            cursor = {startPos: startPos, endPos: endPos, element: currentEditElement}
        }

        return {
            cards: latestCards,
            cursor: cursor,
            scroll: getLatestScroll()
        }
    }, [currentEditElement, currentRecord, getCursorOffsets, getLatestCards, getLatestScroll])

    // ------ history 관리 ------
    const {handleHistory, undo, redo, updateHistory, current} = useRichEditorHistory(setCards, getLatestData, getLatestCards)
    const updateHistoryWithLatestData = useCallback((updateCards?: CardProps[]) =>{
        const latestCards = getLatestData({getCards: () => updateCards ?? getLatestCards()})
        setCards(latestCards?.cards ?? [])
        updateHistory(latestCards)
    }, [getLatestCards, getLatestData, updateHistory])

    // ------ 드래그 & 드랍 ------
    const {handleDrop, fromIndex, toIndex} = useCardDragDrop(cards, cardRefs.current, updateHistoryWithLatestData)

    // ---------- history 이벤트 핸들러 ----------
    useEffect(() => setCurrentRecord(current), [current]); // 위에서 current 데이터 사용하기 위함

    const [isFirstUndo, setIsFirstUndo] = useState(true)
    const [isUndoRecorded, setIsUndoRecorded] = useState(false) // undo 시 history 업뎃을 했는가

    useLayoutEffect(() => {
        setIsUndoRecorded(false)
        if (isUndoRecorded) undo()
    }, [isUndoRecorded]);

    // 일정 시간동안 사용할 수 없도록 막기 속도 조절 repeat 너무 빨라서 역으로 부자연스러움
    const throttledUndo = throttle(() => undo(), 50, {trailing: false})
    const throttledRedo = throttle(() => redo(), 50 , {trailing: false})

    useEffect(() => {
        eventManager.addEventListener('keydown', 'RichEditor', (event: Event) => {
            const e = event as KeyboardEvent
            if (e.ctrlKey && e.key.toLowerCase() === 'z' ) {
                e.preventDefault() // 브라우저 기본 뒤로 가기 방지
                setIsFirstUndo(false)
                let isEqualData = true // 데이터가 같은지 확인
                let latestData = null
                
                if (isFirstUndo) { // 첫번째 undo 라면 데이터 검증
                    latestData = getLatestData()
                    isEqualData = isEqual(latestData, current)
                }
                if (!isEqualData) { // 데이터가 같지 않다면 
                    updateHistory(latestData) // 데이터 업로드
                    setIsUndoRecorded(true) // 인덱스가 변할 때까지 기다릴 필요가 있어서
                    return;
                }
                
                if (e.repeat) throttledUndo() // 누르고 잇는 상태
                else undo()
                
            } else {
                setIsFirstUndo(true)
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'y' ) {
                e.preventDefault() // 브라우저 기본 앞으로 가기 방지
                if (e.repeat) throttledRedo() // 누르고 있는 상태
                else redo()
            }
        })
        
        return () => eventManager.removeEventListener('keydown', 'RichEditor')
    }, [undo, redo, throttledUndo, throttledRedo, isFirstUndo, getLatestData, updateHistory, current]);

    // 커서 위치 저장을 위한 Element 객체 담기
    const [selectedIndex, setSelectedIndex] = useState<number|null>(null)
    useCardSelect(cards, selectedIndex, cardRefs.current)

    const handleCard = (index: number) => ({
        onFocus: (e: FocusEvent<HTMLDivElement>) => {
            setCurrentEditElement(e.target as HTMLElement) // 어차피 계산 방식 상 어떤 타겟이든 상관 없음
            setSelectedIndex(index)
        },
        onBlur: () => {
            setCurrentEditElement(null)
            setSelectedIndex(null)
        }
    })
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
                    <Card {...handleHistory}><CardSelector {...handleCard(index)} ref={el => {
                        if (el) {
                            cardRefs.current[card.id] = el
                        } else { // 언마운트시 실행된다는데 인 필요
                            delete cardRefs.current[card.id]
                        }
                    }} mode={card.mode} data={card.data}
                    /></Card>
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