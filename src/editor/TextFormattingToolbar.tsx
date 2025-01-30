import styled from "styled-components";
import {StyledComponent, dynamicStyles} from "../shared/mixins/dynamicStyle.ts";

// 3 개 중 하나의 형태를 만족해야 한다
type StyleDict =
    | { color: string }
    | { size: string }
    | { fontWeight: string };

const Container = styled.div<StyledComponent>`
    position: fixed;
    background: white;
    border-radius: 0.2rem;
    box-shadow: rgba(0, 0, 0, 0.07) 0 16px 24px 0, rgba(0, 0, 0, 0.1) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 0 1px 0;
    
    /* 동적 스타일 */
    ${dynamicStyles}
`

const onClick = (style: StyleDict) => {
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)

    const cloneContents = range?.cloneContents()
    const spans = cloneContents?.querySelectorAll('span')

    const key = Object.keys(style)[0] as keyof StyleDict // 키 타입 보장함

    Array.from(spans ?? []).reverse().forEach(span => {
        if (span.style[key]) {
            const parent = span.parentNode

            while (span.firstChild) {
                parent?.insertBefore(span.firstChild, span)
            }

            parent?.removeChild(span)
        }
    })

    const span = document.createElement('span')
    span.style[key] = style[key]
    span.appendChild(cloneContents ?? document.createTextNode(range?.toString() ?? ''))
    //
    range?.deleteContents()
    range?.insertNode(span)
}

export const TextFormattingToolbar = (props: StyledComponent) => {
    return (
        <Container $customStyles={props.$customStyles}>
            <button onClick={()=>onClick({color: "blue"})}>색은 파란색으로</button>
            <button onClick={()=>onClick({color: "yellow"})}>색을 노란색으로</button>
            <button onClick={()=>onClick({fontWeight: "bold"})}>글자 weight를 결정합시다</button>
        </Container>
    )
}