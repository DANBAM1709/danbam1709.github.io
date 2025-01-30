import styled from "styled-components";
import {ComponentPropsWithoutRef, ReactNode} from "react";

interface DropButtonProps extends ComponentPropsWithoutRef<'div'> {
    children: ReactNode,
}

const OptionsContainer = styled.div.attrs({ tabIndex: 0 })` // tabIndex: 0 -> focus ok
    display: flex;
    flex-direction: column;
    position: absolute;
    background: white;
    top: 4px;
    opacity: 1;
    gap: 1px;
    padding: 4px 0;
    max-height: 70vh;
    box-shadow: rgba(15, 15, 15, 0.05) 0 0 0 1px, rgba(15, 15, 15, 0.1) 0 3px 6px, rgba(15, 15, 15, 0.2) 0 9px 24px;
    border-radius: 10px;
    
    & > div:not([class]) { // className 없는 div
        white-space: nowrap;
        padding: 0 14px;
        margin: 6px 0 4px;
        color: rgba(55, 53, 47, 0.65);
    }
`
const DropButtonContainer = styled.div`
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
    align-content: center;
    
    &:hover {
        background: rgba(55, 53, 47, 0.06);
    }
    
    svg {
        width: 10px;
        height: 100%;
        display: block;
        fill: rgba(55, 53, 47, 0.35);
        margin-left: 4px;
    }
`

const OptionContainer = styled.div`
    user-select: none; // 드래그 불가
    cursor: pointer;
    transition: background 20ms ease-in;
    margin: 0 4px;
    border-radius: 6px;
    padding: 4px 12px 4px 10px;
    box-sizing: border-box;
    gap: 10px;
    white-space: nowrap;
    
    &:hover {
        background: rgba(55, 53, 47, 0.06);
    }
`

export const Select = ({...rest}: ComponentPropsWithoutRef<'div'>) => {
    return (<div {...rest} />)
}

export const Options = ({...rest}: ComponentPropsWithoutRef<'div'>) => {
    return (<div style={{position: 'relative'}}><OptionsContainer {...rest} /></div>)
}

export const DropButton = ({children, ...rest}: DropButtonProps) => {
    return (<DropButtonContainer {...rest}>{children}
        <svg role="graphics-symbol" viewBox="0 0 30 30">
            <polygon points="15,17.4 4.8,7 2,9.8 15,23 28,9.8 25.2,7 "></polygon>
        </svg>
    </DropButtonContainer>)
}

export const Option = ({...rest}: ComponentPropsWithoutRef<'div'>) => {
    return (<OptionContainer {...rest} />)
}