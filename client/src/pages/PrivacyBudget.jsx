import { useState, useEffect } from "react";
import { 
  checkPrivacyBudget, 
  getBudgetStatus,
  getAllBudgets 
} from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PrivacyBudget() {
  const { token, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allBudgets, setAllBudgets] = useState([]);
  
  const [form, setForm] = useState({
    subject_id: "user_123",
    query_type: "individual",
    data_sensitivity: "medium",
    num_records: 1,
    purpose: "analytics"
  });
  
  const [budgetResult, setBudgetResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);

  useEffect(() => {
    if (token && role === "admin") {
      loadAllBudgets();
    }
  }, [token, role]);

  const loadAllBudgets = async () => {
    try {
      const budgets = await getAllBudgets(token);
      setAllBudgets(budgets);
    } catch (err) {
      console.error("Failed to load budgets:", err);
    }
  };

  const handleCheckBudget = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await checkPrivacyBudget({
        subject_id: form.subject_id,
        query_type: form.query_type,
        data_sensitivity: form.data_sensitivity,
        num_records: parseInt(form.num_records),
        purpose: form.purpose
      }, token);
      
      setBudgetResult(result);
      if (role === "admin") loadAllBudgets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatus = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await getBudgetStatus(form.subject_id, token);
      setStatusResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case "critical": return "#ef4444";
      case "warning": return "#f59e0b";
      case "exhausted": return "#7c3aed";
      default: return "#10b981";
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📊 Privacy Budget (ε)</h1>
          <p style={styles.subtitle}>
            Differential privacy protection that prevents re-identification attacks by limiting queries per user
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Explanation Card */}
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🔬</div>
          <div>
            <strong style={{color: "#1e3a8a"}}>How Privacy Budget (ε) Works</strong>
            <p style={{margin: "8px 0 0 0", fontSize: "14px", color: "#64748b", lineHeight: "1.6"}}>
              Each data subject has a privacy budget (epsilon, ε) that depletes with each query. 
              Once exhausted, no more queries are allowed until the budget resets. This prevents 
              attackers from making excessive queries to reconstruct individual identities.
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Query Simulator */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Query Budget Checker</h3>
            
            <div style={styles.field}>
              <label style={styles.label}>Subject ID</label>
              <input
                style={styles.input}
                value={form.subject_id}
                onChange={(e) => setForm({...form, subject_id: e.target.value})}
                placeholder="user_123"
              />
            </div>

            <div style={styles.row}>
              <div style={{flex: 1}}>
                <label style={styles.label}>Query Type</label>
                <select 
                  style={styles.input}
                  value={form.query_type}
                  onChange={(e) => setForm({...form, query_type: e.target.value})}
                >
                  <option value="aggregate">Aggregate (Low ε)</option>
                  <option value="individual">Individual (Medium ε)</option>
                  <option value="raw">Raw Data (High ε)</option>
                </select>
              </div>
              <div style={{flex: 1}}>
                <label style={styles.label}>Sensitivity</label>
                <select 
                  style={styles.input}
                  value={form.data_sensitivity}
                  onChange={(e) => setForm({...form, data_sensitivity: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div style={styles.row}>
              <div style={{flex: 1}}>
                <label style={styles.label}>Records Count</label>
                <input
                  type="number"
                  style={styles.input}
                  value={form.num_records}
                  onChange={(e) => setForm({...form, num_records: e.target.value})}
                  min="1"
                />
              </div>
              <div style={{flex: 1}}>
                <label style={styles.label}>Purpose</label>
                <select 
                  style={styles.input}
                  value={form.purpose}
                  onChange={(e) => setForm({...form, purpose: e.target.value})}
                >
                  <option value="analytics">Analytics</option>
                  <option value="research">Research</option>
                  <option value="reporting">Reporting</option>
                </select>
              </div>
            </div>

            <div style={styles.btnGroup}>
              <button 
                style={styles.primaryBtn} 
                onClick={handleCheckBudget}
                disabled={loading}
              >
                Check & Consume Budget
              </button>
              <button 
                style={styles.secondaryBtn} 
                onClick={handleGetStatus}
                disabled={loading}
              >
                View Status Only
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Budget Status</h3>
            
            {budgetResult && (
              <div style={styles.resultBox}>
                <div style={{
                  ...styles.resultHeader,
                  background: budgetResult.allowed ? "#f0fdf4" : "#fef2f2"
                }}>
                  <span style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: budgetResult.allowed ? "#166534" : "#991b1b"
                  }}>
                    {budgetResult.allowed ? "✅ ALLOWED" : "❌ BLOCKED"}
                  </span>
                  <span style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    background: getAlertColor(budgetResult.alert_level),
                    color: "#fff"
                  }}>
                    {budgetResult.alert_level?.toUpperCase()}
                  </span>
                </div>

                <div style={styles.resultBody}>
                  <p style={styles.resultReason}>{budgetResult.reason}</p>
                  
                  {budgetResult.budget_total && (
                    <div style={styles.budgetMeter}>
                      <div style={styles.meterLabel}>
                        <span>Budget Remaining</span>
                        <span>{budgetResult.budget_percentage}%</span>
                      </div>
                      <div style={styles.meterBg}>
                        <div 
                          style={{
                            ...styles.meterFill,
                            width: `${budgetResult.budget_percentage}%`,
                            background: getAlertColor(budgetResult.alert_level)
                          }} 
                        />
                      </div>
                      <div style={styles.meterValues}>
                        <span>{budgetResult.budget_remaining?.toFixed(4)}ε remaining</span>
                        <span>{budgetResult.budget_total}ε total</span>
                      </div>
                    </div>
                  )}

                  {budgetResult.query_cost && (
                    <div style={styles.costBox}>
                      <strong>Query Cost:</strong> {budgetResult.query_cost.toFixed(4)}ε
                    </div>
                  )}

                  {budgetResult.window_resets_at && (
                    <div style={styles.resetInfo}>
                      🔄 Budget resets at: {new Date(budgetResult.window_resets_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {statusResult && !budgetResult && (
              <div style={styles.statusBox}>
                <h4>Subject: {statusResult.subject_id}</h4>
                <div style={styles.statusGrid}>
                  <div style={styles.statusItem}>
                    <span style={styles.statusLabel}>Remaining Budget</span>
                    <span style={styles.statusValue}>{statusResult.remaining_budget}ε</span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusLabel}>Total Budget</span>
                    <span style={styles.statusValue}>{statusResult.total_budget}ε</span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusLabel}>Queries Made</span>
                    <span style={styles.statusValue}>{statusResult.queries_count}</span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusLabel}>Alert Level</span>
                    <span style={{
                      ...styles.statusValue,
                      color: getAlertColor(statusResult.alert_level)
                    }}>
                      {statusResult.alert_level}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!budgetResult && !statusResult && (
              <div style={styles.emptyState}>
                Run a budget check to see results here
              </div>
            )}
          </div>
        </div>

        {/* Query Cost Reference */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📋 Query Cost Reference (ε)</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Query Type</th>
                <th style={styles.th}>Low Sensitivity</th>
                <th style={styles.th}>Medium Sensitivity</th>
                <th style={styles.th}>High Sensitivity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}><strong>Aggregate</strong></td>
                <td style={styles.td}>0.01ε</td>
                <td style={styles.td}>0.05ε</td>
                <td style={styles.td}>0.1ε</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Individual</strong></td>
                <td style={styles.td}>0.1ε</td>
                <td style={styles.td}>0.25ε</td>
                <td style={styles.td}>0.5ε</td>
              </tr>
              <tr>
                <td style={styles.td}><strong>Raw Data</strong></td>
                <td style={styles.td}>0.3ε</td>
                <td style={styles.td}>0.5ε</td>
                <td style={styles.td}>1.0ε</td>
              </tr>
            </tbody>
          </table>
          <p style={{fontSize: "12px", color: "#64748b", marginTop: "12px"}}>
            * Default budget: 1.0ε per 24-hour window. Multi-record queries scale logarithmically.
          </p>
        </div>

        {/* Admin: All Budgets */}
        {role === "admin" && allBudgets.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔒 All Privacy Budgets (Admin View)</h3>
            <div style={styles.budgetList}>
              {allBudgets.map((b, i) => (
                <div key={i} style={styles.budgetItem}>
                  <div style={styles.budgetHeader}>
                    <strong>{b.subject_id}</strong>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      background: getAlertColor(b.alert_level),
                      color: "#fff"
                    }}>
                      {b.alert_level}
                    </span>
                  </div>
                  <div style={styles.budgetBar}>
                    <div style={{
                      height: "100%",
                      width: `${b.budget_percentage}%`,
                      background: getAlertColor(b.alert_level),
                      borderRadius: "4px"
                    }} />
                  </div>
                  <div style={styles.budgetMeta}>
                    {b.remaining_budget}ε / {b.total_budget}ε ({b.budget_percentage}%) | {b.queries_count} queries
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
  infoCard: { display: "flex", gap: "16px", padding: "20px", background: "#eff6ff", borderRadius: "12px", marginBottom: "24px", border: "1px solid #bfdbfe" },
  infoIcon: { fontSize: "32px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" },
  card: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" },
  field: { marginBottom: "16px" },
  row: { display: "flex", gap: "16px", marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  btnGroup: { display: "flex", gap: "12px" },
  primaryBtn: { flex: 1, padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  secondaryBtn: { flex: 1, padding: "12px", background: "#f1f5f9", color: "#1e293b", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  errorBox: { padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  resultBox: { borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" },
  resultHeader: { padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  resultBody: { padding: "16px", background: "#f8fafc" },
  resultReason: { fontSize: "14px", color: "#475569", marginBottom: "16px" },
  budgetMeter: { marginBottom: "16px" },
  meterLabel: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "4px" },
  meterBg: { height: "12px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden" },
  meterFill: { height: "100%", borderRadius: "6px", transition: "width 0.3s ease" },
  meterValues: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" },
  costBox: { padding: "8px 12px", background: "#fff", borderRadius: "8px", fontSize: "13px", marginBottom: "8px" },
  resetInfo: { fontSize: "12px", color: "#64748b" },
  emptyState: { padding: "40px", textAlign: "center", color: "#94a3b8" },
  statusBox: { padding: "16px", background: "#f8fafc", borderRadius: "8px" },
  statusGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" },
  statusItem: { padding: "12px", background: "#fff", borderRadius: "8px" },
  statusLabel: { display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" },
  statusValue: { fontSize: "18px", fontWeight: "700", color: "#1e293b" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", background: "#f8fafc", fontSize: "12px", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "13px", borderBottom: "1px solid #f1f5f9" },
  budgetList: { display: "flex", flexDirection: "column", gap: "12px" },
  budgetItem: { padding: "12px", background: "#f8fafc", borderRadius: "8px" },
  budgetHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  budgetBar: { height: "8px", background: "#e2e8f0", borderRadius: "4px", marginBottom: "4px" },
  budgetMeta: { fontSize: "11px", color: "#64748b" }
};
