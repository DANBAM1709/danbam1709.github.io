import {ReactElement, useEffect, useState} from "react";
import CodeStyle from "./CodeStyle.tsx";
import DefaultStyle from "./DefaultStyle.tsx";

export type TemplateSelectorProps =
    {mode: 'default', data: string} | // data: content
    {mode: 'code', data: string}  // data: content

const TemplateSelector = ({mode, data}: TemplateSelectorProps) => {
    const [template, setTemplate] = useState<ReactElement>(<></>)

    useEffect(() => {
        setTemplate(() => {
            switch (mode) {
                case 'default':
                    return <DefaultStyle>{data}</DefaultStyle>
                case 'code':
                    return <CodeStyle>{data}</CodeStyle>
                default:
                    return <></>
            }
        })
    }, [mode, data]);

    return (<>{template}</>)
}

export default TemplateSelector