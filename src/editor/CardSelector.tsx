import {forwardRef, ReactElement, useEffect, useState} from "react";
import BasicStyle from "./cards/BasicStyle.tsx";
import TitleStyle from "./cards/TitleStyle.tsx";
import {GetDataHTMLElement} from "../layout/RichEditor.tsx";

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
                    return <TitleStyle ref={ref} data-placeholder={'제목'}>{data}</TitleStyle>
                case 'default':
                    return <BasicStyle ref={ref}>{data}</BasicStyle>
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