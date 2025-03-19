import {forwardRef} from "react";
import {ContentElement} from "../context/ContentStoreContext.ts";
import BasicTextBlock from "../contents/BasicTextBlock.tsx";

export type ContentProps =
    | {id: string, mode: 'title'|'basic', data: {html: string}}

export const FONT_SIZE: Record<ContentProps['mode'], string> = { // ActionTool(드래그 버튼) 높이 설정을 위함
    basic: '20px',
    title: '32px'
}

type ContentSelectorProps = Omit<ContentProps, 'id'>
export type InheritContentProps = Omit<ContentProps, 'id'|'mode'>

const ContentSelector = forwardRef<ContentElement, ContentSelectorProps>(({mode, data}, ref) => {
    switch (mode) {
        case 'title':
            return <BasicTextBlock ref={ref} data={data} />
        case 'basic':
            return <BasicTextBlock ref={ref} data={data} />
        default:
            return <>존재하지 않는 모드입니다.</>
    }
})

export default ContentSelector