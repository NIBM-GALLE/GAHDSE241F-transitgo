import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import BusRegistration from "./pages/registration/BusRegistration";
import Home from "./pages/Dashboard";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login first: default route */}
        <Route path="/" element={<Signin />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        {/* Home and app routes (after login) */}
        <Route path="/home" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="bus_registration" element={<BusRegistration />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;