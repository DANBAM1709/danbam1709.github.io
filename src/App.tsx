import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Test from "./editor/Test";
import Home from "./layout/Home.tsx";

function App() {
  return (
    <Router>
        <Routes>
            <Route path={"/"} element={<Test />} />
            <Route path={"/test"} element={<Home />} />
        </Routes>
    </Router>
  )
}

export default App
