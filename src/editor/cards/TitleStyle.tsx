import styled from "styled-components";
import TextArea from "../../common/TextArea.tsx";
import {forwardRef} from "react";

const Container = styled.div`
    padding-top: 80px;
`
const Title = styled(TextArea)`
    font-size: 32px;
`

const TitleStyle = forwardRef<HTMLDivElement, {children: string}>(({children}, ref) => {
    return (<Container><Title ref={ref}>{children}</Title></Container>)
})

export default TitleStyle