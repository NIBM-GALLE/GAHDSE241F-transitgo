import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from './components/layouts/MainLayout';
import BusRegistration from './pages/registration/BusRegistration';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} >
        <Route path='bus-registration' element={<BusRegistration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App