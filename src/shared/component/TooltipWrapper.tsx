import {
    cloneElement,
    ComponentPropsWithoutRef,
    PropsWithChildren, ReactElement,
    useEffect,
    useRef,
    useState
} from "react";
import styled from "styled-components";
import {usePopper} from "react-popper";

const Container = styled.div`
    user-select: none;
    position: relative;
    display: flex;
    justify-content: center;
    width: fit-content;
`

const Tooltip = styled.div`
    background: #1a1a1a;
    color: white;
    border-radius: 5px;
    padding: 4px 6px;
    font-size: 14px;
    white-space: pre-wrap; // 아래와 함께 쓰면 좋음
    width: max-content; // 너비가 안의 내용물로 결정되도록 하기(글자 깨짐 방지)
    
    position: absolute;
    opacity: 0;
    z-index: -10;
`

interface Props extends PropsWithChildren<ComponentPropsWithoutRef<'div'>> {
    children: ReactElement
    html?: string // 툴팁에 들어갈 이미지 등
    summary?: string // 툴팁에 들어갈 간단한 설명
    detail?: string // 툴팁에 들어갈 구체적인 설명
}

const TooltipWrapper = ({children, html, summary, detail, ...rest}: Props) => {
    const [show, setShow] = useState(false)
    const componentRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const target = tooltipRef.current
        if (!target) return
        if (show) {
            target.style.opacity = '1'
            target.style.zIndex = '10'
        } else {
            target.style.opacity = '0'
            target.style.zIndex = '-10'
        }
    }, [show]);

    const {styles, attributes} = usePopper(componentRef.current, tooltipRef.current,  {
        placement: 'bottom',
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
                    offset: [0, 8], // [skidding, distance]: skidding은 기준 요소를 따라 좌우 이동, distance는 기준 요소와의 거리
                },
            },
            {
                name: 'flip', // 화면에 맞게 방향 전환
                options: {
                    fallbackPlacements: ['top', 'right', 'left'],
                },
            },
        ]
    })

    const Component = cloneElement(children, {
        onMouseEnter: () => setShow(true),
        onMouseLeave: () => setShow(false),
        ref: componentRef,
        ...rest
    })

    return (
        <Container>
            {Component}
            <Tooltip ref={tooltipRef} style={styles.popper} {...attributes.popper}>
                {html}
                <div className={'summary'}>{summary}</div>
                <div className={'detail'}>{detail}</div>
            </Tooltip>
        </Container>
    )
}

export default TooltipWrapper