import {BrowserRouter, Route, Routes} from 'react-router-dom';
import styled from "styled-components";
import {ErrorBoundary} from "react-error-boundary";
import ErrorFallback from "./error/ErrorFallback.tsx";
import NotFound from "./error/NotFound.tsx";
import GlobalProvider from "./global/GlobalProvider.tsx";
import RichEditor from "./layout/RichEditor.tsx";
import {RichEditorProvider} from "./editor/RichEditorReducer.ts";
import Test from "./Test.tsx";

const Container = styled.div`
    display: flex;
    min-height: 100vh;
`

function App() {
    
    return (<GlobalProvider><Container onDragStart={e=>e.preventDefault()}> {/* 기본 드래그 막기 */} 
        {/*<NavSidebar />*/}
        {/*<Header />*/}
        <BrowserRouter>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Routes>
                    <Route path={"/"} element={<RichEditorProvider><RichEditor /></RichEditorProvider>} />
                    <Route path={'/test'} element={<Test />} />
                    <Route path={'*'} element={<NotFound />} />
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    </Container></GlobalProvider>)
}

export default App
