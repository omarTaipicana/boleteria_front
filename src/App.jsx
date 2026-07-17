import { Routes, Route, Navigate } from "react-router-dom";

import Checkout from "./pages/Checkout";
import UploadPayment from "./pages/UploadPayment";
import TicketStatus from "./pages/TicketStatus";

import StaffLogin from "./pages/StaffLogin";
import StaffScanner from "./pages/StaffScanner";
import StaffValidator from "./pages/StaffValidator";
import StaffAdmin from "./pages/StaffAdmin";
import StaffUnauthorized from "./pages/StaffUnauthorized";

import StaffLayout from "./layout/StaffLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const EVENT_ID = "072bc678-2eb1-4a0d-8e0f-e8f1dff219d0";

function App() {
  return (
    <Routes>
      {/* Redirecciones */}
      <Route path="/" element={<Navigate to={`/checkout/${EVENT_ID}`} replace />} />
      <Route path="/events" element={<Navigate to={`/checkout/${EVENT_ID}`} replace />} />
      <Route path="/event/:eventId" element={<Navigate to={`/checkout/${EVENT_ID}`} replace />} />
      <Route path="/contact" element={<Navigate to={`/checkout/${EVENT_ID}`} replace />} />
      <Route path="/partners" element={<Navigate to={`/checkout/${EVENT_ID}`} replace />} />

      {/* Flujo de compra */}
      <Route path="/checkout/:eventId" element={<Checkout />} />
      <Route path="/payment/:orderId" element={<UploadPayment />} />
      <Route path="/ticket/:code" element={<TicketStatus />} />

      {/* Login */}
      <Route path="/staff/login" element={<StaffLogin />} />

      {/* Staff */}
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