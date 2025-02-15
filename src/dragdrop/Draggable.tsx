import styled from "styled-components";
import {ComponentPropsWithoutRef, ReactElement, useContext} from "react";
import DropContext from "./DropContext.tsx";

const Container = styled.div`
    display: contents;
`

const Draggable = ({children, ...rest}: {children: ReactElement} & ComponentPropsWithoutRef<'div'>) => {
    const {handleDragStartEvent} = useContext(DropContext)

    return (<Container {...handleDragStartEvent} {...rest}>{children}</Container>)
}

export default Draggable
