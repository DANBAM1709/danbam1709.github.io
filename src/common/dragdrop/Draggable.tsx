import styled from "styled-components";
import {cloneElement, ReactElement, useContext} from "react";
import DropContext from "./DropContext.tsx";

const Container = styled.div`
    user-select: none;
`

const Draggable = ({children}: {children: ReactElement}) => {
    const {isDrag, handleDragStart} = useContext(DropContext)

    return (<Container style={{cursor: isDrag?'default':'grab'}}>{cloneElement(children, {onMouseDown: handleDragStart})}</Container>)
}

export default Draggable
