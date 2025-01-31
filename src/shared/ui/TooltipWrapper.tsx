import {ComponentPropsWithoutRef, ElementType, ReactNode, useState} from "react";
import styled from "styled-components";

const Container = styled.div`
    position: relative;
`

const Tooltip = styled.div`
    background: #1a1a1a;
    width: fit-content;
    color: white;
    border-radius: 5px;
    padding: 4px 6px;
    font-size: 14px;
    
    position: absolute;
    top: calc(100% + 4px);
    transform: translateX(-50%);
`

export interface TooltipProps {
    html?: string
    summary: string
    detail?: string
}

interface Props extends ComponentPropsWithoutRef<'div'> {
    Component: ElementType
    children?: ReactNode
    tooltip: TooltipProps
}

const TooltipWrapper = ({Component, children, tooltip, ...rest}: Props) => {
    const [show, setShow] = useState(false)

    return (
        <Container>
            <Component onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} {...rest}>{children}</Component>
            {show && <Tooltip>
                {tooltip.html}
                <div className={'summary'}>{tooltip.summary}</div>
                <div className={'detail'}>{tooltip.detail}</div>
            </Tooltip>}
        </Container>
    )
}

export default TooltipWrapper