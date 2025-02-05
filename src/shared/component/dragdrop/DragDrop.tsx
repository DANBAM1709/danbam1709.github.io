import {
    cloneElement,
    createContext,
    Dispatch,
    MouseEvent,
    ReactElement,
    SetStateAction,
    useContext, useMemo, useState,
} from "react";
import styled from "styled-components";


export interface DragContextType {
    isDrag: boolean
    setIsDrag: Dispatch<SetStateAction<boolean>>
    handleDragStart: (e?: MouseEvent<HTMLElement>)=>void
    handleDragOver: (e?: MouseEvent<HTMLElement>)=>void
    handleDrop: (e?: MouseEvent<HTMLElement>)=>void
}

const DragContext =  createContext<DragContextType>({
    isDrag: false,
    setIsDrag: () => {},
    handleDragStart: () => {},
    handleDragOver: () => {},
    handleDrop: () => {}
})

// --------------------- DragProvider ---------------------
export const DragProvider = ({children, ...handler}: {children: ReactElement} & DragContextType) => {
    return(<DragContext.Provider value={handler} >{children}</DragContext.Provider>)
}

// --------------------- Draggable ---------------------
const DraggableContainer = styled.div`
    user-select: none;
`

export const Draggable = ({children}: {children: ReactElement}) => {
    const {isDrag, handleDragStart} = useContext(DragContext)

    return (<DraggableContainer style={{cursor: isDrag?'default':'grab'}}>{cloneElement(children, {onMouseDown: handleDragStart})}</DraggableContainer>)
}

// --------------------- DropZone ---------------------
const DragOverArea = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 100;
    background: yellow;
    cursor: move;
    user-select: none;
`
export const DropZone = ({children}: {children: ReactElement}) => {
    const {isDrag, setIsDrag, handleDragOver, handleDrop} = useContext(DragContext)
    const [ghostPos, setGhostPos] = useState<{x: number, y: number}>({x: 0, y: 0})
    const ghostStyle = useMemo(() => {
        return {
            position: 'fixed',
            top: ghostPos.y,
            left: ghostPos.x,
            transform: 'scale(0.6)',
            transformOrigin: 'top left', // 축소 기준 위치
            background: 'green',
            pointEvents: 'none',
            zIndex: 110,
        }
    }, [ghostPos])

    const onDragEnd = () => {
        setIsDrag(false)
    }
    const setGhostPosition = (e: MouseEvent<HTMLElement>) => {
        setGhostPos({x: e.clientX+5, y: e.clientY+5})
    }
    const onMouseEnter = (e: MouseEvent<HTMLElement>) => {
        if (isDrag && e.buttons === 0) { // 좌측 클릭 상태
            setIsDrag(false)
            return
        }
        setGhostPos({x: e.clientX+5, y: e.clientY+5})
    }

    return (<>
        {isDrag?
            <DragOverArea role={'none'} onMouseEnter={onMouseEnter} onMouseUp={onDragEnd} onMouseMove={setGhostPosition}> {/* onMouseMove: 고스트 이미지 좌표 계산, onMouseEnter: 화면 밖에서 들어올 때 */}
                {cloneElement(children, {style: ghostStyle})}
                {cloneElement(children, {style: {cursor: 'grabbing'}, onMouseMove: handleDragOver, onMouseUp: handleDrop})}
            </DragOverArea>:
            children}
    </>)
}

