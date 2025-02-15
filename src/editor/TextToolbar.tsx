import styled from "styled-components";
import {ComponentPropsWithoutRef, CSSProperties, useEffect, useState} from "react";
import {useSelection} from "../global/hook.ts";
import {eventManager} from "../global/event.ts";

// 3 개 중 하나의 형태를 만족해야 한다
const keys = ['color', 'size', 'fontWeight'] as const

type StyleDict =
    | { color: string }
    | { size: string }
    | { fontWeight: string };

const Container = styled.div`
    position: fixed;
    background: white;
    border-radius: 0.2rem;
    z-index: 10;
    box-shadow: rgba(0, 0, 0, 0.07) 0 16px 24px 0, rgba(0, 0, 0, 0.1) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 0 1px 0;
    
`

// const updateStyle = (style: StyleDict, range: Range, cloneContents: DocumentFragment) => {
//     const spans = cloneContents?.querySelectorAll('span')
//
//     const key = Object.keys(style)[0] as keyof StyleDict // 키 타입 보장함
//
//     Array.from(spans ?? []).forEach(span => {
//         if (span.style[key]) {
//             const parent = span.parentNode
//
//             while (span.firstChild) {
//                 parent?.insertBefore(span.firstChild, span)
//             }
//
//             parent?.removeChild(span)
//         }
//     })
//
//     const span = document.createElement('span')
//     span.style[key] = style[key]
//     span.appendChild(cloneContents ?? document.createTextNode(range?.toString() ?? ''))
//
//     range?.deleteContents()
//     range?.insertNode(span)
// }

const onClick = (style: StyleDict) => {
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)

    const selectedText = range?.toString() ?? ''
    const cloneContents = range?.cloneContents()

    // 예시 color: 'blue' -> .color-blue
    const key = Object.keys(style)[0] as keyof StyleDict // 키 타입 보장함
    const value = style[key]

    // 예시 color: []
    const styleDict: {[key: string]: [[number, number]]} = {}

    const spans = cloneContents?.querySelectorAll('span')
    spans?.forEach(span => {
        const spanText = span.textContent ?? ''
        const startIndex = selectedText.indexOf(spanText) ?? 0
        const endIndex = startIndex ? startIndex + spanText.length : 0

        // 기존 span CSS 속성키
        const cssKey = span.className.split('-')[0]

        if (!styleDict[cssKey]) {
            styleDict[cssKey] = [[startIndex, endIndex]]
        } else {
            styleDict[cssKey].push([startIndex, endIndex])
        }


        // if (key === span.className.split('-')[0])
        console.log(`${key}-${value}`, span.className.split('-')[0], startIndex, endIndex)

    })

    // const spans = cloneContents?.querySelectorAll('span')
    // console.log(text)


    // const divs = cloneContents?.querySelectorAll('div')
    // console.log(cloneContents)
    // if (divs) {}

    // if (!range || !cloneContents) return
    // const divs = cloneContents?.querySelectorAll('div')
    // console.log(divs)
    // console.log('으잉')
    //
    // if(!divs || divs.length === 0) {
    //     const spans = cloneContents?.querySelectorAll('span')
    //     console.log(spans)
    //     updateStyle(style, range, cloneContents)
    // } else {
    //     Array.from(divs).forEach(div => {
    //         console.log(div)
    //         // updateStyle(style, range, div)
    //     })
    // }



    // const spans = cloneContents?.querySelectorAll('span')
    //
    // const key = Object.keys(style)[0] as keyof StyleDict // 키 타입 보장함
    //
    // Array.from(spans ?? []).forEach(span => {
    //     if (span.style[key]) {
    //         const parent = span.parentNode
    //
    //         while (span.firstChild) {
    //             parent?.insertBefore(span.firstChild, span)
    //         }
    //
    //         parent?.removeChild(span)
    //     }
    // })
    //
    // const span = document.createElement('span')
    // span.style[key] = style[key]
    // span.appendChild(cloneContents ?? document.createTextNode(range?.toString() ?? ''))
    //
    // range?.deleteContents()
    // range?.insertNode(span)
}

const TextToolbar = ({...rest}: ComponentPropsWithoutRef<'div'> ) => {
    const selection = useSelection()
    const [isSelected, setIsSelected] = useState<number>(0)
    const [style, setStyle] = useState<CSSProperties>({left: 0, top: 0, display: 'none'}) // 툴바 위치 조정

    useEffect(() => {
        if (!selection) return
        const handleSelectionChange = () => {
            if (selection.isCollapsed) { // 선택 영역이 없을 경우
                setIsSelected(0)
                return
            }
            setIsSelected(pre => pre + 1) // 선택 영역이 있을 경우
        }

        eventManager.addEventListener('selectionchange', 'TextToolbar', handleSelectionChange)
        eventManager.addEventListener('scroll', 'TextToolbar', handleSelectionChange)

        return () => {
            eventManager.removeEventListener('selectionchange', 'TextToolbar')
            eventManager.removeEventListener('scroll', 'TextToolbar')
        }
    }, [selection]);

    useEffect(() => {
        if (!selection) return

        if (!isSelected) { // 선택되지 않았다면
            setStyle({display: 'none'})
            return
        }

        const range = selection.getRangeAt(0)
        const rect = range.getClientRects()

        const firstNode = rect[0]
        const lastNode = rect[rect.length-1]

        const topSpace = 40 // 선택 영역보다 올릴 위치 임시 위치
        let [x, y] = [firstNode.left, firstNode.top-topSpace]

        if (firstNode.top < topSpace && lastNode.bottom > 0) { // 선택 영역이 안보이는 위치부터 보이는 위치까지 있는 경우
            [x, y] = [0, 0]
        }
        setStyle({left: x, top: y, display: 'block'})
    }, [isSelected, selection]);

    return (
        <>
            {!isSelected? null:
                <Container style={style} {...rest}>
                    <button onClick={()=>onClick({color: "blue"})}>색은 파란색으로</button>
                    <button onClick={()=>onClick({color: "yellow"})}>색을 노란색으로</button>
                    <button onClick={()=>onClick({fontWeight: "bold"})}>글자 weight를 결정합시다</button>
                </Container>
            }
        </>
    )
}

export default TextToolbar