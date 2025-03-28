import styled from "styled-components";
import {ReactElement, useState} from "react";
import {usePopper} from "react-popper";
import parse from "html-react-parser";

// 스타일
const Tooltip = styled.div`
    position: fixed;
    background: #1a1a1a;
    color: white;
    border-radius: 5px;
    padding: 4px 6px;
    font-size: 14px;
    white-space: pre-wrap; // 아래와 함께 쓰면 좋음
    width: max-content; // 너비가 안의 내용물로 결정되도록 하기(글자 깨짐 방지)
    pointer-events: none;
`

const Container = styled.div`
    ${Tooltip} {
        z-index: -1;
        opacity: 0;
    }
    &:has(${Tooltip} + *:hover) ${Tooltip} {
        z-index: 15;
        opacity: 1;
    }
`

// 컴포
const TooltipWithComponent = ({Component, summary}: {Component: ReactElement, summary?: string}) => {
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
            {parse(summary ?? '')}
        </Tooltip>
        <div ref={setComponentEl}>{Component}</div>
    </Container>)
}

export default TooltipWithComponent