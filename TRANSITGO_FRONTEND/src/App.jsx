import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import BusRegistration from "./pages/registration/BusRegistration";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        {/* Main app layout routes */}
        <Route path="/" element={<MainLayout />}>
          <Route path="bus_registration" element={<BusRegistration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;