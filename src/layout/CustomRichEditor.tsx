import styled from "styled-components";
import {
    useEffect,
    useMemo,
    useRef,
    useState, ReactElement, cloneElement, CSSProperties
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
            { id: 'test1', content: <CustomTextArea>순서가 3이 될 것이오</CustomTextArea>},
            { id: 'test2', content: <CustomTextArea>순서가 1이 될것이오</CustomTextArea>},
            { id: 'test3', content: <CustomTextArea>지금은 순서가 2가 될것이오</CustomTextArea>},
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

    return (
        <Container>
            <CustomTextArea className={'title'} data-placeholder={'제목'} />
            {contents.map(m => <ActionToolWrapper key={m.id} >{cloneElement(m.content, {onFocus:()=>isFocusedRef.current=true, onBlur:()=>isFocusedRef.current=false})}</ActionToolWrapper>)}
            <TextFormattingToolbar style={toolbarStyle} />
        </Container>
    )
}

export default CustomRichEditor