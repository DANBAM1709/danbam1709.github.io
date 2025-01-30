import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomRichEditor from "./layout/CustomRichEditor.tsx";

function App() {
  return (
    <Router>
        <Routes>
            <Route path={"/"} element={<CustomRichEditor />} />
        </Routes>
    </Router>
  )
}

export default App
