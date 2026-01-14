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
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        {/* LEFT SIDE: PROJECT INFO */}
        <div style={styles.infoSection}>
          <div style={styles.badge}>v1.0 Deployment</div>
          <h1 style={styles.mainTitle}>Privy</h1>
          <h2 style={styles.subTitle}>Privacy-Aware API Gateway</h2>
          
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.dot}></span>
              <div>
                <strong>Policy Engine</strong>
                <p style={styles.featureDesc}>Rule-based enforcement for purpose and jurisdiction.</p>
              </div>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.dot}></span>
              <div>
                <strong>Risk Engine</strong>
                <p style={styles.featureDesc}>Heuristic-based risk scoring with configurable thresholds.</p>
              </div>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.dot}></span>
              <div>
                <strong>Consent Manager</strong>
                <p style={styles.featureDesc}>Real-time validation of user consent storage.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: CLEAN GLASS CARD */}
        <div style={styles.cardSection}>
          <form style={styles.glassCard} onSubmit={handleSubmit}>
            <h3 style={styles.cardHeader}>Console Login</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="Enter your role"
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

            <button style={styles.loginBtn}>Authorize Access</button>

            <div style={styles.demoHint}>
              <strong>Demo Credentials:</strong><br/>
              admin / admin123 • analyst / analyst123
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    height: "100vh",
    width: "100vw",
    // Deep slate gradient - clean, pro, no distracting images
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    color: "#f8fafc",
    overflow: "hidden",
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    padding: "0 40px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoSection: {
    flex: 1,
    paddingRight: "80px",
  },
  badge: {
    color: "#38bdf8",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "16px",
  },
  mainTitle: {
    fontSize: "64px",
    fontWeight: "800",
    margin: 0,
    color: "#fff",
  },
  subTitle: {
    fontSize: "20px",
    fontWeight: "400",
    color: "#94a3b8",
    marginTop: "4px",
    marginBottom: "40px",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  featureItem: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#38bdf8",
    marginTop: "6px",
    boxShadow: "0 0 10px #38bdf8",
  },
  featureDesc: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.5",
  },
  cardSection: {
    flex: 0.8,
    display: "flex",
    justifyContent: "flex-end",
  },
  glassCard: {
    width: "100%",
    maxWidth: "400px",
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "48px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  cardHeader: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "32px",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: "24px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    background: "#38bdf8",
    color: "#0f172a",
    border: "none",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "8px",
    transition: "transform 0.2s",
  },
  errorText: {
    color: "#fb7185",
    fontSize: "13px",
    textAlign: "center",
    marginBottom: "16px",
  },
  demoHint: {
    marginTop: "32px",
    padding: "16px",
    background: "rgba(56, 189, 248, 0.05)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#7dd3fc",
    textAlign: "center",
    lineHeight: "1.6",
  }
};