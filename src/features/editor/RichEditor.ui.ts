import styled from "styled-components";
import SelectBtn from "../../select-option/SelectBtn.tsx";
import Options from "../../select-option/Options.tsx";
import Option from "../../select-option/Option.tsx";

const DraggableCard = styled.div.attrs({ tabIndex: 0 })`
    width: fit-content;
    height: fit-content;
    display: flex;

    &:not(.editor-title) { // 제목이 아닌 경우
        margin-right: 26px; // DragButton.width + ActionTool.marginRight 중앙 위치 맞추기 위함 스타일 수정할 수도 있을거 같은데..
    }
`
const Card = styled.div.attrs({ tabIndex: 0 })`
    background: white;
    width: 100%;
    height: fit-content;
`
const ActionTool = styled.div`
    display: flex;
    height: calc(1em * var(--line-height));
    align-items: center;
    margin-right: 10px; // margin 조절 시 ActionTool margin-right 와 DragButton 의 width 를 살펴봐야 함
`
const DragButton = styled(SelectBtn)`
    border-radius: 0.15em;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: background 20ms ease-in, color 20ms ease-in;
    color: rgba(55, 53, 47, 0.4);
    width: 14px; // 너비 조절시 ActionTool margin-right 와 DraggableCard 의 margin-right 를 살펴봐야 함
    height: 20px;
    box-sizing: border-box;
    cursor: grab;
    
    &:hover {
        background: rgba(55, 53, 47, 0.03);
        color: rgba(55, 53, 47, 0.5);
    }
    
    & > * { // svg
        height: 13px;
    }
`
const PlusButton = styled(SelectBtn)`
    position: relative;
    z-index: 10;
    border-radius: 50%;
    border: 1px solid #3399ff;
    opacity: 0.5;
    color: #3399ff !important;
    box-sizing: border-box;
    transition: opacity 20ms ease-in;
    padding: 0.05em;
    
    & > * {
        transition: width 20ms ease-in, height 20ms ease-in;
        width: 0.5em;
        height: 0.5em;
    }

    &:hover {
        opacity: 1;
    }
    &:hover > * {
        width: 0.7em;
        height: 0.7em;
    }
`

const CardDivider = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.4em 0; // 수정 전 CardDropZone 확인 필수
`
const CardDividerLine = styled.div`
    position: absolute;
    top: 50%;
    background: #90CAF9;
    width: 100%;
    height: 3px;
    transform: translateY(-50%);
    border-radius: 0.005em;
`

const TopDropZone = styled.div`
    position: absolute !important;
    top: 0; left: 0; right: 0; bottom: 50%;
    z-index: -1;
`
const BottomDropZone = styled.div`
    position: absolute !important;
    top: 50%; left: 0; right: 0; bottom: 0;
    z-index: -1;
`

const DragOptions = styled(Options)`
    display: flex;
    flex-direction: column;
    background: white;
    gap: 1px;
    padding: 4px 0;
    max-height: 70vh;
    box-shadow: rgba(15, 15, 15, 0.05) 0 0 0 1px, rgba(15, 15, 15, 0.1) 0 3px 6px, rgba(15, 15, 15, 0.2) 0 9px 24px;
    border-radius: 10px;
    top: 20px;
`
const DragOption = styled(Option)`
    & > * {
        width: 20px;
        height: 20px;
    }
    
`

export {DragOptions, DragOption, DraggableCard, TopDropZone, BottomDropZone, CardDividerLine, CardDivider, Card, ActionTool, DragButton, PlusButton}