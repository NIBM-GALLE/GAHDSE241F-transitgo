import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import BusRegistration from "./pages/registration/BusRegistration";
import Home from "./pages/Dashboard";
import Signup from "./pages/auth/Signup";
import Signin from "./pages/auth/Signin";
import BusRoute from "./pages/routes/busRoute";
import RouteRegistration from "./pages/routes/RouteRegistration";
import SalesPayments from "./pages/SalesPayments/SalesPayments";
import PassengerRegistration from "./pages/passengers/PassengerRegistration";
import PassengerList from "./pages/passengers/PassengerList";

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
          <Route path="bus_routes" element={<BusRoute />} />
          <Route path="route_registration" element={<RouteRegistration />} />
          <Route path="accounts" element={<SalesPayments />} />
          <Route path="passenger_registration" element={<PassengerRegistration />} />
          <Route path="passengers" element={<PassengerList />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;