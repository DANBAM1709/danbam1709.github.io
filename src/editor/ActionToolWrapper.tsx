import {ReactElement} from "react";
import TooltipWrapper from "../common/ui/TooltipWrapper.tsx";
import SoftBtn from "../common/ui/SoftBtn.tsx";
import styled from "styled-components";

const Container = styled.div`
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
    //.grab-btn {
    //    cursor: grab;
    //    fill: rgba(55, 53, 47, 0.35);
    //    width: 18px;
    //    height: 24px;
    //    padding: 0;
    //}
    //.drop-area {
    //    position: fixed;
    //    top: var(--header-height);
    //    left: var(--sidebar-width);
    //    right: 0; bottom: 0;
    //    z-index: -1;
    //}
    //.position {
    //    height: 2px;
    //}
`

const ActionToolWrapper = ({children}: {children: ReactElement}) => {
    return (<Container>
        <div className={'action-wrapper'}>
            <div className={'action-group'}>
                <TooltipWrapper>
                    <SoftBtn className={'plus-btn'}>
                    <img src={`plus.svg`} alt={'plus.svg'} width={'16px'} height={'16px'} />
                    </SoftBtn>
                </TooltipWrapper>
            </div>
        </div>
        {children}
        {/*{cloneElement(children, {ref: contentRef})}*/}
    </Container>)
}

// const ActionToolWrapper = ({children, parentRef}: {children: ReactElement, parentRef: MutableRefObject<HTMLDivElement|null>}) => {
//     const [contentRef, moveRef] = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)] // 텍스트 영역, 이동할 영역
//     const [markers, setMarkers] = useState<number[]>([]) // index=0: title bottom 을 경계선으로 함
//     const [moveIndex, setMoveIndex] = useState<number>(-1) // 이동할 위치
//     // const [childrenArr]
//
//     useEffect(() => { // 위치 이동 표시
//         // console.log(moveIndex)
//         if (!moveRef.current) return
//         // 현재 이동 관련 내용은 아래에 dragstart 함수에 정의되어 있음 추후 수정 예정
//         // const parent = moveRef.current.parentElement
//         // const childrenArr = Array.from(parent!.children)
//
//         document.querySelectorAll('.position').forEach((el, index) => {
//             if (moveIndex-1 === index) {
//                 el.classList.add('selected')
//             } else {
//                 el.classList.remove('selected')
//             }
//         })
//     }, [moveIndex]);
//
//     const handler = useDrop({
//         dropTarget: contentRef,
//         onDragStart: () => {
//             const parent = parentRef.current
//             if (!parent) return
//             const childrenArr = Array.from(parent.children)
//             const bottoms = childrenArr.map(content => content.getBoundingClientRect().bottom)
//             setMarkers(bottoms)
//         },
//         onDragOver: (e?: MouseEvent<HTMLElement>) => {
//             const threshold = e!.clientY
//             const filteredMarkers = markers.filter(marker => marker > threshold)
//
//             let i = markers.length // 선택 인덱스
//             if (filteredMarkers.length > 0) { // 가장 끝
//                 const closest = Math.min(...filteredMarkers)
//                 i = markers.findIndex(marker => marker === closest) + 1
//             }
//             if (i !== moveIndex) {
//                 setMoveIndex(i)
//             }
//         },
//         onDragOut: () => {
//             setMoveIndex(-1)
//         },
//         onDrop: () => {
//             const parent = parentRef.current
//             if (!parent) return
//             setMoveIndex(-1)
//             parent.insertBefore(moveRef.current!, parent.children[moveIndex])
//         }
//     })
//
//     return (<Container ref={moveRef}>
//         <div className={'position'} />
//         <div className={'action-wrapper'}>
//             <div className={'action-group'}>
//                 <TooltipWrapper>
//                     <SoftBtn className={'plus-btn'}>
//                         <img src={`plus.svg`} alt={'plus.svg'} width={'16px'} height={'16px'} />
//                     </SoftBtn>
//                 </TooltipWrapper>
//             </div>
//             {/*<DropProvider useDrop={handler}>*/}
//             {/*    <div className={'action-group'}>*/}
//             {/*        <DropZone>*/}
//             {/*            <div className={'drop-area'} />*/}
//             {/*        </DropZone>*/}
//             {/*        <TooltipWrapper>*/}
//             {/*            <SoftBtn className={'plus-btn'}>*/}
//             {/*                <img src={`plus.svg`} alt={'plus.svg'} width={'16px'} height={'16px'} />*/}
//             {/*            </SoftBtn>*/}
//             {/*        </TooltipWrapper>*/}
//             {/*        <Draggable>*/}
//             {/*            <TooltipWrapper summary={'드래그해서 옮기기'} >*/}
//             {/*                <SoftBtn className={'grab-btn'}>*/}
//             {/*                    <img src={'grab.svg'} alt={'grab.svg'} width={'14px'} height={'14px'} />*/}
//             {/*                </SoftBtn>*/}
//             {/*            </TooltipWrapper>*/}
//             {/*        </Draggable>*/}
//             {/*    </div>*/}
//             {/*</DropProvider>*/}
//         </div>
//         {cloneElement(children, {ref: contentRef})}
//     </Container>)
// }
//
export default ActionToolWrapper