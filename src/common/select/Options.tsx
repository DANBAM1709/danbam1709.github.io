import {ComponentPropsWithoutRef, useContext, useEffect, useRef} from "react";
import SelectContext from "./SelectContext.ts";
import styled from "styled-components";

const Container = styled.div.attrs({ tabIndex: 0 })` // tabIndex: 0 -> focus ok    
    display: flex;
    flex-direction: column;
    background: white;
    position: absolute;
    top: 4px;
    opacity: 0;
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
    &:focus {
        outline: none;
    }
`

const Options = ({...rest}: ComponentPropsWithoutRef<'div'>) => {
    const {open, setOpen} = useContext(SelectContext)
    const target = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!target.current) return
        if (open) {
            target.current.focus()
            target.current.style.opacity = '1'
            target.current.style.zIndex = '10'
        } else {
            target.current.style.opacity = '0'
            target.current.style.zIndex = '-10'
        }
    }, [open]);

    return (<div style={{position: 'relative'}}>
        <Container ref={target} onBlur={()=>setOpen(false)} {...rest} />
    </div>)
}

export default Options