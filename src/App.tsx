import {BrowserRouter, Route, Routes} from 'react-router-dom';
import CustomRichEditor from "./layout/CustomRichEditor.tsx";
import styled from "styled-components";
import {ErrorBoundary} from "react-error-boundary";
import ErrorFallback from "./error/ErrorFallback.tsx";
import NotFound from "./error/NotFound.tsx";
import GlobalProvider from "./global/GlobalProvider.tsx";
import RichEditor from "./layout/RichEditor.tsx";

const Container = styled.div`
    display: flex;
    min-height: 100vh;
`

function App() {

    return (<GlobalProvider><Container>
        {/*<NavSidebar />*/}
        {/*<Header />*/}
        <BrowserRouter>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Routes>
                    <Route path={"/"} element={<CustomRichEditor />} />
                    <Route path={"/test"} element={<RichEditor />} />
                    <Route path={'*'} element={<NotFound />} />
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    </Container></GlobalProvider>)
}

export default App
