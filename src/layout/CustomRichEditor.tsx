import styled from "styled-components";
import {
    MouseEvent,
    useEffect,
    useMemo,
    useRef,
    useState, ReactElement, cloneElement, MutableRefObject
} from "react";
import {TextFormattingToolbar} from "../editor/TextFormattingToolbar.tsx";
import {eventManager} from "../shared/utils/event.ts";
import CustomTextArea from "../editor/CustomTextArea.tsx";
import {Draggable, DropProvider, DropZone} from "../shared/component/dragdrop/DragDrop.tsx";
import useDrop from "../shared/component/dragdrop/useDrop.tsx";
import TooltipWrapper from "../shared/component/ui/TooltipWrapper.tsx";
import SoftBtn from "../shared/component/ui/SoftBtn.tsx";

// ---------------------------- ActionTool ----------------------------
const ActionToolContainer = styled.div`
    position: relative;
    line-height: var(--line-height);
    margin-bottom: 2px;
    
    .action-wrapper {
        position: absolute;
        right: var(--content-width);
        height: 100%;
    }
    .action-group {
        display: flex;
        align-items: center;
        height: calc(1em * var(--line-height));
        gap: 2px;
        padding-right: 10px;
        padding-left: 10px;
    }
    .plus-btn {
        width: 24px;
        height: 24px;
        padding: 0;
        margin-right: 2px;
    }    
    .grab-btn {
        cursor: grab;
        fill: rgba(55, 53, 47, 0.35);
        width: 18px;
        height: 24px;
        padding: 0;
    }
    .drop-area {
        position: fixed;
        top: var(--header-height);
        left: var(--sidebar-width);
        right: 0; bottom: 0;
        z-index: -1;
    }
    .position {
        height: 2px;
    }
    
    //.ghost-img {
    //    position: fixed;
    //    top: -500px;
    //    width: 300px;
    //    object-fit: contain;
    //}
    //.dragover-area {
    //    position: fixed;
    //    top: 0; left: 0; right: 0; bottom: 0;
    //    z-index: 15;
    //    //cursor: grabbing !important;
    //    background: yellow;
    //}
    //.drop-area {
    //    position: fixed;
    //    top: var(--header-height);
    //    left: var(--sidebar-width);
    //    right: 0; bottom: 0;
    //    pointer-events: auto;
    //    background: #747bff;
    //    cursor: grabbing;
    //}
    
    //
    //.action-btn-group {
    //    display: flex;
    //    align-items: center;
    //    opacity: 0;
    //    position: absolute;
    //    left: -55px;
    //    z-index: 10;
    //}
    //&:hover .action-btn-group {
    //    opacity: 1;
    //}    
    //.grab-area {
    //    position: fixed;
    //    top: var(--header-height);
    //    left: var(--sidebar-width);
    //    right: 0;
    //    bottom: 0;
    //    z-index: 5;
    //    cursor: grabbing !important;
    //}
    //.plus-btn {
    //    width: 24px;
    //    height: 24px;
    //    padding: 0;
    //    margin-right: 2px;
    //}    
    //.grab-btn {
    //    cursor: grab;
    //    fill: rgba(55, 53, 47, 0.35);
    //    width: 18px;
    //    height: 24px;
    //    padding: 0;
    //}
    //.grab-btn:active {
    //    cursor: grabbing;
    //}
    //.hide {
    //    display: none;
    //}
    //.copied-textarea {
    //    position: fixed;
    //    top: -300px;
    //    width: 300px;
    //    object-fit: contain;
    //}
    
`
    // , editZoneRef: MutableRefObject<HTMLDivElement>
