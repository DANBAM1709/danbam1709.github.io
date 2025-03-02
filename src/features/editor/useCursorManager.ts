import {useCallback} from "react";
import {length} from "lodash";
import {end} from "@popperjs/core";

interface SearchOffsetState {
    charCount: number;
    startCharOffset: number;
    endCharOffset: number;
    foundStart: boolean;
    foundEnd: boolean;
}
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
    const searchPos = useCallback((nodes: Node[], state, searchNode: Node, nodeOffset: number) => {
        let isContain = false // 포함하는 노드를 찾았는가
        let index = 0

        for (const child of nodes) { // nodes 는 node.childNodes[] 중 찾고자 하는 부분
            index += 1

            if (child.contains(searchNode) && child !== searchNode) { // 하위 또는 자기 자신 contains 는 반대도 성립함
                isContain = true
            }

            if (!state.isFoundStart && isContain) { // 루트 기준 인덱스 찾음
                state.foundIndex = index
                state.isFoundStart = true
            }

            const length = child.textContent?.length ?? 0
            if (child === searchNode) { // 최종 찾음 텍스트 노드 안에 텍스트 노드가 있는경우도 있네...
                state.pos += nodeOffset
                break
            } else if (isContain) { // 자식 요소로 가야 함 재귀로 빠짐
                searchPos([...child.childNodes], state, searchNode, nodeOffset)
                break
            } else { // 찾지 못했다면
                state.pos += length // 나중에 수정할 수 있음 실제로 어떻게 인식되느냐에 따라
                state.charCount += length // endContainer 찾을 때 필요함
            }
        }
    }, [])

    // 커서 가져오기
    const getCursorOffsets = useCallback((element: HTMLElement|null) => {
        if (!element) return null;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        const { startContainer, startOffset, endOffset } = range;

        let startPos = 0, endPos = 0

        const hasElementNode = Array.from(element.childNodes).some(node => node.nodeType === Node.ELEMENT_NODE);

        // element = startContainer = endContainer, 텍스트 노드뿐
        if (element === startContainer && !hasElementNode) {
            return { startPos: startOffset, endPos: endOffset };
        }
        // element = startContainer = endContainer, 텍스트 노드가 아닌게 있다면?
        if (element === startContainer && hasElementNode) {
            for (let i = 0; i <= endOffset; i++) {
                const child = element.childNodes[i]
                const length = child.textContent?.length ?? 0
                if (i <= startOffset) {
                    startPos += length > 0? length:1
                }
                endPos += length > 0? length:1
            }
            return { startPos: startPos, endPos: endPos };
        }

        // isFound:
        const state = {
            isFoundStart: false, // rootNodes 에서 startContainer 를 찾았는가
            foundIndex: 0, // rootNodes 기준 startContainer 조회한 마지막 위치
            charCount: 0,
            pos: 0 // 지금까지 찾은 위치
        }

        // 시작 위치 찾기
        const nodes = [...element.childNodes]
        searchPos(nodes, state, startContainer, startOffset)
        startPos = state.pos

        const selectedText = selection.toString() // 일단 해보고 ㅇㅇ
        endPos = state.pos + selectedText.length

        return { startPos: startPos, endPos: endPos };
    }, [searchPos]);

    // ============== 커서 위치 세팅 ==============
    // 노드를 순회하며 startNode, endNode 찾기 (재귀)
    const searchNodes = useCallback((node: Node, state: SearchNodeState, startPos: number, endPos: number) => {
        if (node.nodeType === Node.TEXT_NODE) { // 텍스트 노드라면
            const nodeLength = node.textContent?.length ?? 0; // 노드의 총길이
            const endCount = state.charCount + nodeLength // 지금까지의 길이 + 현재 노드 길이

            if (!state.startNode && endCount > startPos) { // 시작 위치
                state.startNode = node;
                state.startOffset = Math.max(0, startPos - state.charCount); // 음수 방지
            }
            if (!state.endNode && endCount >= endPos) { // 끝 위치 찾음
                state.endNode = node;
                state.endOffset = Math.max(0, endPos - state.charCount); // 음수 방지
            }

            state.charCount += nodeLength;
        } else {
            for (const element of node.childNodes) {
                searchNodes(element, state, startPos, endPos); // 노드 요소 및 offset 찾기
                if (state.startNode && state.endNode) return; // 두 노드를 찾았음
            }
        }
    }, [])
    const moveCursor = useCallback((currentEditable: HTMLElement|null, startPos: number, endPos: number) => {
        if (!currentEditable) return;

        const textContent = currentEditable.innerText;
        if (startPos < 0 || endPos > textContent.length || startPos > endPos) {
            console.warn("startPos 또는 endPos 값이 잘못되었습니다.");
            return;
        }

        const range = document.createRange();
        const selection = window.getSelection();
        
        const state: SearchNodeState = {
            charCount: 0,
            startNode: null,
            endNode: null,
            startOffset: 0,
            endOffset: 0            
        }

        searchNodes(currentEditable, state, startPos, endPos);

        if (state.startNode && state.endNode) {
            range.setStart(state.startNode, state.startOffset);
            range.setEnd(state.endNode, state.endOffset);

            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }, [searchNodes])


    return {getCursorOffsets, moveCursor}
}

export default useCursorManager