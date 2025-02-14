import styled from "styled-components";
import Button from "../base/Button.tsx";
import TextArea from "./TextArea.tsx";

const CardDivider = styled.div`
    background: #90CAF9;
    width: 100%;
    height: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
`
const DraggableCard = styled.div.attrs({ tabIndex: 0 })`
    width: fit-content;
    height: fit-content;
    display: flex;
`
const Card = styled.div.attrs({ tabIndex: 0 })`
    background: white;
    width: 100%;
    height: fit-content;
`
const ActionTool = styled.div`
    display: flex;
    height: calc(1em * var(--line-height));
    align-items: center;
    vertical-align: middle;
`
const DragButton = styled(Button)`
    border-radius: 0.125em;
    transition: background 20ms ease-in;
    fill: rgba(55, 53, 47, 0.35);
    height: 24px;
    
    &:hover {
        background: rgba(55, 53, 47, 0.06);
    }
`
const PlusButton = styled(Button)`
    border-radius: 50%;
    border: 1px solid #3399ff;
    opacity: 0.5;
    fill: #3399ff;
    box-sizing: border-box;
    transition: opacity 20ms ease-in;
    padding: 0.05em;
    
    & > * {
        transition: width 20ms ease-in, height 20ms ease-in;
    }

    &:hover {
        opacity: 1;
    }
    &:hover > * {
        width: 13px;
        height: 13px;
    }
`

const Title = styled(TextArea)`
    font-size: 32px;
`

export {DraggableCard, CardDivider, Card, ActionTool, DragButton, PlusButton, Title}