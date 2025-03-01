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
import {
    CompositionEvent,
    FormEvent,
    KeyboardEvent as ReactKeyboardEvent,
    MouseEvent,
    useCallback,
    useEffect, useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";
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
import useHistory from "../common/history/useHistory.ts";
import isEqual from "fast-deep-equal";
import useDrop from "../common/dragdrop/useDrop.tsx";
import {isCustomTextAreaElement} from "../common/component/TextArea.tsx";

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

// type Cursor = {
//     startPath: number[]
//     offset: number
// }|null
// history 관련 타입 정의
interface Scroll {
    x: number
    y: number
}
type Data = {
    cards: CardProps[]
    // cursor: Cursor
    scroll: Scroll
} | null

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

    /* ========== History 설정 ========== */
    const selection = useMemo(() => window.getSelection(), [])
    const [data, setData] = useState<Data>(null)
    const [currentData, setCurrentData] = useState<Data>(null)
    // const [scroll, setScroll] = useState<Scroll>({x: 0, y: 0})

    // ------ 최신 데이터 가져오는 함수 ------
    const getLatestCards = useCallback(() => { // 최신 카드 데이터
        if (!cards) return cards
        return (cards.map((card) => ({
            data: cardRefs.current[card.id]?.getData() ?? card.data,
            id: card.id,
            mode: card.mode,
        })))
    }, [cards]);
    const getLatestCursor = useCallback(():Cursor => { // 최신 커서 위치
        if (!selection || selection.rangeCount === 0) return null
        const range = selection.getRangeAt(0)
        const {startContainer, startOffset, endContainer, endOffset} = range

        // cardRefs가 배열일 경우, 각 ref 를 순회하며 커서가 그 요소나 하위에 포함되는지 체크
        const refs = Object.values(cardRefs.current)
        const isInsideCard = refs.some(ref => ref?.contains(startContainer));
        if (!isInsideCard) return null;

        // while (node )


    }, [selection]);
    const getLatestScroll = useCallback((): Scroll => { // 최신 스크롤 위치
        const {scrollX, scrollY} = window
        return {
            x: scrollX,
            y: scrollY
        }
    }, []);
    
    // 매개변수 latestCards, latestCursor 를 받아 사용하는 공통 함수
    const getDataCommonFunc = useCallback((latestCards: CardProps[], isReplaceMode: boolean=false): Data => {
        if (!isReplaceMode && currentData && isEqual(currentData.cards, latestCards)) { // 현 상태 history 와 카드가 같다면 커서와 스크롤은 이전 데이터 사용 즉, 업데이트 X
            return currentData
        }
        // insertCursorMarker()
        return {
            cards: latestCards,
            scroll: getLatestScroll(),
        }
    }, [currentData, getLatestScroll])
    // 모든 최신 데이터 가져오기
    const getLatestData = useCallback((isReplaceMode: boolean=false):Data => getDataCommonFunc(getLatestCards(), isReplaceMode), [getDataCommonFunc, getLatestCards])
    // 카드 업데이트시 데이터 업데이트
    const getUpdateData = useCallback(():Data => getDataCommonFunc(cards), [cards, getDataCommonFunc])

    // ------ 카드 업데이트 ------
    const [isCardUpdate, setIsCardUpdate] = useState(false) // undo|redo 시 중복 업 방지
    const [isDataUpdate, setIsDataUpdate] = useState(false) // undo|redo 시 중복 업 방지
    useEffect(() => { // 카드 변경으로 인한 상태 업데이트
        if (!cards || cards.length === 0) return
        if (isEqual(cards, data?.cards)) return
        if (isDataUpdate) return
        setIsCardUpdate(true)
        setData(getUpdateData())
    }, [cards]);

    // ------ undo|redo 업데이트 ------
    const [isCursorUpdate, setIsCursorUpdate] = useState<boolean>(false)
    useEffect(() => { // undo|redo 상태 업데이트
        if (!data) return;
        if (isCardUpdate) return
        setIsDataUpdate(true)
        setCards(data.cards)

        setIsCursorUpdate(true)
    }, [data])

    // useEffect(() => {
    //     if(isCursorUpdate) {
    //         const startMarker = document.getElementById('cursor-start');
    //         const endMarker = document.getElementById('cursor-end');
    //         if (startMarker && endMarker) {
    //             const range = document.createRange();
    //             range.setStartAfter(startMarker); // startMarker 바로 뒤부터 선택
    //             range.setEndBefore(endMarker);      // endMarker 바로 앞까지 선택
    //
    //             selection?.removeAllRanges();
    //             selection?.addRange(range);
    //         }
    //     }
    //     setIsCursorUpdate(false)
    // }, [isCursorUpdate]);

    const {present, updateHistory, undo, redo} = useHistory<Data>(data, setData, getLatestData)

    // const updateHistoryReplace = useCallback(() => { // 데이터를 교체할 필요성이 있을 때
    //     const latestData = getLatestData(true)
    //     if (latestData && present && isEqual(latestData.cards, present.cards)) {
    //         updateHistory(latestData);
    //     } else {
    //         updateHistory(getLatestData())
    //     }
    // }, [getLatestData, present, updateHistory]);

    useEffect(() => { // 위에서 해당값을 사용하기 위함
        setCurrentData(present)
    }, [present]);
    useEffect(() => { // 설정 초기화 setData 되기 전에 present 먼저 변경되므로 OK
        setIsDataUpdate(false)
        setIsCardUpdate(false)
    }, [present]);

    const [prevUnicode, setPrevUnicode] = useState<number>(-1) // 한글 삭제 감지를 위함
    const [isInValidation, setIsInValidation] = useState<boolean>(false) // beforeInputTrigger 가 되는지 여부를 감지하는 검증 단계로 들어가는 그런 것
    const [isEraseMode, setIsEraseMode] = useState<boolean|null>(null) // 삭제 모드인가용?

    useEffect(() => { // 삭제 모드 또는 글 쓰는 모드로 전환되는 타이밍 저장
        if (isEraseMode === null) return
        updateHistory(getLatestData()) //초기 상태가 아닐 때}
    }, [isEraseMode]);

    // useEffect(() => {
    //     console.log('돌겠당 ㅎㅎ')
    //     if (isRender && isCursorUpdate) {
    //         console.log('되긴하나..?')
    //         const startMarker = document.getElementById('cursor-start');
    //         const endMarker = document.getElementById('cursor-end');
    //         console.log(startMarker)
    //         if (startMarker && endMarker) {
    //             const range = document.createRange();
    //             range.setStartAfter(startMarker); // startMarker 바로 뒤부터 선택
    //             range.setEndBefore(endMarker);      // endMarker 바로 앞까지 선택
    //
    //             selection!.removeAllRanges();
    //             selection!.addRange(range);
    //         }
    //         setIsCursorUpdate(false)
    //     }
    //     setIsRender(false)
    // }, [isRender]);
    useEffect(() => {
        const keydownEvent = (event: Event) => {
            const e = event as KeyboardEvent
            if (e.ctrlKey && e.key.toLowerCase() === 'z' ) {
                e.preventDefault() // 브라우저 기본 뒤로 가기 방지
                undo()
            }
            if (e.ctrlKey && e.key.toLowerCase() === 'y' ) {
                e.preventDefault() // 브라우저 기본 앞으로 가기 방지
                redo()
            }
        }

        document.addEventListener('keydown', keydownEvent)

        return () => {
            document.removeEventListener('keydown', keydownEvent)
        }
    }, [redo, undo]);

    /* ========== 드래그 & 드랍 ========== */
    const [fromIndex, setFromIndex] = useState(-1) // 드래그 할 위치
    const [toIndex, setToIndex] = useState(-1) // 드랍할 위치

    const handleDrop = useDrop({
        dropTarget: cards && cards.length>0? cardRefs.current[cards[fromIndex]?.id]: null,
        onDragStartBefore: (e?: MouseEvent<HTMLElement>) => { // 드래그 전 이미지 복사를 위한 타겟 설정
            const index = parseInt(e?.currentTarget.dataset.targetIndex ?? '0')
            setFromIndex(index)
        },
        onDragOver: (e?: MouseEvent<HTMLElement>) => { // 드래그 시 파란색 바 표시
            let dropIndex = parseInt(e?.currentTarget.dataset.selectIndex ?? '-1')

            if (dropIndex === fromIndex) { // 이동할 위치가 자기 자신 아래라면
                dropIndex = -1
            }
            setToIndex(dropIndex)
        },
        onDragOut: () => { // 파란색 바 제거
            setToIndex(-1)
        },
        onDrop: () => {
            if (toIndex === -1) return // 이동 X
            // const insertIndex = fromIndex <= toIndex ? toIndex : toIndex + 1; // 이동할 위치

            setCards(() => {
                const pre = getLatestCards()
                if (toIndex === -1 || !pre) return pre // 이동 X
                const insertIndex = fromIndex <= toIndex ? toIndex : toIndex + 1; // 이동할 위치

                const copy = [...pre];
                const [target] = copy.splice(fromIndex, 1) // splice: 삭제 요소 리턴
                copy.splice(insertIndex, 0, target); // 시작 위치, 제거할 요소 개수, 추가할 요소들
                return copy;
            });
        },
    })

    /* ========== History 설정 ========== */

    //     })
    //     eventManager.addEventListener('selectionchange', 'RichEditor', (e) => { // 선택 영역이 변경된 경우
    //         if(!isCustomTextAreaElement(e.target as HTMLElement)) return
    //         const selection = window.getSelection()
    //         if (selection && !selection.isCollapsed) {
    //             ('선택영역이 있음')
    //         }
    //     })
    
    /* ========== 이벤트 핸들러 정의 ========== */
    const handleCard = { // history 업데이트를 위한 이벤트 핸들러
        onClick: () => {
            setIsEraseMode(null) // 초기값으로 돌리기
        },
        onKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Tab') {
                e.preventDefault()
                updateHistory(getLatestData())
            }
            if (e.key === 'Backspace' || e.key === 'Delete') { // 조합형 문자가 아닌데 글 지울 때
                setIsEraseMode(true) // 삭제
            }

            // 커서 위치 변경에 영향을 줄 수 있는 키 목록
            const cursorMoveKeys = [
                'ArrowLeft',  // 좌측 방향키
                'ArrowRight', // 우측 방향키
                'ArrowUp',    // 상단 방향키
                'ArrowDown',  // 하단 방향키
                'Home',       // Home 키
                'End',        // End 키
                'PageUp',     // PageUp 키
                'PageDown'    // PageDown 키
            ];

            if (cursorMoveKeys.includes(e.key)) {
                setIsEraseMode(null) // 초기값으로 돌리기
            }
        },
        onBeforeInput: (e: FormEvent<HTMLDivElement>) => { // 검증해봤는데 글 쓰는 중임
            setIsInValidation(false) // 초기화
            const native = e.nativeEvent as InputEvent

            if (native.data && native.data.length > 0) { // 조합형 문자가 아닐 때
                setIsEraseMode(false)  // 쓰는 중임
            }
        },
        onInput: () =>{
            if (isInValidation) { // 글 삭제인 경우. 아 문자 한 개 거슬려..
                setIsEraseMode(true) // 삭제
                setIsInValidation(false) // 초기화
            }
        },
        onCompositionStart: () => { // input 전 이벤트 초성 작성
            setPrevUnicode(-1) // 무조건 -1 일 수 밖에...
        },
        onCompositionUpdate: (e: CompositionEvent<HTMLDivElement>) => { // 화면 랜더링 전이라는 거 같음
            const charCode = e.data.charCodeAt(0)
            const uniCode = isNaN(charCode)? -1: charCode

            setPrevUnicode(uniCode)

            if (uniCode < 0) { // NaN 은 삭제
                setIsEraseMode(true) // 삭제
                return
            }

            if (prevUnicode === uniCode) return;

            if (prevUnicode < uniCode) {
                setIsEraseMode(false) // 쓰는 중
            } else {
                setIsInValidation(true) // 삭제일 수도 아닐 수도 있으므로 검증 모드로 넘어감
            }
        },
        // onChange: () => { // 커서 위치 이동
        //     if (isCursorUpdate && cursor) {
        //         const {startContainer, startOffset, endContainer, endOffset} = cursor
        //         const range = document.createRange()
        //         selection?.removeAllRanges()
        //         range.setStart(startContainer, startOffset)
        //         range.setEnd(endContainer, endOffset)
        //         selection?.addRange(range)
        //     }
        //     setIsCursorUpdate(false)
        // }
    }
    // const handleCardSelector = {
    //     onChange: () => {
    //         console.log('onChange')
    //     }
    // }
    // const setCursorScroll = useCallback(() => {
    //     if(isCursorUpdate) {
    //         const startMarker = document.getElementById('cursor-start');
    //         const endMarker = document.getElementById('cursor-end');
    //         console.log(startMarker)
    //         if (startMarker && endMarker) {
    //             const range = document.createRange();
    //             range.setStartAfter(startMarker); // startMarker 바로 뒤부터 선택
    //             range.setEndBefore(endMarker);      // endMarker 바로 앞까지 선택
    //
    //             selection!.removeAllRanges();
    //             selection!.addRange(range);
    //         }
    //     }
    //     setIsCursorUpdate(false)
    // }, [isCursorUpdate, selection])

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
                    <Card {...handleCard}><CardSelector ref={el => {
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