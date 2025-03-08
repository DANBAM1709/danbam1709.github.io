import Section from "../../base-style/Section.tsx";
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
    RichEditorContainer,
    TopDropZone
} from "./RichEditor.ui.ts";
import {useCallback, useContext} from "react";
import Draggable from "../../dragdrop/Draggable.tsx";
import SelectProvider from "../../select-option/SelectProvider.tsx";
import Options from "../../select-option/Options.tsx";
import Comment from '../../assets/svg/comment.svg?react'
import ColorPicker from '../../assets/svg/color-picker.svg?react'
import Copy from '../../assets/svg/copy.svg?react'
import Plus from '../../assets/svg/plus.svg?react'
import Grab from '../../assets/svg/grab.svg?react'
import Swap from '../../assets/svg/swap.svg?react'
import ContentStoreContext from "./context/ContentStoreContext.ts";
import ContentSelector, {ContentProps} from "./ContentSelector.tsx";
import DragDropProvider from "../../dragdrop/DragDropProvider.tsx";
import TooltipWithComponent from "../../component/TooltipWithComponent.tsx";
import DropZone from "../../dragdrop/DropZone.tsx";
import useContentDragDrop from "./hook/useContentDragDrop.ts";
import ContentHistoryContext from "./context/ContentHistoryContext.ts";

//
// const RichEditor = () => {

//     const {editorDragBtn, editorPlusBtn} = useTooltip()
//     // const {state: {isTooltip}} = useRichEditorContext()
//
//     // ------ 드래그 & 드랍 ------
//     const {handleDrop, fromIndex, toIndex} = useCardDragDrop(cards, cardRefs.current, updateHistoryWithLatestData)
//
//     // ---------- history 이벤트 핸들러 ----------
//     useEffect(() => setCurrentRecord(current), [current]); // 위에서 current 데이터 사용하기 위함
//
//     const [isFirstUndo, setIsFirstUndo] = useState(true)
//     const [isUndoRecorded, setIsUndoRecorded] = useState(false) // undo 시 history 업뎃을 했는가
//
//     useLayoutEffect(() => {
//         setIsUndoRecorded(false)
//         if (isUndoRecorded) undo()
//     }, [isUndoRecorded]);
//
//     // 일정 시간동안 사용할 수 없도록 막기 속도 조절 repeat 너무 빨라서 역으로 부자연스러움
//     const throttledUndo = throttle(() => undo(), 50, {trailing: false})
//     const throttledRedo = throttle(() => redo(), 50 , {trailing: false})
//
//     useEffect(() => {
//         eventManager.addEventListener('keydown', 'RichEditor', (event: Event) => {
//             const e = event as KeyboardEvent
//             if (e.ctrlKey && e.key.toLowerCase() === 'z' ) {
//                 e.preventDefault() // 브라우저 기본 뒤로 가기 방지
//                 setIsFirstUndo(false)
//                 let isEqualData = true // 데이터가 같은지 확인
//                 let latestData = null
//
//                 if (isFirstUndo) { // 첫번째 undo 라면 데이터 검증
//                     latestData = getLatestData()
//                     isEqualData = isEqual(latestData, current)
//                 }
//                 if (!isEqualData) { // 데이터가 같지 않다면
//                     updateHistory(latestData) // 데이터 업로드
//                     setIsUndoRecorded(true) // 인덱스가 변할 때까지 기다릴 필요가 있어서
//                     return;
//                 }
//
//                 if (e.repeat) throttledUndo() // 누르고 잇는 상태
//                 else undo()
//
//             } else {
//                 setIsFirstUndo(true)
//             }
//             if (e.ctrlKey && e.key.toLowerCase() === 'y' ) {
//                 e.preventDefault() // 브라우저 기본 앞으로 가기 방지
//                 if (e.repeat) throttledRedo() // 누르고 있는 상태
//                 else redo()
//             }
//         })
//
//         return () => eventManager.removeEventListener('keydown', 'RichEditor')
//     }, [undo, redo, throttledUndo, throttledRedo, isFirstUndo, getLatestData, updateHistory, current]);
//
//     // 커서 위치 저장을 위한 Element 객체 담기
//     const [selectedIndex, setSelectedIndex] = useState<number|null>(null)
//     useCardSelect(cards, selectedIndex, cardRefs.current)
//
//     const handleCard = (index: number) => ({
//         onFocus: (e: FocusEvent<HTMLDivElement>) => {
//             setCurrentEditElement(e.currentTarget as HTMLElement) // 고정된 타겟을 쓰지 않으면 history 중복 검사 기능이 무의미해짐
//             setSelectedIndex(index)
//         },
//         onBlur: () => {
//             setCurrentEditElement(null)
//             setSelectedIndex(null)
//             console.log('onBlur')
//         },
//     })
//     const handleAddCard = (index: number) => ({
//         onClick: () => {
//             // const addIndex = index + 1
//         }
//     })
//
//     const handleDeleteCard = (index: number) => ({
//         onClick: () => {
//             // onDeleteCard(index)
//         }
//     })
//
//     return (<RichEditorProvider><DragDropProvider useDrop={handleDrop}><Container>
//         {cards.map((card, index) => {
//             return (<Section key={card.id} data-lastblock={cards.length === index+1? 'true': undefined}>
//                 <DraggableCard className={index===0? 'editor-title':''}>
//                     {/* 제목이면 드래그 버튼 제외 */}
//                     {index !== 0? <ActionTool>
//                         <Draggable data-target-index={index}><SelectProvider>
//                                 {/* DragBtn = SelectBtn */}
//                                 <TooltipWithComponent Component={<DragButton><Grab /></DragButton>} summary={editorDragBtn} />
//                                 <Options>
//                                     {/* DragOption = Option */}
//                                     <DragOption><Comment />댓글</DragOption>
//                                     <DragOption {...handleDeleteCard(index)}><Trash />삭제</DragOption>
//                                     <DragOption><Copy />복제</DragOption>
//                                     <DragOption><Swap />전환</DragOption>
//                                     <SelectProvider>
//                                         <DragButton><ColorPicker />색 진심 뭐지</DragButton>
//                                         <Options>
//                                             호엥
//                                         </Options>
//                                     </SelectProvider>
//                                 </Options>
//                         </SelectProvider></Draggable>
//                     </ActionTool>: null}
//                     {/* 카드 선택 */}
//                     <Card {...handleCard(index)}><GhostContainer  {...handleHistory}><CardSelector ref={el => {
//                         if (el) {
//                             cardRefs.current[card.id] = el
//                         } else { // 언마운트시 실행된다는데 인 필요
//                             delete cardRefs.current[card.id]
//                         }
//                     }} mode={card.mode} data={card.data}
//                     /></GhostContainer></Card>
//                 </DraggableCard>
//                 {/* 카드 나누는 기준 + 카드 추가 */}
//                 <CardDivider>
//                     {toIndex === index? <CardDividerLine/>: null}
//                     <TooltipWithComponent Component={<PlusButton {...handleAddCard(index)}><Plus /></PlusButton>} summary={editorPlusBtn} />
//                 </CardDivider>
//                 {/* 드롭 영역 상|하 (드래그 상태!==-1 && 현재 드롭할 곳이 아님 === -1) */}
//                 <DropZone data-select-index={index-1}><TopDropZone className={(fromIndex !== -1) && (toIndex === -1)? 'not-allowed':''} /></DropZone>
//                 <DropZone data-select-index={index}><BottomDropZone className={(fromIndex !== -1)  && (toIndex === -1)? 'not-allowed':''} /></DropZone>
//             </Section>)
//         })}
//         {isTooltip? <TextToolbar />:null}
//     </Container></DragDropProvider></RichEditorProvider>)
// }
//
// export default RichEditor


