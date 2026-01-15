import { useState } from "react";
import { applyMasking } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdaptiveMasking() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  
  const [sampleData] = useState({
    full_name: "John Michael Smith",
    email: "john.smith@company.com",
    phone: "+1-555-123-4567",
    ssn: "123-45-6789",
    address: "123 Main Street, San Francisco, CA 94102",
    dob: "1985-03-15",
    credit_card: "4532-1234-5678-9012",
    ip_address: "192.168.1.100",
    salary: "$125,000"
  });

  const [fieldTypes] = useState({
    full_name: "name",
    email: "email",
    phone: "phone",
    ssn: "ssn",
    address: "address",
    dob: "dob",
    credit_card: "credit_card",
    ip_address: "ip_address",
    salary: "financial"
  });

  const [purpose, setPurpose] = useState("analytics");

  const handleApplyMasking = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await applyMasking({
        data: sampleData,
        field_types: fieldTypes,
        purpose: purpose
      }, token);
      
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMaskingLevelColor = (level) => {
    switch (level) {
      case "none": return "#10b981";
      case "light": return "#3b82f6";
      case "moderate": return "#f59e0b";
      case "heavy": return "#ef4444";
      case "full": return "#7c3aed";
      default: return "#64748b";
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎭 Adaptive Masking</h1>
          <p style={styles.subtitle}>
            Automatically anonymizes data based on requester's risk level and data sensitivity
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Explanation */}
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🔐</div>
          <div>
            <strong style={{color: "#1e3a8a"}}>How Adaptive Masking Works</strong>
            <p style={{margin: "8px 0 0 0", fontSize: "14px", color: "#64748b", lineHeight: "1.6"}}>
              Based on your risk score, data is automatically transformed: lower risk users see more 
              real data, while higher risk users receive synthetic or heavily anonymized data. This 
              ensures data utility while protecting privacy.
            </p>
          </div>
        </div>

        {/* Masking Levels Reference */}
        <div style={styles.levelCard}>
          <h3 style={styles.cardTitle}>Masking Levels by Risk Score</h3>
          <div style={styles.levelGrid}>
            {[
              { level: "None", range: "0.0 - 0.2", desc: "Full data access", color: "#10b981" },
              { level: "Light", range: "0.2 - 0.4", desc: "Partial masking", color: "#3b82f6" },
              { level: "Moderate", range: "0.4 - 0.6", desc: "Significant masking", color: "#f59e0b" },
              { level: "Heavy", range: "0.6 - 0.8", desc: "Heavy anonymization", color: "#ef4444" },
              { level: "Full", range: "0.8 - 1.0", desc: "Synthetic data only", color: "#7c3aed" }
            ].map((l, i) => (
              <div key={i} style={{...styles.levelItem, borderLeftColor: l.color}}>
                <div style={styles.levelHeader}>
                  <span style={{fontWeight: "700", color: l.color}}>{l.level}</span>
                  <span style={styles.levelRange}>{l.range}</span>
                </div>
                <span style={styles.levelDesc}>{l.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.grid}>
          {/* Sample Data */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📝 Original Sample Data</h3>
            <div style={styles.dataGrid}>
              {Object.entries(sampleData).map(([key, value]) => (
                <div key={key} style={styles.dataItem}>
                  <span style={styles.dataLabel}>{key.replace(/_/g, " ")}</span>
                  <span style={styles.dataValue}>{value}</span>
                  <span style={styles.fieldType}>{fieldTypes[key]}</span>
                </div>
              ))}
            </div>

            <div style={styles.purposeSelect}>
              <label style={styles.label}>Purpose of Access</label>
              <select 
                style={styles.input}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              >
                <option value="analytics">Analytics</option>
                <option value="research">Research</option>
                <option value="marketing">Marketing</option>
                <option value="audit">Audit</option>
              </select>
            </div>

            <button 
              style={styles.primaryBtn}
              onClick={handleApplyMasking}
              disabled={loading}
            >
              {loading ? "Applying Masking..." : "Apply Adaptive Masking"}
            </button>
          </div>

          {/* Masked Result */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🎭 Masked Output</h3>
            
            {result ? (
              <>
                <div style={{
                  ...styles.levelBadge,
                  background: getMaskingLevelColor(result.masking_applied?.level)
                }}>
                  Masking Level: {result.masking_applied?.level?.toUpperCase()}
                  <span style={styles.riskScore}>
                    Risk Score: {(result.masking_applied?.risk_score * 100).toFixed(1)}%
                  </span>
                </div>

                <div style={styles.dataGrid}>
                  {Object.entries(result.data).map(([key, value]) => {
                    const detail = result.masking_applied?.details?.[key];
                    const wasPreserved = detail?.original_preserved;
                    
                    return (
                      <div 
                        key={key} 
                        style={{
                          ...styles.dataItem,
                          background: wasPreserved ? "#f0fdf4" : "#fef2f2"
                        }}
                      >
                        <span style={styles.dataLabel}>{key.replace(/_/g, " ")}</span>
                        <span style={styles.maskedValue}>{value}</span>
                        <span style={{
                          ...styles.strategyTag,
                          background: wasPreserved ? "#dcfce7" : "#fee2e2",
                          color: wasPreserved ? "#166534" : "#991b1b"
                        }}>
                          {detail?.strategy || "unknown"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={styles.summaryBox}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Fields Processed</span>
                    <span style={styles.summaryValue}>{result.masking_applied?.fields_processed}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Fields Masked</span>
                    <span style={styles.summaryValue}>
                      {Object.values(result.masking_applied?.details || {}).filter(d => !d.original_preserved).length}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>
                Click "Apply Adaptive Masking" to see how your risk level affects data visibility
              </div>
            )}
          </div>
        </div>

        {/* Masking Strategies Reference */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🛡️ Masking Strategies by Field Type</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Field Type</th>
                <th style={styles.th}>Light</th>
                <th style={styles.th}>Moderate</th>
                <th style={styles.th}>Heavy</th>
                <th style={styles.th}>Full</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}><strong>Email</strong></td>
                <td style={styles.td}>hash</td>
                <td style={styles.td}>domain_only</td>
                <td style={styles.td}>synthetic</td>
                <td style={styles.td}>redact</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Phone</strong></td>
                <td style={styles.td}>partial</td>
                <td style={styles.td}>hash</td>
                <td style={styles.td}>synthetic</td>
                <td style={styles.td}>redact</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>SSN</strong></td>
                <td style={styles.td}>partial</td>
                <td style={styles.td}>hash</td>
                <td style={styles.td}>redact</td>
                <td style={styles.td}>redact</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Name</strong></td>
                <td style={styles.td}>initials</td>
                <td style={styles.td}>pseudonym</td>
                <td style={styles.td}>synthetic</td>
                <td style={styles.td}>redact</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>DOB</strong></td>
                <td style={styles.td}>year_only</td>
                <td style={styles.td}>age_range</td>
                <td style={styles.td}>synthetic</td>
                <td style={styles.td}>redact</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingTop: "100px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px" },
  header: { marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "14px", marginTop: "8px" },
  infoCard: { display: "flex", gap: "16px", padding: "20px", background: "#fef3c7", borderRadius: "12px", marginBottom: "24px", border: "1px solid #fcd34d" },
  infoIcon: { fontSize: "32px" },
  levelCard: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px" },
  levelGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" },
  levelItem: { padding: "12px", background: "#f8fafc", borderRadius: "8px", borderLeft: "4px solid" },
  levelHeader: { display: "flex", justifyContent: "space-between", marginBottom: "4px" },
  levelRange: { fontSize: "11px", color: "#64748b" },
  levelDesc: { fontSize: "12px", color: "#64748b" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" },
  card: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" },
  dataGrid: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" },
  dataItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#f8fafc", borderRadius: "8px" },
  dataLabel: { fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "capitalize", flex: 1 },
  dataValue: { fontSize: "13px", color: "#1e293b", flex: 2, textAlign: "center" },
  maskedValue: { fontSize: "13px", color: "#1e293b", flex: 2, textAlign: "center", fontFamily: "monospace" },
  fieldType: { fontSize: "10px", padding: "2px 8px", background: "#e2e8f0", borderRadius: "4px", color: "#64748b" },
  strategyTag: { fontSize: "10px", padding: "2px 8px", borderRadius: "4px" },
  purposeSelect: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  primaryBtn: { width: "100%", padding: "12px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  errorBox: { padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  levelBadge: { padding: "12px 16px", borderRadius: "8px", color: "#fff", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "700" },
  riskScore: { fontSize: "12px", fontWeight: "400", opacity: 0.9 },
  summaryBox: { display: "flex", gap: "16px", marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px" },
  summaryItem: { flex: 1, textAlign: "center" },
  summaryLabel: { display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" },
  summaryValue: { fontSize: "20px", fontWeight: "700", color: "#1e293b" },
  emptyState: { padding: "60px 20px", textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: "8px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", background: "#f8fafc", fontSize: "12px", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "13px", borderBottom: "1px solid #f1f5f9" }
};
