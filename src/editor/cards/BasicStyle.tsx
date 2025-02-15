import styled from "styled-components";
import TextArea from "../../common/TextArea.tsx";
import {forwardRef, KeyboardEvent, useMemo, useState} from "react";
import TextToolbar from "../TextToolbar.tsx";

const Container = styled.div`
`

const BasicStyle = forwardRef<HTMLDivElement, {children: string}>(({children}, ref) => {
    const selection = useMemo(() => window.getSelection(), [])
    const [isToolActive, setIsToolActive] = useState<boolean>(false)

    const handleTextArea = {
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            const con = { // 조건 모음
                empty: !e.currentTarget.firstChild, // 내용이 없다면
                delete: e.key === 'Backspace' && e.currentTarget.innerHTML === '<br>', // 블록 삭제
                up: e.key === 'ArrowUp', // 블록 이동 위로
                down: e.key === 'ArrowDown', // 블록 이동 아래로
            }

            // 첫 줄 텍스트 노드 방지 안되고 있는 듯?
            if (con.empty) {
                // console.log(e.currentTarget.firstChild)
                // const range = selection!.getRangeAt(0)
                // const div = document.createElement('div')
                // div.textContent = '\u200B'
                // e.currentTarget.appendChild(div)
                // range.selectNodeContents(div.firstChild!)
                // range.collapse(false) // 마지막 위치로 이동
            }

            // <- backspace && empty
            if (con.delete) {
                console.log('삭제')
                // e.currentTarget.innerHTML = '<div></div>' // 텍스트 블록 삭제
            }

            // 방향키 Up
            if (con.up) {
                if (!selection) { // empty
                    console.log('위로')
                    return
                }
                const range = selection.getRangeAt(0)

                const rangeTop = range.getBoundingClientRect().top
                const top = e.currentTarget.getBoundingClientRect().top

                const prev = range.startContainer.previousSibling

                const empty = !prev || (e.currentTarget === range.startContainer)
                const condition1 = rangeTop === 0 && empty;
                const condition2 = rangeTop !== 0 && (rangeTop - top) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    console.log('위로')
                }
            }

            // 방향키 Down
            if (con.down) {
                if (!selection) { // empty
                    console.log('아래로')
                    return
                }
                const range = selection.getRangeAt(0)

                const rangeBottom = range.getBoundingClientRect().bottom
                const bottom = e.currentTarget.getBoundingClientRect().bottom

                const condition1 = rangeBottom === 0 && !range.endContainer.nextSibling // 마지막 줄이면서 내용물 없을 때 Br 태그를 가리키며 rangeBottom=0 이 되므로
                const condition2 = (bottom - rangeBottom) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    console.log('아래로')
                }
            }

        },
        onFocus: () => setIsToolActive(true),
        onBlur: () => setIsToolActive(false),
    }

    return (<Container>
        <TextArea ref={ref} {...handleTextArea}>{children ?? ''}</TextArea>
        {isToolActive? <TextToolbar />:null}
    </Container>)
})

export default BasicStyle