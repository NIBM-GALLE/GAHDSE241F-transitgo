import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from './components/layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} >
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App