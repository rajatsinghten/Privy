import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  // Mapping roles to security clearance levels for a better UI
  const getClearance = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { level: 'Level 5 - Global Overseer', color: '#ef4444' };
      case 'analyst': return { level: 'Level 3 - Internal Auditor', color: '#3b82f6' };
      case 'external': return { level: 'Level 1 - Restricted Guest', color: '#64748b' };
      default: return { level: 'Unknown', color: '#cbd5e1' };
    }
  };

  const clearance = getClearance(user?.role);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.avatar}>
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <h1 style={styles.username}>{user?.username || "Guest User"}</h1>
            <span style={{...styles.badge, backgroundColor: clearance.color}}>
              {user?.role?.toUpperCase()}
            </span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label style={styles.label}>Security Clearance</label>
              <p style={styles.value}>{clearance.level}</p>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>Authentication Method</label>
              <p style={styles.value}>JWT (HS256) Persistent Session</p>
            </div>
            <div style={styles.infoItem}>
              <label style={styles.label}>System Status</label>
              <p style={{...styles.value, color: '#10b981'}}>● Verified & Active</p>
            </div>
          </div>

          

          <div style={styles.footer}>
            <button onClick={logout} style={styles.logoutBtn}>Terminate Session (Logout)</button>
          </div>
        </div>

        <div style={styles.disclaimer}>
          Your access is monitored by the Privy Audit Logger. Any unauthorized attempt to escalate privileges is recorded in the PostgreSQL database.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingTop: "120px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "600px", margin: "0 auto", padding: "0 20px" },
  card: { background: "#fff", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", overflow: "hidden" },
  header: { padding: "40px", textAlign: "center", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(to bottom, #f8fafc, #ffffff)" },
  avatar: { width: "80px", height: "80px", background: "#0f172a", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", margin: "0 auto 16px auto", border: "4px solid #fff", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  username: { fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px 0" },
  badge: { padding: "4px 12px", borderRadius: "20px", color: "#fff", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
  infoGrid: { padding: "32px", display: "flex", flexDirection: "column", gap: "24px" },
  infoItem: { borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" },
  label: { fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "4px" },
  value: { fontSize: "15px", fontWeight: "600", color: "#334155", margin: 0 },
  footer: { padding: "0 32px 32px 32px" },
  logoutBtn: { width: "100%", padding: "14px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", transition: "0.2s" },
  disclaimer: { textAlign: "center", color: "#94a3b8", fontSize: "12px", marginTop: "24px", lineHeight: "1.6" }
};