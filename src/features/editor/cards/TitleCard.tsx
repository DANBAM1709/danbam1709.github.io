import styled from "styled-components";
import CustomTextArea, {CustomTextAreaElement} from "../../../component/CustomTextArea.tsx";
import {forwardRef, useImperativeHandle, useRef} from "react";
import {GetDataHTMLElement} from "../RichEditor.tsx";
import {InheritCardProps} from "../CardSelector.tsx";

const Title = styled(CustomTextArea)`
    font-size: 32px;
`

const TitleCard = forwardRef<GetDataHTMLElement, InheritCardProps>(({data}, ref) => {
    const targetRef = useRef<CustomTextAreaElement>(null)

    useImperativeHandle(ref, () => {
        if (targetRef.current) {
            return Object.assign(targetRef.current, {
                getData: () => ({html: targetRef.current!.innerHTML})
            }) as GetDataHTMLElement
        }
        throw new Error('BasicStyle ref error!')
    }, []);

    return (<Title ref={targetRef} html={data} />)
})

export default TitleCard