const RichEditor = () => {
    const {contents, contentRefs} = useContext(ContentStoreContext)
    const {updateHistory} = useContext(ContentHistoryContext)

    const updateHistoryWithLatestData = useCallback((updateContents: ContentProps[]) =>{
        updateHistory({contents: updateContents, contentUpdate: true})
    }, [updateHistory])

    const {handleDrop, fromIndex, toIndex} = useContentDragDrop(contents, contentRefs.current, updateHistoryWithLatestData)

    return (<DragDropProvider useDrop={handleDrop}><RichEditorContainer>
        {contents.map((content, index) => {
            return (<Section key={content.id} data-lastblock={contents.length === index+1? 'true': undefined}>
                <DraggableCard className={index===0? 'editor-title':''}>
                    {/* 제목이면 드래그 버튼 제외 */}
                    {index !== 0? <ActionTool>
                        <Draggable data-target-index={index}><SelectProvider>
                                {/* DragBtn = SelectBtn */}
                                <TooltipWithComponent Component={<DragButton><Grab /></DragButton>} />
                                <Options>
                                    {/* DragOption = Option */}
                                    <DragOption><Comment />댓글</DragOption>
                                    {/*<DragOption {...handleDeleteCard(index)}><Trash />삭제</DragOption>*/}
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
                    {/* Content 선택 */}
                    <Card><ContentSelector ref={el => {
                        if (el) {
                            contentRefs.current[content.id] = el
                        } else { // 언마운트시 실행된다는데 인 필요
                            delete contentRefs.current[content.id]
                        }
                    }} mode={content.mode} data={content.data}
                    /></Card>
                </DraggableCard>
                {/*/!* 카드 나누는 기준 + 카드 추가 *!/*/}
                <CardDivider>
                    {toIndex === index? <CardDividerLine/>: null}
                    <TooltipWithComponent Component={<PlusButton><Plus /></PlusButton>} />
                </CardDivider>
                {/* 드롭 영역 상|하 (드래그 상태!==-1 && 현재 드롭할 곳이 아님 === -1) */}
                <DropZone data-select-index={index-1}><TopDropZone className={(fromIndex !== -1) && (toIndex === -1)? 'not-allowed':''} /></DropZone>
                <DropZone data-select-index={index}><BottomDropZone className={(fromIndex !== -1)  && (toIndex === -1)? 'not-allowed':''} /></DropZone>
            </Section>)
        })}
        {/*{isTooltip? <TextToolbar />:null}*/}
    </RichEditorContainer></DragDropProvider>)
}

export default RichEditor