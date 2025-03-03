import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {eventManager} from "../../global/event.ts";
import {debounce} from "lodash";

interface  SearchOffsetState {
    pos: number;
    index: number;
    previousPos: number
}
interface SearchNodesState {
    node: Node|null;
    offset: number;
    index: number;
    previousLength: number;
}

// return getCursorOffsets(currentEditable: HTMLElement), moveCursor(currentEditable, startPos, endPos)
const useCursorManager = () => {
    const [isSelection, setIsSelection] = useState<boolean>(false) // 선택 영역 감지 0 은 없을 때
    const isComposingRef = useRef<boolean>(false) // composing 일 땐 선택 영역으로 값이 들어갈 수 있으므로

    useEffect(() => {
        const detail = {selection: false} // 선택 영역 감지
        const event = new CustomEvent('customCursorEvent', {detail: detail})

        eventManager.addEventListener('selectionchange', 'useCursorManager', () => {
            const selection = window.getSelection()
            if (selection?.isCollapsed) { // 없음
                setIsSelection(false)
                if (isSelection) { // 커서 없어지는 것도 감지 필요할 듯?}
                    detail.selection = false
                    document.dispatchEvent(event)
                }
            } else { // 선택 영역에 변동이 있을 때
                setIsSelection(true)
                detail.selection = true
                document.dispatchEvent(event) // 선택 영역 변경 시 감지
            }
        })

        return () => eventManager.removeEventListener('selectionchange', 'useCursorManager')
    }, [isSelection]);

    useEffect(() => {
        eventManager.addEventListener('compositionstart', 'useCursorManager', () => {isComposingRef.current = true})
        eventManager.addEventListener('compositionend', 'useCursorManager', () => {isComposingRef.current = false})

        return () => {
            eventManager.removeEventListener('compositionstart', 'useCursorManager')
            eventManager.removeEventListener('compositionend', 'useCursorManager')
        }
    }, []);

    // ============== 커서 위치 찾기 ==============
    // 노드 순회하면서 위치 찾기 (재귀)
    const searchPos = useCallback((nodes: Node[], state: SearchOffsetState, searchNode: Node, nodeOffset: number, rootCheck: boolean) => {
        let isContain = false // 포함하는 노드를 찾았는가

        let count = 0
        for (const child of nodes) { // nodes 는 node.childNodes[] 중 찾고자 하는 부분
            if (child.contains(searchNode) && child !== searchNode) { // 하위 또는 자기 자신 contains 는 반대도 성립함
                isContain = true
            }

            if (rootCheck && (isContain || child === searchNode)) { // endContainer 조회 시작 위치 찾는 용도
                state.index = count
                state.previousPos = state.pos
            }

            const length = child.textContent?.length ?? 0
            if (child === searchNode) { // 최종 찾음 텍스트 노드 안에 텍스트 노드가 있는경우도 있네...
                state.pos += nodeOffset
                break
            } else if (isContain) { // 자식 요소로 가야 함 재귀로 빠짐
                searchPos([...child.childNodes], state, searchNode, nodeOffset, false)
                break
            } else { // 찾지 못했다면
                state.pos += length // 나중에 수정할 수 있음 실제로 어떻게 인식되느냐에 따라
            }
            count += 1
        }
    }, [])

    // 커서 가져오기
    const getCursorOffsets = useCallback((element: HTMLElement|null) => {
        if (!element) return null;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        const { startContainer, startOffset, endContainer, endOffset } = range;

        const hasElementNode = Array.from(element.childNodes).some(node => node.nodeType === Node.ELEMENT_NODE);

        let startPos = 0, endPos = 0

        // element = startContainer = endContainer, 텍스트 노드뿐
        if (element === startContainer && !hasElementNode) {
            startPos = startOffset
            endPos = endOffset
        } else if (element === startContainer && hasElementNode) { // element = startContainer = endContainer, 텍스트 노드가 아닌게 있다면?
            for (let i = 0; i <= endOffset; i++) {
                const child = element.childNodes[i]
                const length = child.textContent?.length ?? 0
                if (i <= startOffset) { // 계산이 맞는지 좀 헷갈리넹 ㅎ
                    startPos += length
                }
                endPos += length
            }
        } else {
            const state = {
                pos: 0, // 지금까지 찾은 위치
                index: 0, // endContainer 를 조회하기 시작할 위치 즉, startContainer 찾은 인덱스
                previousPos: 0 // 여기서 startContainer 를 찾기 전까지의 길이
            }

            // 시작 위치 찾기
            const nodes = [...element.childNodes]
            searchPos(nodes, state, startContainer, startOffset, true)
            startPos = state.pos

            // 시작 위치부터 시작!
            state.pos = state.previousPos
            const remainingNodes = nodes.slice(state.index)
            searchPos(remainingNodes, state, endContainer, endOffset, false)
            endPos = state.pos
        }

        // 선택영역이 없다면 그리고 글자 조합 중이라면
        if (selection.isCollapsed || isComposingRef.current) return {startPos: endPos, endPos: endPos}
        return { startPos: startPos, endPos: endPos }; // 선택영역이 있다면
    }, [searchPos]);

    // ============== 커서 위치 세팅 ==============
    const [canMove, setCanMove] = useState(true) // 기본 이동 가능 상태
    const [movePosition, setMovePosition] = useState<{startContainer: Node, startOffset: number, endContainer: Node, endOffset: number}|null>(null)

    useEffect(() => {
        // 방향키는 어쩔까... 일단 남겨놓을까? 거 괜히 불편해질 수 있을거 같은디 흠..
        const handleBlur = () => setCanMove(false)
        const handleClick = () => setCanMove(false)
        document.addEventListener('click', handleClick, true) // 클릭시 이동 방지
        document.addEventListener('blur', handleBlur, true) // 캡처링 단계에서 모든 blur 이벤트를 감지

        return () => {
            document.removeEventListener('click', handleClick, true)
            document.removeEventListener('blur', handleBlur, true)
        }
    }, []);
    useLayoutEffect(() => { // 위치 계산하는 동안 클릭등의 이벤트가 들어왔다면 커서 이동 취소하기 그 사이 입력도 막아야 하나 아직 고민임 써보고 불편하면 ㅇㅇ
        if (!movePosition || !canMove) return
        const range = document.createRange();
        const selection = window.getSelection();
        const {startContainer, startOffset, endContainer, endOffset} = movePosition

        if (startContainer && endContainer) {
            range.setStart(startContainer, startOffset)
            range.setEnd(endContainer, endOffset)

            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        setMovePosition(null)
    }, [movePosition]);
    // 노드를 순회하며 노드 찾기 및 offset 찾기 (재귀)
    const searchNodes = useCallback((nodes: Node[], state: SearchNodesState, prevLength: number, searchPos: number, rootCheck: boolean) => {
        let isContain = false

        let totalLength = prevLength

        let count = 0
        for (const child of nodes) {
            if (rootCheck) state.index += 1
            const nodeLength = child.textContent?.length ?? 0
            const previousTotalLength = totalLength
            totalLength += nodeLength

            if (totalLength >= searchPos) { // 포함 관계
                isContain = true // 포함임
            }

            if (rootCheck && isContain) { // endContainer 조회 시작 위치 찾는 용도
                state.previousLength = previousTotalLength
                state.index = count
            }

            if (isContain && child.hasChildNodes()) { // 하위 요소 탐색 ㄱ
                searchNodes([...child.childNodes], state, previousTotalLength, searchPos, false) // 내부 순환은 False
                break
            } else if (isContain) { // 하위 요소가 없다면! 찾음!
                state.node = child
                state.offset = searchPos - previousTotalLength
                break
            }

            count += 1;
        }

    }, [])

    // 속도 조절 일정 시간 동안 들어온 것 무시, 최종 호출 수행
    const moveCursor = useCallback(() => debounce((element: HTMLElement|null, startPos: number, endPos: number) => {
        if (!element) return;
        setCanMove(true)

        const state = {
            node: null, // 찾은 노드
            offset: 0, // 찾은 위치
            index: 0, // endContainer 조회하기 좋은 위치
            previousLength: 0 // startContainer 조회까지 찾은 총 길이
        }

        // startContainer 조회
        const nodes = [...element.childNodes]
        searchNodes(nodes, state, 0, startPos, true);
        const startContainer = state.node
        const startOffset = state.offset

        // endContainer 조회
        const remainingNodes = nodes.slice(state.index)
        searchNodes(remainingNodes, state, state.previousLength, endPos, false);
        const endContainer = state.node
        const endOffset = state.offset

        if (startContainer && endContainer) {
            setMovePosition({
                startContainer: startContainer,
                startOffset: startOffset,
                endContainer: endContainer,
                endOffset: endOffset
            })
        }
    }, 100), [searchNodes])


    return {getCursorOffsets, moveCursor}
}

export default useCursorManager