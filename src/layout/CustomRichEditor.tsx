import styled from "styled-components";
import TextEditModule from "../editor/TextEditModule.tsx";

const Container = styled.div`
    background: yellow;
`

const CustomRichEditor = () => {
    return (
        <Container>
            <TextEditModule />
        </Container>
    )
}

export default CustomRichEditor