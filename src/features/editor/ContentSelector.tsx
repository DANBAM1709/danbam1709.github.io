import {forwardRef} from "react";
import {ContentElement} from "./provider/ContentStoreContext.ts";
import BasicTextBlock from "./content-module/BasicTextBlock.tsx";
import GhostContainer from "../../base-style/GhostContainer.tsx";

export type ContentProps =
    | {id: string, mode: 'title', data: {html: string}}
    | {id: string, mode: 'basic', data: {html: string}}

type ContentSelectorProps = Omit<ContentProps, 'id'>
export type InheritContentProps = Omit<ContentProps, 'id'|'mode'>

const ContentSelector = forwardRef<ContentElement, ContentSelectorProps>(({mode, data}, ref) => {
    switch (mode) {
        case 'title':
            return <GhostContainer style={{fontSize: '32px'}}><BasicTextBlock ref={ref} data={data} /></GhostContainer>
        case 'basic':
            return <BasicTextBlock ref={ref} data={data} />
        default:
            return <>존재하지 않는 모드입니다.</>
    }
})

export default ContentSelector