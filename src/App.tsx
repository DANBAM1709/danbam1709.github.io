import {BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom';
import CustomRichEditor from "./layout/CustomRichEditor.tsx";
import styled from "styled-components";
import NavSidebar from "./common/NavSidebar.tsx";
import Header from "./common/Header.tsx";
import {ErrorBoundary, FallbackProps} from "react-error-boundary";
import {CSSProperties} from "react";

const errorStyle: CSSProperties = {
    width: '100%',
    height: 'calc(100vh - var(--footer-height))',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
}

// 런타임 에러 처리용
const ErrorFallback = ({error}: Readonly<FallbackProps>) => {
    const navigate = useNavigate();

    return (
        <div style={errorStyle}>
            <div>{error.message}</div> <br />
            <button onClick={()=>navigate(-1)}>이전 페이지로 돌아가기</button>
        </div>
    );
}

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={errorStyle}>
            <div>404 NOT FOUND</div> <br />
            <button onClick={()=>navigate(-1)}>이전 페이지로 돌아가기</button>
        </div>
    );
}

const Container = styled.div`
    display: flex;
    min-height: 100vh;
    
    .content {
        min-height: calc(100vh - var(--footer-height));
        //width: var(--content-width);
        margin: 0 auto;
        background: white;
    }
`

function App() {

    return (<Container>
        <NavSidebar />
        <div style={{flex: 1}}>
            <Header />
            <div className={'content'}>
                    <Router>
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Routes>
                            <Route path={"/"} element={<CustomRichEditor />} />
                            <Route path={'*'} element={<NotFound />} />
                        </Routes>
                        </ErrorBoundary>
                    </Router>
            </div>
            <div style={{height: 'var(--footer-height)', background: 'gray'}}>푸터용</div>
        </div>
    </Container>)
}

export default App
