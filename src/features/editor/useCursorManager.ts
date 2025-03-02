import {useCallback} from "react";
import {offset} from "@popperjs/core";

interface SearchNodeState {
    charCount: number;
    startNode: Node | null;
    endNode: Node | null;
    startOffset: number;
    endOffset: number;
}

// return getCursorOffsets(currentEditable: HTMLElement), moveCursor(currentEditable, startPos, endPos)
const useCursorManager = () => {

    // ============== 커서 위치 찾기 ==============
    // 노드 순회하면서 위치 찾기 (재귀)
    const searchPos = useCallback((nodes: Node[], state, searchNode: Node, nodeOffset: number, rootCheck: boolean) => {
        let isContain = false // 포함하는 노드를 찾았는가

        let count = 0
        for (const child of nodes) { // nodes 는 node.childNodes[] 중 찾고자 하는 부분
            if (child.contains(searchNode) && child !== searchNode) { // 하위 또는 자기 자신 contains 는 반대도 성립함
                isContain = true
            }

            if (rootCheck && (isContain || child === searchNode)) {
                state.index = count
                state.previousOffset = state.pos
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

        // element = startContainer = endContainer, 텍스트 노드뿐
        if (element === startContainer && !hasElementNode) {
            return { startPos: startOffset, endPos: endOffset };
        }

        let startPos = 0, endPos = 0
        // element = startContainer = endContainer, 텍스트 노드가 아닌게 있다면?
        if (element === startContainer && hasElementNode) {
            for (let i = 0; i <= endOffset; i++) {
                const child = element.childNodes[i]
                const length = child.textContent?.length ?? 0
                if (i <= startOffset) { // 계산이 맞는지 좀 헷갈리넹 ㅎ
                    startPos += length
                }
                endPos += length
            }
            return { startPos: startPos, endPos: endPos };
        }

        let state = {
            pos: 0, // 지금까지 찾은 위치
            index: 0, // endContainer 를 조회하기 시작할 위치 즉, startContainer 찾은 인덱스
            previousOffset: 0 // 여기서 startContainer 를 찾기 전까지의 길이
        }

        // 시작 위치 찾기
        const nodes = [...element.childNodes]
        searchPos(nodes, state, startContainer, startOffset, true)
        startPos = state.pos

        // 시작 위치부터 시작!
        state.pos = state.previousOffset
        const remainingNodes = nodes.slice(state.index)
        searchPos(remainingNodes, state, endContainer, endOffset, false)
        endPos = state.pos

        return { startPos: startPos, endPos: endPos };
    }, [searchPos]);

    // ============== 커서 위치 세팅 ==============
    // 노드를 순회하며 노드 찾기 및 offset 찾기 (재귀)
    const searchNodes = useCallback((nodes: Node[], state, prevLength: number, searchPos: number, rootCheck: boolean) => {
        let isContain = false

        let totalLength = prevLength

        for (const child of nodes) {
            if (rootCheck) state.index += 1
            const nodeLength = child.textContent?.length ?? 0
            const previousTotalLength = totalLength
            totalLength += nodeLength

            if (totalLength >= searchPos) { // 포함 관계
                isContain = true // 포함임
            }

            if (isContain && child.hasChildNodes()) { // 하위 요소 탐색 ㄱ
                searchNodes([...child.childNodes], state, previousTotalLength, searchPos, false) // 내부 순환은 False
                break
            } else if (isContain) { // 하위 요소가 없다면! 찾음!
                state.node = child
                state.offset = searchPos - previousTotalLength
                state.previousLength = previousTotalLength // endContainer 조회시 사용
                break
            }
        }

    }, [])
    const moveCursor = useCallback((element: HTMLElement|null, startPos: number, endPos: number) => {
        if (!element) return;

        const range = document.createRange();
        const selection = window.getSelection();

        // 조건 1. element 는 항상 html 태그이다
        // 조건 2. element 는 텍스트 노드만 가질 수 있다
        // 조건 3. element 는 span, div, br 등의 태그를 가질 수 있다.
        // 조건 4. selection 의 현재 위치는 중요하지 않다.
        // 조건 5. 노드의 길이는 텍스트 길이로 하면 되지 않은가.. ㅎㅎ
        // 조건 6. 현재까지 구한 길이를 확인해야 한다
        const state = {
            node: null, // 찾은 노드
            offset: 0, // 찾은 위치
            index: 0, // endContainer 조회하기 좋은 위치
            cycleCount: 0, // Root인지 확인하기 위함
            previousLength: 0 // startContainer 조회까지 찾은 총 길이
        }

        const nodes = [...element.childNodes]
        searchNodes(nodes, state, 0, startPos);
        const startContainer = state.node
        const startOffset = state.offset

        const remainingNodes = nodes.slice(state.index)
        searchNodes(nodes, state, 0, endPos);
        const endContainer = state.node
        const endOffset = state.offset

        // const searchStart

        // console.log(state.node, state.offset)

        if (startContainer && endContainer) {
            // console.log(startPos, startContainer, startOffset)
            range.setStart(startContainer, startOffset)
            range.setEnd(endContainer, endOffset)

            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        // console.log(element, start)
        // if (element )
        // if (element === )
        
        // const state: SearchNodeState = {
        //     charCount: 0,
        //     startNode: null,
        //     endNode: null,
        //     startOffset: 0,
        //     endOffset: 0
        // }

        // searchNodes(currentEditable, state, startPos, endPos);

        // if (state.startNode && state.endNode) {
        //     range.setStart(state.startNode, state.startOffset);
        //     range.setEnd(state.endNode, state.endOffset);
        //
        //     if (selection) {
        //         selection.removeAllRanges();
        //         selection.addRange(range);
        //     }
        // }
    }, [])


    return {getCursorOffsets, moveCursor}
}

export default useCursorManager