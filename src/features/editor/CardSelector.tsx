import {ComponentPropsWithoutRef, forwardRef} from "react";
import BasicCard from "./cards/BasicCard.tsx";
import TitleCard from "./cards/TitleCard.tsx";
import {GetDataHTMLElement} from "./RichEditor.tsx";

export type CardProps =
    {id: string, mode: 'title', data: {html: string}} | // data: content
    {id: string, mode: 'default', data: {html: string}} | // data: content
    {id: string, mode: 'code', data: {html: string}}  // data: content

type CardSelectorProps = Omit<CardProps, 'id'> & ComponentPropsWithoutRef<'div'>
export type InheritCardProps = Omit<CardProps, 'id'|'mode'> & ComponentPropsWithoutRef<'div'>

const CardSelector = forwardRef<GetDataHTMLElement, CardSelectorProps>(({mode, data, ...rest}, ref) => {
    switch (mode) {
        case 'title':
            return <TitleCard ref={ref} data-placeholder={'제목'} data={data} {...rest} />
        case 'default':
            return <BasicCard ref={ref} data={data} {...rest} />
        // case 'code':
        //     return <CodeStyle id={id} ref={ref}>{data}</CodeStyle>
        default:
            return <></>
    }
})

export default CardSelector