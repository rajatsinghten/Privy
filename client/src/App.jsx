import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import RequestData from "./pages/RequestData";
import AuditLogs from "./pages/AuditLogs";
import Consent from "./pages/Consent";
import Policies from "./pages/Policies";
import RiskEngine from "./pages/RiskEngine";
import Profile from "./pages/Profile";

/**
 * Protected Route Wrapper
 * Checks for a valid JWT token before allowing access to the dashboard.
 */
function Protected({ children }) {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/*"
        element={
          <Protected>
            <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
              {/* Sidebar Navigation */}
              <Navbar />
              
              {/* Main Content Area */}
              <main
                style={{
                  flex: 1,
                  padding: "20px",
                  overflowY: "auto",
                  display: "block"
                }}
              >
                <Routes>
                  <Route path="/request" element={<RequestData />} />
                  <Route path="/audit" element={<AuditLogs />} />
                  <Route path="/consent" element={<Consent />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/risk" element={<RiskEngine />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Default redirect for authenticated users */}
                  <Route path="*" element={<Navigate to="/request" replace />} />
                </Routes>
              </main>
            </div>
          </Protected>
        }
      />
    </Routes>
  );
}