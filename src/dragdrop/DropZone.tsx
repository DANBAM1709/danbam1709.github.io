import styled from "styled-components";
import {ComponentPropsWithoutRef, MouseEvent, ReactElement, useContext, useMemo} from "react";
import DropContext from "./DropContext.tsx";

const DropArea = styled.div`
    user-select: none;
    display: contents;
    cursor: grabbing;
    
    * {
        cursor: grabbing !important;
    }
    > * {
        position: relative;
        z-index: 9998 !important;
    }
`

const DragOverArea = styled.div`
    position: fixed;
    z-index: 9997;
    user-select: none;
    cursor: move;
    pointer-events: auto !important;
    top: 0; left: 0; right: 0; bottom: 0;
`
const DropZone = ({children, ...rest}: {children: ReactElement} & ComponentPropsWithoutRef<'div'>) => {
    const {isDrag, GhostImage, handleDragOver, handlerDragOut, handleDragEnd, handleDrop, handleWindowEnter} = useContext(DropContext)

    const onDragOver = useMemo(() => {
        return {
            onMouseEnter: handleWindowEnter,
            onMouseUp: handleDragEnd,
            onMouseMove: handlerDragOut,
        }
    }, [handleDragEnd, handleWindowEnter, handlerDragOut])

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
        {isDrag? <>
                <DragOverArea {...onDragOver}></DragOverArea>
                <DropArea {...onDrop} {...rest}>{children}</DropArea>
                <GhostImage className={'ghost-image'} />
            </>
            : children}
    </>)
}

export default DropZone