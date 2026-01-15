import { useState, useEffect } from "react";
import { 
  generateTaskToken, 
  completeTask, 
  getActiveTokens,
  validateTaskToken 
} from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SelfDestructingTokens() {
  const { token } = useAuth();
  const [activeTokens, setActiveTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [form, setForm] = useState({
    task_id: "",
    task_type: "inference",
    max_ttl_seconds: 300,
    max_uses: 1,
    data_scope: "profile,analytics"
  });
  
  const [generatedToken, setGeneratedToken] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (token) loadActiveTokens();
  }, [token]);

  const loadActiveTokens = async () => {
    try {
      const tokens = await getActiveTokens(token);
      setActiveTokens(tokens);
    } catch (err) {
      console.error("Failed to load tokens:", err);
    }
  };

  const handleGenerate = async () => {
    if (!form.task_id) {
      setError("Task ID is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await generateTaskToken({
        task_id: form.task_id,
        task_type: form.task_type,
        max_ttl_seconds: parseInt(form.max_ttl_seconds),
        max_uses: parseInt(form.max_uses),
        data_scope: form.data_scope.split(",").map(s => s.trim())
      }, token);
      
      setGeneratedToken(result);
      setSuccess("Self-destructing token generated!");
      loadActiveTokens();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!generatedToken?.token) {
      setError("No token to validate");
      return;
    }
    
    setLoading(true);
    try {
      const result = await validateTaskToken(generatedToken.token, token);
      setValidationResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setLoading(true);
    try {
      await completeTask(taskId, token);
      setSuccess(`Task ${taskId} completed - all tokens destroyed!`);
      setGeneratedToken(null);
      setValidationResult(null);
      loadActiveTokens();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔐 Self-Destructing Tokens</h1>
          <p style={styles.subtitle}>
            AI task-scoped tokens that automatically expire after use or task completion
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.grid}>
          {/* Token Generator */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Generate Task Token</h3>
            
            <div style={styles.field}>
              <label style={styles.label}>Task ID</label>
              <input
                style={styles.input}
                value={form.task_id}
                onChange={(e) => setForm({...form, task_id: e.target.value})}
                placeholder="e.g., ml_inference_001"
              />
            </div>

            <div style={styles.row}>
              <div style={{flex: 1}}>
                <label style={styles.label}>Task Type</label>
                <select 
                  style={styles.input}
                  value={form.task_type}
                  onChange={(e) => setForm({...form, task_type: e.target.value})}
                >
                  <option value="inference">Inference</option>
                  <option value="training">Training</option>
                  <option value="analysis">Analysis</option>
                </select>
              </div>
              <div style={{flex: 1}}>
                <label style={styles.label}>Max Uses</label>
                <input
                  type="number"
                  style={styles.input}
                  value={form.max_uses}
                  onChange={(e) => setForm({...form, max_uses: e.target.value})}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>TTL (seconds)</label>
              <input
                type="number"
                style={styles.input}
                value={form.max_ttl_seconds}
                onChange={(e) => setForm({...form, max_ttl_seconds: e.target.value})}
                min="30"
                max="3600"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Data Scope (comma-separated)</label>
              <input
                style={styles.input}
                value={form.data_scope}
                onChange={(e) => setForm({...form, data_scope: e.target.value})}
                placeholder="profile, analytics, preferences"
              />
            </div>

            <button 
              style={styles.primaryBtn} 
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Token"}
            </button>
          </div>

          {/* Generated Token Display */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Generated Token</h3>
            
            {generatedToken ? (
              <div style={styles.tokenDisplay}>
                <div style={styles.tokenInfo}>
                  <span style={styles.tokenLabel}>Token ID:</span>
                  <code style={styles.tokenValue}>{generatedToken.token_id}</code>
                </div>
                <div style={styles.tokenInfo}>
                  <span style={styles.tokenLabel}>Task ID:</span>
                  <code style={styles.tokenValue}>{generatedToken.task_id}</code>
                </div>
                <div style={styles.tokenInfo}>
                  <span style={styles.tokenLabel}>Expires:</span>
                  <code style={styles.tokenValue}>{generatedToken.expires_at}</code>
                </div>
                <div style={styles.tokenInfo}>
                  <span style={styles.tokenLabel}>Max Uses:</span>
                  <code style={styles.tokenValue}>{generatedToken.max_uses}</code>
                </div>
                <div style={styles.tokenInfo}>
                  <span style={styles.tokenLabel}>Scope:</span>
                  <code style={styles.tokenValue}>{generatedToken.data_scope?.join(", ")}</code>
                </div>
                
                <div style={styles.policyBox}>
                  <strong>Self-Destruct Policy:</strong>
                  <ul style={{margin: "8px 0 0 20px", fontSize: "13px"}}>
                    <li>On Expiry: ✅</li>
                    <li>On Max Uses: ✅</li>
                    <li>On Task Complete: ✅</li>
                  </ul>
                </div>

                <div style={styles.btnGroup}>
                  <button style={styles.secondaryBtn} onClick={handleValidate}>
                    Validate & Consume
                  </button>
                  <button 
                    style={styles.dangerBtn} 
                    onClick={() => handleCompleteTask(generatedToken.task_id)}
                  >
                    Complete Task (Destroy)
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                No token generated yet. Generate a token to see it here.
              </div>
            )}

            {validationResult && (
              <div style={validationResult.valid ? styles.validBox : styles.invalidBox}>
                <strong>{validationResult.valid ? "✅ Valid" : "❌ Invalid"}</strong>
                <p style={{margin: "4px 0 0 0"}}>{validationResult.reason}</p>
                {validationResult.remaining_uses !== undefined && (
                  <p style={{margin: "4px 0 0 0"}}>Remaining uses: {validationResult.remaining_uses}</p>
                )}
                {validationResult.destroyed && (
                  <p style={{margin: "4px 0 0 0", color: "#ef4444"}}>⚠️ Token has been destroyed</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Tokens */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your Active Tokens</h3>
          {activeTokens.length > 0 ? (
            <div style={styles.tokenList}>
              {activeTokens.map((t, i) => (
                <div key={i} style={styles.tokenItem}>
                  <div>
                    <strong>{t.task_id}</strong>
                    <span style={styles.tokenMeta}>
                      {t.remaining_uses} uses left | Expires: {t.expires_at}
                    </span>
                  </div>
                  <button 
                    style={styles.smallDangerBtn}
                    onClick={() => handleCompleteTask(t.task_id)}
                  >
                    Destroy
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>No active tokens</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingTop: "100px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  header: { marginBottom: "32px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "14px", marginTop: "8px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" },
  card: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" },
  field: { marginBottom: "16px" },
  row: { display: "flex", gap: "16px", marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  primaryBtn: { width: "100%", padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  secondaryBtn: { flex: 1, padding: "10px", background: "#f1f5f9", color: "#1e293b", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  dangerBtn: { flex: 1, padding: "10px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  smallDangerBtn: { padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "12px" },
  btnGroup: { display: "flex", gap: "12px", marginTop: "16px" },
  errorBox: { padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  successBox: { padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  tokenDisplay: { background: "#f8fafc", padding: "16px", borderRadius: "8px" },
  tokenInfo: { display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" },
  tokenLabel: { color: "#64748b" },
  tokenValue: { background: "#e2e8f0", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" },
  policyBox: { marginTop: "16px", padding: "12px", background: "#fff", borderRadius: "8px", fontSize: "13px" },
  emptyState: { padding: "40px", textAlign: "center", color: "#94a3b8" },
  validBox: { marginTop: "16px", padding: "12px", background: "#f0fdf4", borderRadius: "8px", fontSize: "13px" },
  invalidBox: { marginTop: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px", fontSize: "13px" },
  tokenList: { display: "flex", flexDirection: "column", gap: "12px" },
  tokenItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f8fafc", borderRadius: "8px" },
  tokenMeta: { display: "block", fontSize: "12px", color: "#64748b", marginTop: "4px" }
};
