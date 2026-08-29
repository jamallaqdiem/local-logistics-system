import { Routes, Route, Navigate } from "react-router-dom";
import DispatchPage from "./pages/DispatchPage";
import DriverPage from "./pages/DriverPage";
import { CustomerTracking } from "./pages/CustomerTracking";

function App() {
  return (
    <Routes>
      {/* Redirect root URL to dispatch dashboard */}
      <Route path="/" element={<Navigate to="/dispatch" replace />} />

      {/* Dispatcher / Admin View */}
      <Route path="/dispatch" element={<DispatchPage />} />

      {/* Driver View */}
      <Route path="/driver" element={<DriverPage />} />
      {/* Customer View */}
      <Route path="/track/:trackingToken" element={<CustomerTracking />} />
      {/* Catch-all route for invalid URLs */}
      <Route path="*" element={<Navigate to="/dispatch" replace />} />
    </Routes>
  );
}

export default App;
