import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { name: "Request Access", path: "/request" },
    { name: "Audit Logs", path: "/audit" },
    { name: "Consent", path: "/consent" },
    { name: "Policies", path: "/policies" },
    { name: "Risk Engine", path: "/risk" },
  ];

  // Global Nav Container
  const navContainerStyle = {
    height: "80px", // Increased height for a more commanding presence
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    padding: "0 40px",
    boxSizing: "border-box",
  };

  const innerWrapper = {
    width: "100%",
    maxWidth: "1200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const logoStyle = {
    fontSize: "26px", // Larger, impactful logo
    fontWeight: "900",
    color: "#1e3a8a",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    letterSpacing: "-1px",
  };

  const navListStyle = {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  };

  const linkStyle = (path) => ({
    cursor: "pointer",
    fontSize: "16px", // Scaled up to match page body text
    fontWeight: location.pathname === path ? "700" : "500",
    color: location.pathname === path ? "#1e3a8a" : "#475569",
    padding: "10px 20px",
    borderRadius: "10px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: location.pathname === path ? "#f1f5f9" : "transparent",
  });

  const actionGroup = {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  };

  const logoutButtonStyle = {
    background: "#1e3a8a",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 6px -1px rgba(30, 58, 138, 0.2)",
  };

  return (
    <nav style={navContainerStyle}>
      <div style={innerWrapper}>
        {/* LEFT: BRAND */}
        <div style={logoStyle} onClick={() => navigate("/request")}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#3b82f6' }} />
          Privy
        </div>

        {/* CENTER: NAV LINKS */}
        <div style={navListStyle}>
          {links.map((l) => (
            <div
              key={l.path}
              onClick={() => navigate(l.path)}
              style={linkStyle(l.path)}
              onMouseEnter={(e) => {
                if (location.pathname !== l.path) {
                  e.target.style.color = "#1e3a8a";
                  e.target.style.backgroundColor = "#f8fafc";
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== l.path) {
                  e.target.style.color = "#475569";
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              {l.name}
            </div>
          ))}
        </div>

        {/* RIGHT: PROFILE + LOGOUT */}
        <div style={actionGroup}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#475569",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#1e3a8a")}
            onMouseLeave={(e) => (e.target.style.color = "#475569")}
            onClick={() => navigate("/profile")}
          >
            Profile
          </div>

          <button
            onClick={logout}
            style={logoutButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.background = "#1e40af";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#1e3a8a";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}