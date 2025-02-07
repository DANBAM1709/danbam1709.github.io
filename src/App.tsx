import {BrowserRouter, Route, Routes} from 'react-router-dom';
import CustomRichEditor from "./layout/CustomRichEditor.tsx";
import styled from "styled-components";
import Header from "./layout/Header.tsx";
import {ErrorBoundary} from "react-error-boundary";
import ErrorFallback from "./error/ErrorFallback.tsx";
import NotFound from "./error/NotFound.tsx";
import GlobalProvider from "./global/GlobalProvider.tsx";
import NavSidebar from "./layout/NavSidebar.tsx";

const Container = styled.div`
    display: flex;
    min-height: 100vh;
    
    .content {
        min-height: calc(100vh - var(--footer-height));
        margin: 0 auto;
        background: white;
        padding: 0 50px;
    }
`

function App() {

    return (<GlobalProvider><Container>
        <NavSidebar />
        <div style={{flex: 1}}>
            <Header />
            <div className={'content'}>
                <BrowserRouter>
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Routes>
                            <Route path={"/"} element={<CustomRichEditor />} />
                            <Route path={'*'} element={<NotFound />} />
                        </Routes>
                        </ErrorBoundary>
                </BrowserRouter>
            </div>
            <div style={{height: 'var(--footer-height)', background: 'gray'}}>푸터용</div>
        </div>
    </Container></GlobalProvider>)
}

export default App
