import styled from "styled-components";
import {ComponentPropsWithoutRef, MouseEvent, useContext} from "react";
import SelectContext from "./SelectContext.ts";

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

const Option = ({onClick, ...props}: ComponentPropsWithoutRef<'div'>) => {
    const {setOpen} = useContext(SelectContext)

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        setOpen(false)
        if (onClick) onClick(e) // 상위 컴포넌트에서 정의한 onClick
    }

    return (<OptionContainer onClick={handleClick} {...props} />)
}

export default Option