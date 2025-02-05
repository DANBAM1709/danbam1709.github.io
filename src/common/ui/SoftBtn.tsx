import styled from "styled-components";
import {ComponentPropsWithoutRef, forwardRef} from "react";

const Container = styled.div`
    user-select: none; // 드래그 불가
    display: flex;
    font-size: 14px;
    cursor: pointer;
    color: rgb(50, 48, 44);
    padding: 0 7px 0 6px;
    border-radius: 6px;
    white-space: nowrap;
    width: fit-content;
    height: 28px;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
    transition: background 20ms ease-in;
    
    &:hover {
        background: rgba(55, 53, 47, 0.06);
    }
`

const SoftBtn = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(({...rest}, ref) => {
    return (<Container ref={ref} {...rest} />)
})

export default SoftBtn