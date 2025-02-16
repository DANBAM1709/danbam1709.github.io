import {ComponentPropsWithoutRef, useContext, useEffect, useState} from "react";
import SelectContext from "./SelectContext.ts";
import styled from "styled-components";
import {usePopper} from "react-popper";
import {Placement} from "@popperjs/core";

const Container = styled.div.attrs({tabIndex: 0})`
    // 기능
    pointer-events: none;
    position: absolute;
    z-index: -1;
    opacity: 0;
    
    &:focus-within {
        z-index: 15;
        opacity: 1;
        pointer-events: auto;
    }
    
    // 기본 스타일
    display: flex;
    flex-direction: column;
    background: white;
    gap: 1px;
    padding: 4px 0;
    max-height: 70vh;
    box-shadow: rgba(15, 15, 15, 0.05) 0 0 0 1px, rgba(15, 15, 15, 0.1) 0 3px 6px, rgba(15, 15, 15, 0.2) 0 9px 24px;
    border-radius: 10px;
    top: 20px;
`

interface Props extends ComponentPropsWithoutRef<'div'> {
    direction?: string
    offset?: number
}

// <Options direction='right' offset=10><Option /></Options>
const Options = ({direction, offset, ...props}: Props) => {
    const {open, setOpen, buttonEl} = useContext(SelectContext)
    const [target, setTarget] = useState<HTMLElement|null>(null)

    const {styles, attributes} = usePopper(buttonEl, target,  {
        placement: direction as Placement ?? 'right',
        modifiers: [
            {
                name: 'preventOverflow',
                options: {
                    boundary: document.documentElement,
                },
            },
            {
                name: 'offset',
                options: {
                    offset: [0, offset ?? 10], // [skidding, distance]: skidding은 기준 요소를 따라 좌우 이동, distance는 기준 요소와의 거리
                },
            },
            {
                name: 'flip', // 화면에 맞게 방향 전환
                options: {
                    fallbackPlacements: (['right', 'left', 'top', 'bottom'] as Placement[]).filter(
                        item => item !== ((direction as Placement) ?? 'right') // 선택 방향 제외 순서대로
                    ),
                },
            },
        ]
    })

    useEffect(() => {
        if (open) {
            target?.focus()
        } else {
            target?.blur()
        }
    }, [open, target]);

    return (<Container ref={setTarget} onBlur={()=>setOpen(false)} style={{...styles.popper}} {...attributes.popper} {...props} />)
}

export default Options