import styled from "styled-components";
import TextArea from "../../common/TextArea.tsx";
import {forwardRef, useImperativeHandle, useRef} from "react";
import {GetDataHTMLElement} from "../../layout/RichEditor.tsx";

const Title = styled(TextArea)`
    font-size: 32px;
`

const TitleStyle = forwardRef<GetDataHTMLElement, {children: string}>(({children}, ref) => {
    const targetRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => {
        if (targetRef.current) {
            return Object.assign(targetRef.current, {
                getData: () => targetRef.current!.innerHTML
            }) as GetDataHTMLElement
        }
        throw new Error('BasicStyle ref error!')
    }, []);

    return (<Title ref={targetRef}>{children}</Title>)
})

export default TitleStyle