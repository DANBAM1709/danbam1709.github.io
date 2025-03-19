import styled from "styled-components";
import SelectBtn from "../../../select-option/SelectBtn.tsx";
import Options from "../../../select-option/Options.tsx";
import Option from "../../../select-option/Option.tsx";

export const DragBtn = styled(SelectBtn)`
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

export const DragOptions = styled(Options)`
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
export const DragOption = styled(Option)`
    & > * {
        width: 20px;
        height: 20px;
    }
    
`