import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginUser(username, password);
      login(res.access_token, res.role);
      navigate("/request");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.splitLayout}>
        
        {/* LEFT SIDE: IMAGE/BRAND AREA */}
        <div style={styles.imageSection}>
          <div style={styles.overlayText}>
            <div style={styles.logoBox}>
              <div style={styles.logoIcon} />
              <span style={styles.logoText}>Privy.</span>
            </div>
            <h1 style={styles.heroText}>Secure Data Access Gateway</h1>
            <p style={styles.heroSub}>
              Advanced privacy enforcement engine for enterprise data governance and risk management.
            </p>
          </div>
          {/* Using a high-quality professional abstract image */}
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
            alt="Security" 
            style={styles.bgImage} 
          />
        </div>

        {/* RIGHT SIDE: SIGN-IN FORM */}
        <div style={styles.formSection}>
          <div style={styles.formWrapper}>
            <h2 style={styles.formTitle}>Sign In</h2>
            <p style={styles.formSub}>Enter your credentials to access the console</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  placeholder="e.g. admin"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                />
              </div>

              {error && <div style={styles.errorText}>{error}</div>}

              <button style={styles.loginBtn}>Login to Dashboard</button>
            </form>

            <div style={styles.demoBox}>
              <span style={styles.demoTitle}>DEMO CREDENTIALS</span>
              <div style={styles.demoDetails}>
                <span><strong>Admin:</strong> admin / admin123</span>
                <span><strong>Analyst:</strong> analyst / analyst123</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    background: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
  },
  splitLayout: {
    display: "flex",
    height: "100%",
  },
  imageSection: {
    flex: "1.2",
    position: "relative",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bgImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlayText: {
    position: "absolute",
    zIndex: 2,
    left: "60px",
    bottom: "60px",
    right: "60px",
    color: "#fff",
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(10px)",
    padding: "40px",
    borderRadius: "20px",
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  logoIcon: {
    width: "12px",
    height: "12px",
    background: "#3b82f6",
    borderRadius: "2px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  heroText: {
    fontSize: "36px",
    fontWeight: "800",
    margin: "0 0 16px 0",
    lineHeight: "1.1",
  },
  heroSub: {
    fontSize: "16px",
    opacity: "0.9",
    lineHeight: "1.5",
  },
  formSection: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  formWrapper: {
    width: "100%",
    maxWidth: "400px",
  },
  formTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  formSub: {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: "40px",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "16px",
    background: "#0f172a", // Dark professional black/blue button
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "10px",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "16px",
  },
  demoBox: {
    marginTop: "40px",
    padding: "20px",
    background: "#f1f5f9",
    borderRadius: "12px",
  },
  demoTitle: {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748b",
    marginBottom: "8px",
    letterSpacing: "0.5px",
  },
  demoDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    fontSize: "13px",
    color: "#475569",
  }
};