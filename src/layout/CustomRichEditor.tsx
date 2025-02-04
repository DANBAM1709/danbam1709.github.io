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
import TooltipWrapper from "../shared/component/TooltipWrapper.tsx";
import SoftBtn from "../shared/component/SoftBtn.tsx";
import CustomTextArea from "../editor/CustomTextArea.tsx";
import html2canvas from "html2canvas";

// ---------------------------- ActionTool ----------------------------
const ActionToolContainer = styled.div`
    position: relative;
    line-height: var(--line-height);
    
    .action-group {
        display: flex;
        align-items: center;
        position: absolute;
        right: var(--content-width);
        height: calc(1em * var(--line-height));
        gap: 2px;
        padding-right: 10px;
        padding-left: 10px
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
    
    .ghost-img {
        position: fixed;
        top: -500px;
        width: 300px;
        object-fit: contain;
    }
    .dragover-area {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 15;
        //cursor: grabbing !important;
        background: yellow;
    }
    .drop-area {
        position: fixed;
        top: var(--header-height);
        left: var(--sidebar-width);
        right: 0; bottom: 0;
        pointer-events: auto;
        background: #747bff;
        cursor: grabbing;
    }
    
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
const ActionToolWrapper = ({children}: {children: ReactElement}) => {
    const contentRef = useRef<HTMLDivElement>(null) // 텍스트 영역
    const [ghostUrl, setGhostUrl] = useState<string>('')
    const [isDrag, setIsDrag] = useState<boolean>(false)

    // const getUrl = async () => { // 고스트 이미지를 위한 태그 캡쳐
    //     const canvas = await html2canvas(contentRef.current!, {scale: 1})
    //     return canvas.toDataURL()
    // }

    const onDragStart = () => {
        setIsDrag(true)
    }

    const onDragOver = (e: MouseEvent<HTMLDivElement>) => {
        console.log(e.clientY)
    }

    const onDrop = (e:MouseEvent<HTMLDivElement>) => {
        console.log('onDrop', e.clientY)
    }


    // const [isDrag, setIsDrag] = useState<boolean>(false)
    // const [moveTargetRef, textAreaRef, copiedTextAreaRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLImageElement>(null)]
    // const [dataUrl, setDataUrl] = useState<string>('')
    // const [markers, setMarkers] = useState<number[]>([]) // index=0: title bottom 을 경계선으로 함
    // const [moveIndex, setMoveIndex] = useState<number>(-1) // 이동시킬 위치
    //
    //
    // const getUrl = async () => { // 고스트 이미지를 위한 태그 캡쳐
    //     const canvas = await html2canvas(textAreaRef.current!, {scale: 1})
    //     return canvas.toDataURL()
    // }
    //
    //
    // const onMouseDown = () => { // 비동기 타이밍 문제 해결을 위함
    //     // useEffect 에서는 부적절 위치와 이미지는 텍스트 수정에 따라 변하므로
    //     getUrl().then(url => {
    //         setDataUrl(url)
    //     })
    //     const parent = editZoneRef.current
    //     const childrenArr = Array.from(parent.children)
    //     const bottoms = childrenArr.map(textArea => textArea.getBoundingClientRect().bottom)
    //     setMarkers(bottoms)
    // }
    //
    // // 드래그 마우스 및 고스트 이미지 설정
    // const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    //     // e.dataTransfer.effectAllowed = 'copy'; // 허용되는 효과 지정, 마우스
    //     // e.dataTransfer.dropEffect = 'move'
    //     e.dataTransfer.setDragImage(copiedTextAreaRef.current!, 0, 0) // 드래그시 뜨는 모양
    //     setIsDrag(true)
    // }
    //
    // // 드래그 영역이 위로 올라와 뜨는 금지 마우스 방지용
    // const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    //     e.preventDefault()
    //     document.querySelectorAll<HTMLDivElement>('.action-btn-group').forEach((item: HTMLDivElement) => item.classList.add('hide'))
    // }
    //
    // // 이동될 위치 조정 및 가시화를 위함
    // const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    //     e.preventDefault()
    //
    //     const threshold = e.clientY
    //     const filteredMarkers = markers.filter(marker => marker > threshold)
    //
    //     let i = markers.length // 선택 인덱스
    //     if (filteredMarkers.length > 0) { // 가장 끝
    //         const closest = Math.min(...filteredMarkers)
    //         i = markers.findIndex(marker => marker === closest) + 1
    //     }
    //     if (i !== moveIndex) {
    //         setMoveIndex(i)
    //     }
    // }
    //
    // // 드래그 시작 영역 다시 보일 수 있게 설정
    // const onDragEnd = () => {
    //     setIsDrag(false)
    //     document.querySelectorAll<HTMLDivElement>('.action-btn-group').forEach((item: HTMLDivElement) => item.classList.remove('hide'))
    // }
    //
    // // 위치 이동 확정
    // const onDrop = (e: DragEvent<HTMLDivElement>) => {
    //     e.preventDefault()
    //     const parent = editZoneRef.current
    //     parent.insertBefore(moveTargetRef.current!, parent.children[moveIndex])
    // }

    return (<ActionToolContainer>
        {isDrag?
            <div role={'none'} className={'dragover-area'} onMouseUp={()=>setIsDrag(false)} onMouseLeave={()=>setIsDrag(false)}> {/* onDragEnd == onMouseUp, 화면 밖 == onMouseLeave */}
                <div role={'none'} className={'drop-area'} onMouseMove={onDragOver} onMouseUp={onDrop} /> {/* onDrop == onMouseUp */}
            </div>:null}
        <img className={'ghost-img'} src={ghostUrl} alt={'ghost-img'} />
        <div className={'action-group'}>
            <TooltipWrapper>
                <SoftBtn className={'plus-btn'}>
                    <img src={`plus.svg`} alt={'plus.svg'} width={'16px'} height={'16px'} />
                </SoftBtn>
            </TooltipWrapper>
            <TooltipWrapper summary={'드래그해서 옮기기'} >
                <SoftBtn className={'grab-btn'}  onMouseDown={onDragStart}>
                    <img src={'grab.svg'} alt={'grab.svg'} width={'14px'} height={'14px'} />
                </SoftBtn>
            </TooltipWrapper>
        </div>

        {/*<img className={'copied-textarea'} src={dataUrl} alt={'copied-textarea'} ref={copiedTextAreaRef} />*/}
        {/*{isDrag? <div role={'none'} className={'grab-area'} onDragOver={onDragOver} onDrop={onDrop} style={{cursor: 'grabbing'}} />: null}*/}
        {/*<div role={'none'} className={'action-btn-group'} onDragEnter={onDragEnter}>*/}
        {/*    /!* + *!/*/}
        {/*    <TooltipWrapper summary={'클릭해서 아래에 추가\n위에 블록을 추가하려면 alt+클릭'}>*/}
        {/*        <SoftBtn className={'plus-btn'}>*/}
        {/*            <img src={`plus.svg`} alt={'plus.svg'} width={'16px'} height={'16px'} />*/}
        {/*        </SoftBtn>*/}
        {/*    </TooltipWrapper>*/}
        {/*    <div className={'gab'}></div>*/}
        {/*    /!* grab *!/*/}
        {/*    <TooltipWrapper summary={'드래그해서 옮기기'}>*/}
        {/*        <SoftBtn draggable={true} onDragStart={onDragStart} onDragEnd={onDragEnd} onMouseDown={onMouseDown} className={'grab-btn'}>*/}
        {/*            <img src={'grab.svg'} alt={'grab.svg'} width={'14px'} height={'14px'} />*/}
        {/*        </SoftBtn>*/}
        {/*    </TooltipWrapper>*/}
        {/*</div>*/}
        {/*{cloneElement(children, {ref: textAreaRef})}*/}
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
        display: inline-block;
        font-size: 32px;
        margin-bottom: 8px;
    }
`

const CustomRichEditor = () => {
    const selection = useMemo(() => window.getSelection(), [])
    const [toolbarPos, setToolbarPos] = useState({x: 0, y: 0}) // 툴바 위치 조정
    const [isSelected, setIsSelected] = useState<boolean>(false) // 선택 영역 O|X
    const isFocusedRef = useRef<boolean>(false) // useState는 addEventListener 등록시 값 변경 안됨
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
    }, []);

    const toolbarStyle = useMemo(() => {
        return {
            left: `${toolbarPos.x}px`,
            top: `${toolbarPos.y}px`,
        }
    }, [toolbarPos])

    return (
        <CustomRichEditorContainer>
            {isSelected? <TextFormattingToolbar style={toolbarStyle} />:null}
            <div className={'edit-contents'}>
                <CustomTextArea className={'title'} data-placeholder={'제목'} />
                {contents.map(m => <ActionToolWrapper key={m.id} >{cloneElement(m.content, {onFocus:()=>isFocusedRef.current=true, onBlur:()=>isFocusedRef.current=false})}</ActionToolWrapper>)}
            </div>
        </CustomRichEditorContainer>
    )
}

export default CustomRichEditor