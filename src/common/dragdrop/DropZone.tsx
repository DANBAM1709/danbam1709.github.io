import styled from "styled-components";
import {ComponentPropsWithoutRef, ReactElement, useContext} from "react";
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

const WindowArea = styled.div`
    position: fixed;
    z-index: 9997;
    user-select: none;
    cursor: move;
    pointer-events: auto !important;
    top: 0; left: 0; right: 0; bottom: 0;
`
const DropZone = ({children, ...rest}: {children: ReactElement} & ComponentPropsWithoutRef<'div'>) => {
    const {isDrag, GhostImage, handleWindowEvent, handleDropEvent} = useContext(DropContext)

    return (<>
        {isDrag? <>
                <WindowArea {...handleWindowEvent} />
                <DropArea {...handleDropEvent} {...rest}>{children}</DropArea>
                <GhostImage className={'ghost-image'} />
            </>
            : children}
    </>)
}

export default DropZone