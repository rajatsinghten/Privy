import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import RequestData from "./pages/RequestData";
import AuditLogs from "./pages/AuditLogs";
import Consent from "./pages/Consent";
import Policies from "./pages/Policies";
import RiskEngine from "./pages/RiskEngine";

function Protected({ children }) {
  const auth = useAuth();
  if (!auth || !auth.token) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <Protected>
            <div style={{ display: "flex", minHeight: "100vh" }}>
              <Navbar />
              <main
                style={{
                  flex: 1,
                  padding: 32,
                  background: "#f6f5f3", // nude / formal
                }}
              >
                <Routes>
                  <Route path="/request" element={<RequestData />} />
                  <Route path="/audit" element={<AuditLogs />} />
                  <Route path="/consent" element={<Consent />} />
                  <Route path="/policies" element={<Policies />} />
                  <Route path="/risk" element={<RiskEngine />} />
                  <Route path="*" element={<Navigate to="/request" />} />
                </Routes>
              </main>
            </div>
          </Protected>
        }
      />
    </Routes>
  );
}
