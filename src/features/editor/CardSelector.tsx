import {forwardRef, ReactElement, useEffect, useState} from "react";
import BasicCard from "./cards/BasicCard.tsx";
import TitleCard from "./cards/TitleCard.tsx";
import {GetDataHTMLElement} from "../../layout/RichEditor.tsx";

export type CardProps =
    {id: string, mode: 'title', data: string} | // data: content
    {id: string, mode: 'default', data: string} | // data: content
    {id: string, mode: 'code', data: string}  // data: content


const CardSelector = forwardRef<GetDataHTMLElement, Omit<CardProps, 'id'>>(({mode, data}, ref) => {
    const [component, setComponent] = useState<ReactElement>(<></>)

    useEffect(() => {
        setComponent(() => {
            switch (mode) {
                case 'title':
                    return <TitleCard ref={ref} data-placeholder={'제목'}>{data}</TitleCard>
                case 'default':
                    return <BasicCard ref={ref} html={data} />
                // case 'code':
                //     return <CodeStyle id={id} ref={ref}>{data}</CodeStyle>
                default:
                    return <></>
            }
        })
    }, [mode, data, ref]);

    return (<>{component}</>)
})

export default CardSelector