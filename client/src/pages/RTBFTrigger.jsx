import { useState, useEffect } from "react";
import { 
  triggerRTBF,
  getAllRTBFRequests,
  checkRTBFBlock,
  getDeletionCertificate
} from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RTBFTrigger() {
  const { token, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rtbfRequests, setRtbfRequests] = useState([]);
  
  const [form, setForm] = useState({
    subject_id: "",
    reason: "consent_withdrawal",
    scope: "all"
  });
  
  const [rtbfResult, setRtbfResult] = useState(null);
  const [blockCheck, setBlockCheck] = useState(null);
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    if (token && role === "admin") {
      loadRTBFRequests();
    }
  }, [token, role]);

  const loadRTBFRequests = async () => {
    try {
      const requests = await getAllRTBFRequests(token);
      setRtbfRequests(requests);
    } catch (err) {
      console.error("Failed to load RTBF requests:", err);
    }
  };

  const handleTriggerRTBF = async () => {
    if (!form.subject_id) {
      setError("Subject ID is required");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const result = await triggerRTBF({
        subject_id: form.subject_id,
        reason: form.reason,
        scope: form.scope === "all" ? null : form.scope.split(",").map(s => s.trim())
      }, token);
      
      setRtbfResult(result);
      setSuccess(`RTBF triggered for ${form.subject_id}. Status: ${result.status}`);
      if (role === "admin") loadRTBFRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBlock = async () => {
    if (!form.subject_id) {
      setError("Subject ID is required");
      return;
    }
    
    setLoading(true);
    try {
      const result = await checkRTBFBlock(form.subject_id, token);
      setBlockCheck(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCertificate = async (subjectId) => {
    setLoading(true);
    try {
      const cert = await getDeletionCertificate(subjectId, token);
      setCertificate(cert);
    } catch (err) {
      setError("No deletion certificate found for this subject");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "#10b981";
      case "partial": return "#f59e0b";
      case "failed": return "#ef4444";
      case "in_progress": return "#3b82f6";
      default: return "#64748b";
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🗑️ Right to Be Forgotten (RTBF)</h1>
          <p style={styles.subtitle}>
            GDPR Article 17 compliant automated data erasure across all system layers
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* Warning Banner */}
        <div style={styles.warningBanner}>
          <div style={styles.warningIcon}>⚠️</div>
          <div>
            <strong style={{color: "#92400e"}}>Irreversible Action</strong>
            <p style={{margin: "4px 0 0 0", fontSize: "14px", color: "#78716c"}}>
              Triggering RTBF will immediately block all access to the subject's data and initiate 
              automated purging across primary database, cache, search indices, ML models, analytics, 
              and backup systems. This action cannot be undone.
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          {/* RTBF Trigger Form */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Trigger Data Erasure</h3>
            
            <div style={styles.field}>
              <label style={styles.label}>Data Subject ID</label>
              <input
                style={styles.input}
                value={form.subject_id}
                onChange={(e) => setForm({...form, subject_id: e.target.value})}
                placeholder="e.g., user_123"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Reason for Erasure</label>
              <select 
                style={styles.input}
                value={form.reason}
                onChange={(e) => setForm({...form, reason: e.target.value})}
              >
                <option value="consent_withdrawal">Consent Withdrawal</option>
                <option value="legal_request">Legal Request</option>
                <option value="data_no_longer_needed">Data No Longer Needed</option>
                <option value="unlawful_processing">Unlawful Processing</option>
                <option value="child_data">Child Data (Under Age)</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Scope</label>
              <select 
                style={styles.input}
                value={form.scope}
                onChange={(e) => setForm({...form, scope: e.target.value})}
              >
                <option value="all">All Data Layers</option>
                <option value="primary_database">Primary Database Only</option>
                <option value="cache_layer,search_index">Cache & Search Index</option>
                <option value="ml_models,analytics_store">ML Models & Analytics</option>
              </select>
            </div>

            <div style={styles.btnGroup}>
              <button 
                style={styles.dangerBtn}
                onClick={handleTriggerRTBF}
                disabled={loading}
              >
                {loading ? "Processing..." : "🗑️ Trigger RTBF Erasure"}
              </button>
              <button 
                style={styles.secondaryBtn}
                onClick={handleCheckBlock}
                disabled={loading}
              >
                Check Block Status
              </button>
            </div>

            {blockCheck && (
              <div style={blockCheck.is_blocked ? styles.blockedBox : styles.notBlockedBox}>
                <strong>{blockCheck.subject_id}</strong>
                <span style={{marginLeft: "8px"}}>
                  {blockCheck.is_blocked ? "🔒 BLOCKED" : "✅ NOT BLOCKED"}
                </span>
              </div>
            )}
          </div>

          {/* RTBF Result */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Erasure Status</h3>
            
            {rtbfResult ? (
              <div style={styles.resultBox}>
                <div style={styles.resultHeader}>
                  <div>
                    <span style={styles.requestId}>{rtbfResult.request_id}</span>
                    <span style={{
                      ...styles.statusBadge,
                      background: getStatusColor(rtbfResult.status)
                    }}>
                      {rtbfResult.status?.toUpperCase()}
                    </span>
                  </div>
                  {rtbfResult.access_blocked && (
                    <span style={styles.blockedTag}>🔒 Access Blocked</span>
                  )}
                </div>

                <div style={styles.layerGrid}>
                  <h4 style={styles.layerTitle}>Data Layer Status</h4>
                  {Object.entries(rtbfResult.layer_status || {}).map(([layer, status]) => (
                    <div key={layer} style={styles.layerItem}>
                      <div style={styles.layerName}>
                        <span style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: status.status === "completed" ? "#10b981" : 
                                     status.status === "failed" ? "#ef4444" : "#f59e0b",
                          display: "inline-block",
                          marginRight: "8px"
                        }} />
                        {layer.replace(/_/g, " ")}
                      </div>
                      <span style={styles.layerStatus}>{status.status}</span>
                      {status.records_affected !== undefined && (
                        <span style={styles.layerRecords}>{status.records_affected} records</span>
                      )}
                    </div>
                  ))}
                </div>

                {rtbfResult.deletion_certificate && (
                  <div style={styles.certBox}>
                    <h4 style={styles.certTitle}>🏛️ Deletion Certificate</h4>
                    <div style={styles.certContent}>
                      <div><strong>Certificate Hash:</strong></div>
                      <code style={styles.certHash}>
                        {rtbfResult.deletion_certificate.certificate_hash}
                      </code>
                      <div style={styles.certMeta}>
                        <span>Timestamp: {rtbfResult.deletion_certificate.deletion_timestamp}</span>
                        <span>Standards: {rtbfResult.deletion_certificate.compliance_standards?.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={{fontSize: "48px", marginBottom: "16px"}}>🗄️</div>
                <p>No RTBF request processed yet</p>
                <p style={{fontSize: "12px", color: "#94a3b8"}}>
                  Trigger an erasure request to see the status and deletion certificate
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Data Layers Explanation */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📦 Data Layers Affected by RTBF</h3>
          <div style={styles.layerExplainGrid}>
            {[
              { icon: "💾", name: "Primary Database", desc: "User records, profiles, preferences" },
              { icon: "⚡", name: "Cache Layer", desc: "Redis/Memcached session data" },
              { icon: "🔍", name: "Search Index", desc: "Elasticsearch user indices" },
              { icon: "🤖", name: "ML Models", desc: "Training data, flagged for retraining" },
              { icon: "📊", name: "Analytics Store", desc: "Event logs, aggregates recalculated" },
              { icon: "📝", name: "Audit Logs", desc: "Anonymized (not deleted for compliance)" },
              { icon: "💿", name: "Backups", desc: "Scheduled for rotation-based purge" },
              { icon: "🔗", name: "Third Parties", desc: "Processor notification sent" }
            ].map((layer, i) => (
              <div key={i} style={styles.layerExplainItem}>
                <span style={styles.layerExplainIcon}>{layer.icon}</span>
                <div>
                  <strong>{layer.name}</strong>
                  <p style={styles.layerExplainDesc}>{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin: All RTBF Requests */}
        {role === "admin" && rtbfRequests.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 All RTBF Requests (Admin)</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Request ID</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {rtbfRequests.map((r, i) => (
                  <tr key={i}>
                    <td style={styles.td}><code>{r.request_id?.slice(0, 16)}...</code></td>
                    <td style={styles.td}><strong>{r.subject_id}</strong></td>
                    <td style={styles.td}>{r.reason}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        background: getStatusColor(r.status?.value || r.status),
                        color: "#fff"
                      }}>
                        {r.status?.value || r.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {r.deletion_certificate ? (
                        <button 
                          style={styles.smallBtn}
                          onClick={() => handleGetCertificate(r.subject_id)}
                        >
                          View
                        </button>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Certificate Modal */}
        {certificate && (
          <div style={styles.certModal}>
            <div style={styles.certModalContent}>
              <h3>🏛️ Deletion Certificate</h3>
              <pre style={styles.certPre}>
                {JSON.stringify(certificate, null, 2)}
              </pre>
              <button 
                style={styles.primaryBtn}
                onClick={() => setCertificate(null)}
              >
                Close
              </button>
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
  warningBanner: { display: "flex", gap: "16px", padding: "20px", background: "#fef3c7", borderRadius: "12px", marginBottom: "24px", border: "1px solid #fcd34d" },
  warningIcon: { fontSize: "32px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" },
  card: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  btnGroup: { display: "flex", gap: "12px", marginBottom: "16px" },
  dangerBtn: { flex: 1, padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  secondaryBtn: { flex: 1, padding: "12px", background: "#f1f5f9", color: "#1e293b", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  primaryBtn: { width: "100%", padding: "12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
  smallBtn: { padding: "4px 12px", background: "#e2e8f0", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" },
  errorBox: { padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  successBox: { padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  blockedBox: { padding: "12px", background: "#fef2f2", borderRadius: "8px", marginTop: "16px", color: "#991b1b" },
  notBlockedBox: { padding: "12px", background: "#f0fdf4", borderRadius: "8px", marginTop: "16px", color: "#166534" },
  resultBox: { background: "#f8fafc", borderRadius: "12px", padding: "16px" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  requestId: { fontSize: "12px", color: "#64748b", fontFamily: "monospace" },
  statusBadge: { marginLeft: "12px", padding: "4px 12px", borderRadius: "4px", fontSize: "11px", color: "#fff", fontWeight: "700" },
  blockedTag: { fontSize: "12px", color: "#ef4444" },
  layerGrid: { marginTop: "16px" },
  layerTitle: { fontSize: "13px", fontWeight: "600", marginBottom: "12px", color: "#64748b" },
  layerItem: { display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: "#fff", borderRadius: "6px", marginBottom: "8px" },
  layerName: { flex: 2, fontSize: "13px", textTransform: "capitalize" },
  layerStatus: { flex: 1, fontSize: "12px", color: "#64748b" },
  layerRecords: { fontSize: "11px", color: "#94a3b8" },
  certBox: { marginTop: "16px", padding: "16px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" },
  certTitle: { margin: "0 0 12px 0", fontSize: "14px", color: "#1e3a8a" },
  certContent: { fontSize: "13px" },
  certHash: { display: "block", padding: "8px", background: "#fff", borderRadius: "4px", fontSize: "11px", marginTop: "8px", wordBreak: "break-all" },
  certMeta: { display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "11px", color: "#64748b" },
  emptyState: { padding: "40px", textAlign: "center", color: "#64748b" },
  layerExplainGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  layerExplainItem: { display: "flex", gap: "12px", padding: "12px", background: "#f8fafc", borderRadius: "8px" },
  layerExplainIcon: { fontSize: "24px" },
  layerExplainDesc: { margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", background: "#f8fafc", fontSize: "12px", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "12px", fontSize: "13px", borderBottom: "1px solid #f1f5f9" },
  certModal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  certModalContent: { background: "#fff", padding: "24px", borderRadius: "16px", maxWidth: "600px", width: "90%" },
  certPre: { background: "#f8fafc", padding: "16px", borderRadius: "8px", fontSize: "12px", overflow: "auto", maxHeight: "300px" }
};
