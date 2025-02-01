import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomRichEditor from "./layout/CustomRichEditor.tsx";
import styled from "styled-components";
import NavSidebar from "./common/NavSidebar.tsx";
import Header from "./common/Header.tsx";

const Container = styled.div`
    display: flex;
    min-height: 100vh;
    
    .content {
        min-height: calc(100vh - var(--header-height) - var(--footer-height));
        width: 708px; // 임시
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
                <Routes>
                    <Route path={"/"} element={<CustomRichEditor />} />
                </Routes>
            </Router>
          </div>
          <div style={{height: 'var(--footer-height)'}}>푸터용</div>
      </div>
  </Container>)
}

export default App
