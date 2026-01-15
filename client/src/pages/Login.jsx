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
      login(res.access_token, res.role, username);
      navigate("/request");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardContent}>
            {/* LEFT SIDE: LOGIN FORM */}
            <form onSubmit={handleSubmit} style={styles.formSection}>
              <div style={styles.header}>
                <div style={styles.logoBox}>
                  <div style={styles.logoIcon} />
                  <span style={styles.logoText}>Privy</span>
                </div>
                <h1 style={styles.title}>Welcome back</h1>
                <p style={styles.subtitle}>Login to your Privy account</p>
              </div>

              <div style={styles.fieldGroup}>
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="username">Username</label>
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    placeholder="admin"
                    required
                  />
                </div>

                <div style={styles.field}>
                  <div style={styles.labelRow}>
                    <label style={styles.label} htmlFor="password">Password</label>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && <div style={styles.errorText}>{error}</div>}

                <button type="submit" style={styles.loginBtn}>Login</button>
              </div>

              <div style={styles.footer}>
                By continuing, you agree to Privy's Terms of Service and Privacy Policy.
              </div>
            </form>

            {/* RIGHT SIDE: IMAGE */}
            <div style={styles.imageSection}>
              <div style={styles.imageOverlay}>
                <h2 style={styles.imageTitle}>Secure Data Access Gateway</h2>
                <p style={styles.imageDesc}>
                  Advanced privacy enforcement engine for enterprise data governance and risk management.
                </p>
                <div style={styles.featureList}>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Role-based access control</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Real-time risk assessment</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Privacy budget enforcement</span>
                  </div>
                </div>
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
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: "20px",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "1100px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  cardContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  formSection: {
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "8px",
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  logoIcon: {
    width: "14px",
    height: "14px",
    background: "#3b82f6",
    borderRadius: "3px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#0f172a",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "10px",
    background: "#0f172a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  errorText: {
    color: "#ef4444",
    fontSize: "14px",
    padding: "12px",
    background: "#fef2f2",
    borderRadius: "8px",
    border: "1px solid #fee2e2",
    textAlign: "center",
  },
  separator: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "0",
  },
  separatorLine: {
    flex: 1,
    height: "1px",
    background: "#e2e8f0",
  },
  separatorText: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  demoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  demoItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
  },
  demoLabel: {
    fontWeight: "600",
    color: "#475569",
  },
  demoValue: {
    color: "#64748b",
    fontFamily: "monospace",
  },
  footer: {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: "1.5",
  },
  imageSection: {
    position: "relative",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
  },
  imageOverlay: {
    color: "#ffffff",
    textAlign: "center",
    maxWidth: "400px",
  },
  imageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 16px 0",
    lineHeight: "1.2",
  },
  imageDesc: {
    fontSize: "16px",
    opacity: "0.9",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "left",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
  },
  featureIcon: {
    width: "20px",
    height: "20px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    flexShrink: 0,
  },
};