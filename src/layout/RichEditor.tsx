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
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
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
import useCardDragDrop from "../features/editor/useCardDragDrop.ts";
import useHistory from "../common/history/useHistory.ts";
import {eventManager} from "../global/event.ts";
import isEqual from "fast-deep-equal";
import {CustomTextAreaElement, isCustomTextAreaElement} from "../common/component/TextArea.tsx";

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
interface Cursor {
    startContainer: Node
    startOffset: number
    endContainer: Node
    endOffset: number
}

const RichEditor = () => {
    const cardRefs = useRef<{ [id: string]: GetDataHTMLElement | null }>({}); // 객체를 card.id로 관리
    const [cards, setCards] = useState<CardProps[]>([
        {data: '제목이옹', id: crypto.randomUUID(), mode: 'title'},
        {data: '1', id: crypto.randomUUID(), mode: 'default'},
        {data: '2', id: crypto.randomUUID(), mode: 'default'},
        {data: '3', id: crypto.randomUUID(), mode: 'default'},
        {data: '4', id: crypto.randomUUID(), mode: 'default'},
    ]) // 출력할 데이터
    const {editorDragBtn, editorPlusBtn} = useTooltip()
    const {state: {isTooltip}} = useRichEditorContext()

    const [stagedCardsFunc, setStagedCardsFunc] = useState<StageCardsFunc|null>(null) // 카드 업데이트 방식 function 저장
    const [canStageUpdate, setCanStageUpdate] = useState(false) // 카드 업데이트 step 나누기 위한 flag

    const {handleDrop, fromIndex, toIndex} = useCardDragDrop(cards, cardRefs.current, setStagedCardsFunc) // 카드 드래그&드랍 이동

    // const [cursorStage, setCursorStage] = useState<(Cursor|null)[]>([])
    // const [cursorHistory, setCursorHistory] = useState<(Cursor|null)[]>([])
    //
    // const getLatestCursor = useCallback((): Cursor|null => {
    //     const selection = window.getSelection()
    //
    //     if (!selection || selection.rangeCount === 0) return null
    //     const range = selection.getRangeAt(0)
    //     const {startContainer, startOffset, endContainer, endOffset} = range
    //     return {
    //         startContainer: startContainer,
    //         startOffset: startOffset,
    //         endContainer: endContainer,
    //         endOffset: endOffset
    //     }
    // }, [])
    // const setCursor = useCallback((cursor: Cursor|null) => {
    //     const range = document.createRange()
    //     const selection = window.getSelection()
    //     selection?.removeAllRanges()
    //
    //     if (cursor) {
    //         const {startContainer, startOffset, endContainer, endOffset} = cursor
    //         range.setStart(startContainer, startOffset)
    //         range.setEnd(endContainer, endOffset)
    //         selection?.addRange(range)
    //     }
    // }, [])
    // const getLatestData = useCallback(() => {
    //
    // }, [])
    const getLatestCards = useCallback(() => {
        if (!cards) return cards
        return (cards.map((card) => ({
            data: cardRefs.current[card.id]?.getData() ?? card.data,
            id: card.id,
            mode: card.mode,
        })))
    }, [cards])

    /* ========== 카드 현상태 업데이트 후 변경 ========== */
    useEffect(() => { // STEP 1. 현 상태 업데이트
        if (!stagedCardsFunc) return
        setCards(getLatestCards())
        setCanStageUpdate(true)
    }, [stagedCardsFunc]);
    useEffect(() => { // STEP 2. 새롭게 변경될 카드 업데이트 (이동, 삭제, 추가 등)
        if (canStageUpdate && stagedCardsFunc) {
            setCards(pre => stagedCardsFunc(pre))
            setCanStageUpdate(false)
        }
    }, [canStageUpdate]);

    /* ========== History 설정 ========== */
    const {present, updateHistory} = useHistory<CardProps[]>(cards, setCards, getLatestCards)

    // history 업데이트 필요할 경우 감지
    const [canUpdateHistory, setCanUpdateHistory] = useState<boolean>(false)

    useLayoutEffect(() => { // history 업데이트
        if (!canUpdateHistory) return
        if (!isEqual(getLatestCards(), cards)) { // 신규 값이라면 History 업데이트
            updateHistory(getLatestCards())
        }

        setCanUpdateHistory(false) // 값 원상복귀
    }, [canUpdateHistory]);
    useEffect(() => {
        eventManager.addEventListener('focusin', 'RichEditor', (e) => { // // 타겟 포커스 변경시
            if (!isCustomTextAreaElement(e.target as HTMLElement)) return // CustomTextAreaElement 타입이 아니라면
            setCanUpdateHistory(true)
        })
        eventManager.addEventListener('keydown', 'RichEditor', (event) => { // 특정 키 history 업데이트
            const e = event as KeyboardEvent
            if (!isCustomTextAreaElement(e.target as HTMLElement)) return // CustomTextAreaElement 타입이 아니라면
            if (e.key === 'Tab') {
                setCanUpdateHistory(true)
            }
        })
        return () => {
            eventManager.removeEventListener('focusin', 'RichEditor')
            eventManager.removeEventListener('keydown', 'RichEditor')
        }
    }, []);
    //
    const [isEraseMode, setIsEraseMode] = useState<boolean|null>(null) // 텍스트 지우는 모드 진입과 쓰는 모드로 변경되는 타이밍 저장
    const [prevUnicode, setPrevUnicode] = useState<number>(-1) // 한글 같은 조합형 문자의 추가와 삭제를 감지하기 위한 유니코드 저장 조합할 수록 유니코드는 커지며 음수는 없다
    const [currentUnicode, setCurrentUnicode] = useState<number>(-1)

    useLayoutEffect(() => { // 한글 조합 중
        setPrevUnicode(currentUnicode) // 비동기적으로 동작해서 위로 올림
        if (currentUnicode < 0) return // 조합 끝 또는 시작

        if (currentUnicode < prevUnicode) setIsEraseMode(true) // 지우는 모드
        else setIsEraseMode(false) // 쓰는 모드
    }, [currentUnicode]);
    useLayoutEffect(() => { // 텍스트 지우는 모드 True 와 False 로 변경되는 순간을 감지해 History 업데이트
        if (isEraseMode === null) return
        updateHistory(getLatestCards()) // 삭제 모드 진입과 지우는 모드로 전환되는 순간 감지 후 history 업데이트
    }, [isEraseMode]);

    useEffect(() => {
        eventManager.addEventListener('beforeinput', 'RichEditor', (event) => { // 조합형 문자 조합 제외 삭제 모드 input 모드 감지
            const e = event as InputEvent

            if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
                setIsEraseMode(true)
            } else if (e.inputType === 'insertText' || e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
                setIsEraseMode(false)
            } else if (e.isComposing) { // 조합형 문자 입력 중 상태 조합 중 삭제 포함
                if (!e.data) return
                const charCode = e.data.charCodeAt(0) // 빈문자열일 경우 NaN
                if (isNaN(charCode)) setIsEraseMode(true) // 빈 문자열은 삭제 모드
                setCurrentUnicode(isNaN(charCode) ? -1 : charCode)
            }
        })
        eventManager.addEventListener('compositionend', 'RichEditor', () => { // 한 글자 완성시 유니 코드 초기화
            setCurrentUnicode(-1)
            setPrevUnicode(-1)
        })
        return () => {
            eventManager.removeEventListener('beforeinput', 'RichEditor')
            eventManager.removeEventListener('compositionend', 'RichEditor')
        }
    }, []);

    //     eventManager.addEventListener('input', 'RichEditor', (event) => {
    //         const e = event as InputEvent
    //         if (!isCustomTextAreaElement(e.target as HTMLElement)) return // CustomTextAreaElement 타입이 아니라면
    //
    //         const con = {
    //             deleteEvent: e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward',
    //             inputEvent: e.inputType === 'insertText' || e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop'
    //         }
    //
    //         if (con.deleteEvent) { // 삭제
    //             setTargetInnerHTML((e.target as HTMLElement).innerHTML)
    //         } else if (con.inputEvent && isDeleteMode) { // 입력 (선택이 있을 경우는 음..)
    //             setIsDeleteMode(false)
    //             setTargetInnerHTML((e.target as HTMLElement).innerHTML)
    //         } else { // 수정 모드 나중에 추가 예정 당장은 내가 수정 모드를 쓸 일이 없으니깐 패스
    //             ('이벤트:', e.inputType);
    //         }
    //     })
    //     eventManager.addEventListener('selectionchange', 'RichEditor', (e) => { // 선택 영역이 변경된 경우
    //         if(!isCustomTextAreaElement(e.target as HTMLElement)) return
    //         const selection = window.getSelection()
    //         if (selection && !selection.isCollapsed) {
    //             ('선택영역이 있음')
    //         }
    //     })
    //     return () => {
    //         eventManager.removeEventListener('focusin', 'RichEditor')
    //         eventManager.removeEventListener('keydown', 'RichEditor')
    //         eventManager.removeEventListener('selectionchange', 'RichEditor')
    //     }
    // }, [])
    // useEffect(() => {
    //     if (!history || history.length === 0) return
    //     (cursorStage[cursorStage.length - 1])
    // }, [history]);
    // useEffect(() => { // history 변경에 따른 cursor 위치 저장
    //     if (!history || history.length === 0) return
    //     if(isCutHistory) (history.length, historyIndex)
    //     setCursor(pre => {
    //         const copy = isCutHistory?  pre.slice(0, history.length):[...pre] // history 가 잘렸을 경우
    //         copy.push(getLatestCursor())
    //         return copy
    //     })
    // }, [history]);
    // useEffect(() => { // undo & redo 시 커서 위치 설정
    //     const range = document.createRange()
    //     const selection = window.getSelection()
    //     selection?.removeAllRanges()
    //
    //     if (cursor[historyIndex]) {
    //         const {startContainer, startOffset, endContainer, endOffset} = cursor[historyIndex]
    //         range.setStart(startContainer, startOffset)
    //         range.setEnd(endContainer, endOffset)
    //         selection?.addRange(range)
    //     }
    //
    // }, [historyIndex]);


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

    const handleCard = () => ({
        onBlur: () => {
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
                        } else { // 언마운트시 실행된다는데 인 필요
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