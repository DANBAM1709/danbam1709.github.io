import styled from "styled-components";
import {ComponentPropsWithoutRef, ReactNode} from "react";

const Container = styled.div`
    display: flex;
    align-items: center;
    padding: 6px 14px 6px 10px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-color: rgba(277, 266, 224, 0.5);
    box-sizing: border-box;
    width: fit-content;
    &:hover {
        background-color: rgba(0, 0, 0, 0.06);
    }
    & > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 4px;
    }
    svg, img {
        width: 16px; 
        height: 100%; 
        display: block; 
        fill: rgba(55, 53, 47, 0.85); 
        flex-shrink: 0; 
        margin: 0 2px;
    }
    .label {
        font-size: 14px;
        line-height: 20px; 
        color: rgb(55, 53, 47); 
        white-space: nowrap; 
        overflow: hidden; 
        text-overflow: ellipsis;
    }
`

interface Props extends ComponentPropsWithoutRef<'div'> {
    icon: ReactNode,
    label?: string
}

const ItemButton = ({icon, label, ...rest}: Props) => { // ...rest: 기본 html 속성만 전달
    return (<Container {...rest}>
        <div>
            {icon}
            {label? <div className={'label'}>{label}</div>: null}
        </div>
    </Container>)
}

export default ItemButton