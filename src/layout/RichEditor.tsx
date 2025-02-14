import styled from "styled-components";
import MainContainer from "../base/MainContainer.tsx";
import Section from "../base/Section.tsx";
import Plus from '../assets/svg/plus.svg?react'
import Grab from '../assets/svg/grab.svg?react'
import {ActionTool, Card, CardDivider, DragButton, DraggableCard, PlusButton, Title} from "../editor/EditorUI.ts";
import {MouseEvent, useEffect, useRef, useState} from "react";
import TooltipWithComponent from "../common/TooltipWithComponent.tsx";

const Container = styled(MainContainer)`
    ${Card}, ${CardDivider} {
        min-width: var(--content-width);
        width: var(--content-width);
    }
    ${CardDivider} {
        margin: 5px 0;    
    }
    ${ActionTool} {
        width: 55px;
    }
    ${DraggableCard} {
        margin-right: 55px;
    }
`

type DataType = {[key: string]: string | string[] }| string


const RichEditor = () => {
    const titleRef = useRef<HTMLDivElement>(null)
    const [cards, setCards] = useState<{id: string, type: string, data: DataType}[]>([])

    useEffect(() => {
        setCards([
            {id: crypto.randomUUID(), type: 'default', data: '와우'},
            {id: crypto.randomUUID(), type: 'default', data: '와우'},
        ])
    }, []);

    const handleAddCard = (index: number) => ({
        onClick: (e: MouseEvent<HTMLDivElement>) => {
            console.log(index)
        }
    })

    return (<Container>
        {/* 제목 */}
        <Section>
            <Card><Title ref={titleRef} data-placeholder={'제목'}></Title></Card>
            <CardDivider />
        </Section>
        {cards.map(card => {
            return (<Section key={card.id}>
                <DraggableCard>
                    <ActionTool>
                        {/*<TooltipWithComponent Component={<PlusButton><Plus width={'16px'} height={'16px'} /></PlusButton>} summary={'쓰읍'} />*/}
                        <TooltipWithComponent Component={<DragButton><Grab width={'16px'} height={'16px'} /></DragButton>} summary={'쓰읍'} />
                    </ActionTool>
                    <Card>
                        여기에 들어갈 것은?
                    </Card>
                </DraggableCard>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <TooltipWithComponent Component={<PlusButton><Plus width={'10px'} height={'10px'} /></PlusButton>} summary={'쓰읍'} />
                    {/*<CardDivider />*/}
                </div>
            </Section>)
        })}
    </Container>)
}

export default RichEditor