import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import EventList from "./pages/EventList";
import Checkout from "./pages/Checkout";
import UploadPayment from "./pages/UploadPayment";
import TicketStatus from "./pages/TicketStatus";
import EventDetail from "./pages/EventDetail";
import Contact from "./pages/Contact";
import Partners from "./pages/Partners";

import StaffLogin from "./pages/StaffLogin";
import StaffScanner from "./pages/StaffScanner";
import StaffValidator from "./pages/StaffValidator";
import StaffAdmin from "./pages/StaffAdmin";
import StaffUnauthorized from "./pages/StaffUnauthorized";

import MainLayout from "./layout/MainLayout";
import StaffLayout from "./layout/StaffLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Páginas con header y footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/event/:eventId" element={<EventDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/partners" element={<Partners />} />
      </Route>

      {/* Páginas sin header ni footer */}
      <Route path="/checkout/:eventId" element={<Checkout />} />
      <Route path="/payment/:orderId" element={<UploadPayment />} />
      <Route path="/ticket/:code" element={<TicketStatus />} />
      <Route path="/staff/login" element={<StaffLogin />} />

      {/* Rutas protegidas del staff */}
      <Route element={<ProtectedRoute />}>
        <Route element={<StaffLayout />}>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/staff/admin" element={<StaffAdmin />} />
          </Route>

          <Route element={<ProtectedRoute roles={["validator"]} />}>
            <Route path="/staff/validator" element={<StaffValidator />} />
          </Route>

          <Route element={<ProtectedRoute roles={["scanner"]} />}>
            <Route path="/staff/scanner" element={<StaffScanner />} />
          </Route>

          <Route
            path="/staff/unauthorized"
            element={<StaffUnauthorized />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;