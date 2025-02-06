import styled from "styled-components";
import {
    useEffect,
    useMemo,
    useRef,
    useState, ReactElement, cloneElement, CSSProperties, KeyboardEvent
} from "react";
import {TextFormattingToolbar} from "../editor/TextFormattingToolbar.tsx";
import {eventManager} from "../utils/event.ts";
import CustomTextArea from "../editor/CustomTextArea.tsx";
import ActionToolWrapper from "../editor/ActionToolWrapper.tsx";

const Container = styled.div`
    display: flex;
    margin: 0 auto;
    flex-direction: column;
    width: var(--content-width);
    padding-top: calc(var(--header-height) + 80px);
    
    .title {
        font-size: 32px;
        margin-bottom: 8px;
    }
`

const CustomRichEditor = () => {
    const selection = useMemo(() => window.getSelection(), [])
    const [toolbarStyle, setToolbarStyle] = useState<CSSProperties>({left: 0, top: 0, display: 'none'}) // 툴바 위치 조정
    const isFocusedRef = useRef<boolean>(false) // useState는 addEventListener 등록시 값 변경 안됨
    const [contents, setContents] = useState<{id: string, content: ReactElement}[]>([])

    useEffect(() => {
        setContents([ // 테스트 데이터
            { id: 'test1', content: <CustomTextArea>순서가 <span className={'color-blue'}>3이 될</span> 것이오</CustomTextArea>},
            { id: 'test2', content: <CustomTextArea>순서가 1이 될것이오</CustomTextArea>},
            { id: 'test3', content: <CustomTextArea>지금은 순서가 2가 될것이오</CustomTextArea>},
            { id: 'test4', content: <CustomTextArea />},
        ])

        const handleSelectionChange = () => { // 선택 영역에 따라 툴바 위치 조정
            if(!isFocusedRef.current) return
            if (!selection || selection.isCollapsed) { // 선택 영역이 없을 경우
                setToolbarStyle({display: 'none'})
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
            setToolbarStyle({left: x, top: y, display: 'block'})
        }

        eventManager.addEventListener('selectionchange', 'CustomRichEditor', handleSelectionChange)
        eventManager.addEventListener('scroll', 'CustomRichEditor', handleSelectionChange)

        return () => {
            eventManager.removeEventListener('selectionchange', 'CustomRichEditor')
            eventManager.removeEventListener('scroll', 'CustomRichEditor')
        }
    }, [selection]);

    const handleEditor = { // CustomTextArea 이벤트
        onFocus: () => isFocusedRef.current=true,
        onBlur: () => isFocusedRef.current=false,
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
            const con = { // 조건 모음
                empty: !e.currentTarget.firstChild, // 내용이 없다면
                delete: e.key === 'Backspace'  && e.currentTarget.innerHTML === '<br>', // 블록 삭제
                up: e.key === 'ArrowUp', // 블록 이동 위로
                down: e.key === 'ArrowDown', // 블록 이동 아래로
            }

            // 첫 줄 텍스트 노드 방지
            if (con.empty) {
                const range = selection!.getRangeAt(0)
                const div = document.createElement('div')
                div.textContent = '\u200B'
                e.currentTarget.appendChild(div)
                range.selectNodeContents(div.firstChild!)
                range.collapse(false) // 마지막 위치로 이동
                return
            }

            // <- backspace && empty
            if (con.delete) {
                e.currentTarget.innerHTML = '<div></div>' // 텍스트 블록 삭제
            }

            // 방향키 Up
            if (con.up) {
                const range = selection!.getRangeAt(0)

                const rangeTop = range.getBoundingClientRect().top
                const top = e.currentTarget.getBoundingClientRect().top

                const condition1 = rangeTop === 0 && !range.startContainer.previousSibling
                const condition2 = rangeTop !== 0 && (rangeTop - top) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    console.log(rangeTop, top)
                }
            }

            // 방향키 Down
            if (con.down) {
                const range = selection!.getRangeAt(0)

                const rangeBottom = range.getBoundingClientRect().bottom
                const bottom = e.currentTarget.getBoundingClientRect().bottom

                const condition1 = rangeBottom === 0 && !range.endContainer.nextSibling // 마지막 줄이면서 내용물 없을 때 Br 태그를 가리키며 rangeBottom=0 이 되므로
                const condition2 = (bottom - rangeBottom) < 5 // 커서와 끝의 오차 임의값 5

                if (condition1 || condition2) {
                    console.log('아래로')
                }
            }
        },
    }

    return (
        <Container>
            <CustomTextArea className={'title'} data-placeholder={'제목'} />
            {contents.map(m =>
                <ActionToolWrapper key={m.id} >
                    <>
                        {cloneElement(m.content, handleEditor)}
                        <div></div>
                    </>
                </ActionToolWrapper>
            )}
            <TextFormattingToolbar style={toolbarStyle} />
        </Container>
    )
}

export default CustomRichEditor