const ActionToolWrapper = ({children, parentRef}: {children: ReactElement, parentRef: MutableRefObject<HTMLDivElement|null>}) => {
    const [contentRef, moveRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)] // 텍스트 영역, 이동할 영역
    const [markers, setMarkers] = useState<number[]>([]) // index=0: title bottom 을 경계선으로 함
    const [moveIndex, setMoveIndex] = useState<number>(-1) // 이동할 위치

    useEffect(() => { // 위치 이동 표시
        console.log(moveIndex)
        document.querySelectorAll('.position').forEach((el, index) => {
            if (moveIndex-1 === index) {
                el.classList.add('selected')
            } else {
                el.classList.remove('selected')
            }
        })
    }, [moveIndex]);

    const handler = useDrop({
        dropTarget: contentRef,
        onDragStart: () => {
            const parent = parentRef.current
            if (!parent) return
            const childrenArr = Array.from(parent.children)
            const bottoms = childrenArr.map(content => content.getBoundingClientRect().bottom)
            setMarkers(bottoms)
        },
        onDragOver: (e?: MouseEvent<HTMLElement>) => {
            const threshold = e!.clientY
            const filteredMarkers = markers.filter(marker => marker > threshold)

            let i = markers.length // 선택 인덱스
            if (filteredMarkers.length > 0) { // 가장 끝
                const closest = Math.min(...filteredMarkers)
                i = markers.findIndex(marker => marker === closest) + 1
            }
            if (i !== moveIndex) {
                setMoveIndex(i)
            }
        },
        onDragOut: () => {
            setMoveIndex(-1)
        },
        onDrop: () => {
            const parent = parentRef.current
            if (!parent) return
            setMoveIndex(-1)
            parent.insertBefore(moveRef.current!, parent.children[moveIndex])
        }
    })

    return (<ActionToolContainer ref={moveRef}>
        <div className={'position'} />
        <div className={'action-wrapper'}>
            <DropProvider useDrop={handler}>
                <div className={'action-group'}>
                    <DropZone>
                        <div className={'drop-area'} />
                    </DropZone>
                    <TooltipWrapper>
                        <SoftBtn className={'plus-btn'}>
                            <img src={`plus.svg`} alt={'plus.svg'} width={'16px'} height={'16px'} />
                        </SoftBtn>
                    </TooltipWrapper>
                    <Draggable>
                        <TooltipWrapper summary={'드래그해서 옮기기'} >
                            <SoftBtn className={'grab-btn'}>
                                <img src={'grab.svg'} alt={'grab.svg'} width={'14px'} height={'14px'} />
                            </SoftBtn>
                        </TooltipWrapper>
                    </Draggable>
                </div>
            </DropProvider>
        </div>
        {cloneElement(children, {ref: contentRef})}
    </ActionToolContainer>)
}

// ---------------------------- CustomRichEditor ----------------------------
const CustomRichEditorContainer = styled.div`
    display: flex;
    justify-content: center;
    padding-top: calc(var(--header-height) + 80px);
    .edit-contents {
        width: var(--content-width);
    }
    .title {
        font-size: 32px;
        margin-bottom: 8px;
    }
`

const CustomRichEditor = () => {
    const selection = useMemo(() => window.getSelection(), [])
    const [toolbarPos, setToolbarPos] = useState({x: 0, y: 0}) // 툴바 위치 조정
    const [isSelected, setIsSelected] = useState<boolean>(false) // 선택 영역 O|X
    const isFocusedRef = useRef<boolean>(false) // useState는 addEventListener 등록시 값 변경 안됨
    const contentsRef = useRef<HTMLDivElement|null>(null)
    const [contents, setContents] = useState<{id: string, content: ReactElement}[]>([])

    useEffect(() => {
        setContents([ // 테스트 데이터
            { id: 'test1', content: <CustomTextArea>순서가 3이 될 것이오</CustomTextArea>},
            { id: 'test2', content: <CustomTextArea>순서가 1이 될것이오</CustomTextArea>},
            { id: 'test3', content: <CustomTextArea>지금은 순서가 2가 될것이오</CustomTextArea>},
        ])

        const handleSelectionChange = () => { // 선택 영역에 따라 툴바 위치 조정
            if(!isFocusedRef.current) return
            if (!selection || selection.isCollapsed) { // 선택 영역이 없을 경우
                setIsSelected(false)
                return
            }

            const range = selection.getRangeAt(0)
            const rect = range.getClientRects()

            const firstNode = rect[0]
            const lastNode = rect[rect.length-1]

            const topSpace = 40 // 선택 영역보다 올릴 위치 임시 위치
            let [x, y] = [firstNode.left, firstNode.top-topSpace]

            if (firstNode.top < topSpace && lastNode.bottom > 0) { // 선택 영역이 안보이는 위치부터 보이는 위치까지 있는 경우
                [x, y] = [0, 0]
            }
            setToolbarPos({x, y})
            setIsSelected(true)
        }

        eventManager.addEventListener('selectionchange', 'CustomRichEditor', handleSelectionChange)
        eventManager.addEventListener('scroll', 'CustomRichEditor', handleSelectionChange)

        return () => {
            eventManager.removeEventListener('selectionchange', 'CustomRichEditor')
            eventManager.removeEventListener('scroll', 'CustomRichEditor')
        }
    }, [selection]);

    const toolbarStyle = useMemo(() => {
        return {
            left: `${toolbarPos.x}px`,
            top: `${toolbarPos.y}px`,
        }
    }, [toolbarPos])

    return (
        <CustomRichEditorContainer>
            {isSelected? <TextFormattingToolbar style={toolbarStyle} />:null}
            <div className={'edit-contents'} ref={contentsRef}>
                <CustomTextArea className={'title'} data-placeholder={'제목'} />
                {contents.map(m => <ActionToolWrapper parentRef={contentsRef} key={m.id} >{cloneElement(m.content, {onFocus:()=>isFocusedRef.current=true, onBlur:()=>isFocusedRef.current=false})}</ActionToolWrapper>)}
            </div>
        </CustomRichEditorContainer>
    )
}

export default CustomRichEditor