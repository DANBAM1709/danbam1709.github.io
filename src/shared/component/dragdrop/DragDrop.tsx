import {
    cloneElement, ComponentPropsWithoutRef,
    createContext, CSSProperties,
    MouseEvent,
    ReactElement, ReactNode,
    useContext, useLayoutEffect, useMemo, useRef, useState,
} from "react";
import styled from "styled-components";


export interface DropContextType {
    isDrag: boolean
    GhostImage: (props?: ComponentPropsWithoutRef<'img'>) => ReactElement
    handleDragStart: (e: MouseEvent<HTMLElement>)=>void
    handleDragOver: (e: MouseEvent<HTMLElement>)=>void
    handleDragEnd: (e: MouseEvent<HTMLElement>)=>void
    handleDrop: (e: MouseEvent<HTMLElement>)=>void
    handleWindowEnter: (e: MouseEvent<HTMLElement>)=>void
}

const DropContext =  createContext<DropContextType>({
    isDrag: false,
    GhostImage: () => <></>,
    handleDragStart: () => {},
    handleDragOver: () => {},
    handleDragEnd: () => {},
    handleDrop: () => {},
    handleWindowEnter: () => {},
})

// export type DropProviderProps = Omit<DragContextType, 'ghostSrc'|'setGhostSrc'>

// --------------------- DropProvider ---------------------
export const DropProvider = ({children, ...props}: {children: ReactNode} & DropContextType) => {
    const value = useMemo(() => (props), [props])

    return(<DropContext.Provider value={value} >{children}</DropContext.Provider>)
}

// --------------------- Draggable ---------------------
const DraggableContainer = styled.div`
    user-select: none;
`

export const Draggable = ({children}: {children: ReactElement}) => {
    const {isDrag, handleDragStart} = useContext(DropContext)

    return (<DraggableContainer style={{cursor: isDrag?'default':'grab'}}>{cloneElement(children, {onMouseDown: handleDragStart})}</DraggableContainer>)
}

// --------------------- DropZone ---------------------
const DragOverArea = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 100;
    cursor: move;
    user-select: none;
    
    .ghost-image {
        opacity: 0.6;
        object-fit: contain;
    }
`
export const DropZone = ({children}: {children: ReactElement}) => {
    const {isDrag, GhostImage, handleDragOver, handleDragEnd, handleDrop, handleWindowEnter} = useContext(DropContext)
    const childRef = useRef<HTMLElement>(null)
    const [cloneStyle, setCloneStyle] = useState<CSSProperties>({
        opacity: 0, zIndex: 150, cursor: 'grabbing', ...(children.props.style || {})
    })

    useLayoutEffect(() => { // 마운트 직후
        if (!childRef.current) return

        if (window.getComputedStyle(childRef.current).position === 'static') {
            setCloneStyle(pre => ({
                ...pre,
                position: 'absolute'
            }))
        }
    }, []);

    const onDragOver = useMemo(() => {
        return {
            onMouseEnter: handleWindowEnter,
            onMouseUp: handleDragEnd,
            onMouseMove: handleDragOver,
        }
    }, [handleDragEnd, handleDragOver, handleWindowEnter])

    const onDrop = useMemo(() => {
        return {
            onMouseEnter: handleWindowEnter,
            onMouseUp: (e: MouseEvent<HTMLElement>) => {
                handleDrop(e)
                handleDragEnd(e)
            },
            onMouseMove: handleDragOver
        }
    }, [handleDragEnd, handleDragOver, handleDrop, handleWindowEnter])
    
    return (<>
        {isDrag?
            <>
                <DragOverArea role={'none'} {...onDragOver}> {/* onMouseMove: 고스트 이미지 좌표 계산, onMouseEnter: 화면 밖에서 들어올 때 */}
                    <GhostImage className={'ghost-image'} />
                </DragOverArea>
                {cloneElement(children, {style: cloneStyle, ...onDrop})}
            </>
            : null}
        {cloneElement(children, {ref: childRef})}
    </>)
}

