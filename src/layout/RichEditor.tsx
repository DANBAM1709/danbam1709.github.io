import styled from "styled-components";
import MainContainer from "../common/base/MainContainer.tsx";
import Section from "../common/base/Section.tsx";
import Plus from '../assets/svg/plus.svg?react'
import ChevronDown from '../assets/svg/chevron-down.svg?react'
import Grab from '../assets/svg/grab.svg?react'
import {ActionTool, ActionButton, Card, CardDivider, DragButton, CardItem, DraggableCard} from "../editor/EditorUI.ts";
import Tooltip from "../common/common/Tooltip.tsx";
import {useRef} from "react";

const Container = styled(MainContainer)`
    ${Card} {
        min-width: var(--content-width);
        width: var(--content-width);
    }
    ${DragButton} {
        opacity: 0;
        width: 18px;
        margin-right: 10px;
    }
    ${DraggableCard} {
        margin-right: 28px;
    }
    ${DragButton}:focus-within,
    ${DraggableCard}:hover ${DragButton},
    ${DraggableCard}:has(${Card}:focus-within) ${DragButton}{
        opacity: 1;
    }

    ${DragButton}:focus-within + ${Card},
    ${Card}:focus-within {
        background: rgba(173, 216, 230, 0.1);
    }
    
    ${CardDivider} {
        opacity: 0;
    }
    ${CardDivider}:hover, 
    ${DraggableCard}:hover + ${CardDivider} {
        opacity: 1;
    }
`


const RichEditor = () => {
    const testRef = useRef<HTMLDivElement>(null)

    return (<Container>
        <Section>
            <DraggableCard>
                <DragButton ref={testRef}><Grab width={'16px'} height={'16px'} /></DragButton>
                <Card>
                    <CardItem>이것은 카드에 들어갈 요소임당</CardItem>
                    흐잉?
                </Card>
            </DraggableCard>
            <CardDivider><ActionTool>
                    <ActionButton><Plus width={'20px'} height={'20px'} /></ActionButton>
                    <ActionButton><ChevronDown width={'12px'} height={'12px'} /></ActionButton>
            </ActionTool></CardDivider>
            <Tooltip componentRef={testRef}>테스트용도용</Tooltip>
        </Section>
    </Container>)
}

export default RichEditor