import styled from "styled-components";
import {cloneElement, ComponentPropsWithoutRef, ReactElement, ReactNode, Ref, useState} from "react";
import {usePopper} from "react-popper";

// 스타일
const Tooltip = styled.div`
    background: #1a1a1a;
    color: white;
    border-radius: 5px;
    padding: 4px 6px;
    font-size: 14px;
    white-space: pre-wrap; // 아래와 함께 쓰면 좋음
    width: max-content; // 너비가 안의 내용물로 결정되도록 하기(글자 깨짐 방지)
    position: fixed;
    pointer-events: none;
    z-index: 15;
`
const Container = styled.div`
    ${Tooltip} {
        opacity: 0;
    }
    &:has(${Tooltip} + *:hover) ${Tooltip} {
        opacity: 1;
    }
`

export interface TooltipProps {
    ref: Ref<HTMLDivElement>
    props: ComponentPropsWithoutRef<'div'>
}

// 컴포
const TooltipWithComponent = ({Component, summary}: {Component: ReactElement, summary?: ReactNode}) => {
    const [tooltipEl, setTooltipEl] = useState<HTMLDivElement|null>(null)
    const [componentEl, setComponentEl] = useState<HTMLDivElement|null>(null)

    const {styles, attributes} = usePopper(componentEl, tooltipEl,  {
        placement: 'right',
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
                    offset: [25, 8], // [skidding, distance]: skidding은 기준 요소를 따라 좌우 이동, distance는 기준 요소와의 거리
                },
            },
            {
                name: 'flip', // 화면에 맞게 방향 전환
                options: {
                    fallbackPlacements: ['left', 'top', 'bottom'],
                },
            },
        ]
    })

    return (<Container>
        <Tooltip ref={setTooltipEl} style={{...styles.popper}} {...attributes.popper}>
            {summary ?? ''}
        </Tooltip>
        {cloneElement(Component, {ref: setComponentEl})}
    </Container>)
}

export default TooltipWithComponent