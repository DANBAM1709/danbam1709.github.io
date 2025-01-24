import styled from 'styled-components';
import {Link} from "react-router-dom";

const Container = styled.div`
    /* 테스트용 css */
    width: 300px !important;
    height: 300px;
    background-color: gray;
    color: whitesmoke;
    /* 실제 반영할 css  */
`

const Test = () => {
    return (<>
            <Container contentEditable={true}>얍</Container>
            <Link to="/test" >Home</Link>
    </>)
}

export default Test