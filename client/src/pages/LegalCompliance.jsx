import { useState, useEffect } from "react";
import { 
  checkCompliance,
  getApplicableLaws,
  getRequirements
} from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LegalCompliance() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    data_controller_location: "US",
    data_subject_location: "EU",
    processing_purpose: "service_delivery",
    data_categories: ["personal"],
    cross_border_transfer: true
  });
  
  const [complianceResult, setComplianceResult] = useState(null);
  const [applicableLaws, setApplicableLaws] = useState(null);
  const [requirements, setRequirements] = useState(null);
  const [activeTab, setActiveTab] = useState("check");

  const jurisdictions = [
    { code: "US", name: "United States", flag: "🇺🇸", law: "CCPA/State Laws" },
    { code: "EU", name: "European Union", flag: "🇪🇺", law: "GDPR" },
    { code: "UK", name: "United Kingdom", flag: "🇬🇧", law: "UK GDPR" },
    { code: "IN", name: "India", flag: "🇮🇳", law: "DPDP Act 2023" },
    { code: "BR", name: "Brazil", flag: "🇧🇷", law: "LGPD" },
    { code: "SG", name: "Singapore", flag: "🇸🇬", law: "PDPA" },
  ];

  const dataCategories = [
    { id: "personal", label: "Personal Data", icon: "👤" },
    { id: "sensitive", label: "Sensitive/Special Category", icon: "🔒" },
    { id: "biometric", label: "Biometric Data", icon: "🖐️" },
    { id: "health", label: "Health Data", icon: "🏥" },
    { id: "financial", label: "Financial Data", icon: "💳" },
    { id: "location", label: "Location Data", icon: "📍" },
    { id: "children", label: "Children's Data", icon: "👶" }
  ];

  const processingPurposes = [
    { id: "service_delivery", label: "Service Delivery" },
    { id: "analytics", label: "Analytics & Improvement" },
    { id: "marketing", label: "Marketing & Advertising" },
    { id: "ai_training", label: "AI/ML Training" },
    { id: "legal_obligation", label: "Legal Obligation" },
    { id: "vital_interests", label: "Vital Interests" },
    { id: "research", label: "Scientific Research" }
  ];

  const handleCheckCompliance = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await checkCompliance(form, token);
      setComplianceResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetApplicableLaws = async () => {
    setLoading(true);
    try {
      const laws = await getApplicableLaws({
        data_controller_location: form.data_controller_location,
        data_subject_location: form.data_subject_location
      }, token);
      setApplicableLaws(laws);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRequirements = async () => {
    setLoading(true);
    try {
      const reqs = await getRequirements({
        processing_purpose: form.processing_purpose,
        data_categories: form.data_categories,
        jurisdictions: [form.data_controller_location, form.data_subject_location]
      }, token);
      setRequirements(reqs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDataCategory = (category) => {
    const newCategories = form.data_categories.includes(category)
      ? form.data_categories.filter(c => c !== category)
      : [...form.data_categories, category];
    setForm({...form, data_categories: newCategories});
  };

  const getComplianceColor = (status) => {
    switch (status) {
      case "compliant": return { bg: "#dcfce7", border: "#86efac", text: "#166534" };
      case "conditional": return { bg: "#fef9c3", border: "#fde047", text: "#854d0e" };
      case "non_compliant": return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };
      default: return { bg: "#f1f5f9", border: "#e2e8f0", text: "#64748b" };
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>⚖️ Legal Compliance Engine</h1>
          <p style={styles.subtitle}>
            Smart compliance layer that automatically applies the strictest global privacy laws based on geography
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { id: "check", label: "Compliance Check", icon: "✓" },
            { id: "laws", label: "Applicable Laws", icon: "📜" },
            { id: "requirements", label: "Requirements", icon: "📋" }
          ].map(tab => (
            <button 
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.grid}>
          {/* Configuration Panel */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📍 Scenario Configuration</h3>

            <div style={styles.field}>
              <label style={styles.label}>Data Controller Location</label>
              <select 
                style={styles.input}
                value={form.data_controller_location}
                onChange={(e) => setForm({...form, data_controller_location: e.target.value})}
              >
                {jurisdictions.map(j => (
                  <option key={j.code} value={j.code}>{j.flag} {j.name} ({j.law})</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Data Subject Location</label>
              <select 
                style={styles.input}
                value={form.data_subject_location}
                onChange={(e) => setForm({...form, data_subject_location: e.target.value})}
              >
                {jurisdictions.map(j => (
                  <option key={j.code} value={j.code}>{j.flag} {j.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Processing Purpose</label>
              <select 
                style={styles.input}
                value={form.processing_purpose}
                onChange={(e) => setForm({...form, processing_purpose: e.target.value})}
              >
                {processingPurposes.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Data Categories</label>
              <div style={styles.categoryGrid}>
                {dataCategories.map(cat => (
                  <div 
                    key={cat.id}
                    style={{
                      ...styles.categoryChip,
                      ...(form.data_categories.includes(cat.id) ? styles.categoryChipActive : {})
                    }}
                    onClick={() => toggleDataCategory(cat.id)}
                  >
                    <span>{cat.icon}</span> {cat.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={{...styles.label, display: "flex", alignItems: "center", gap: "8px"}}>
                <input 
                  type="checkbox"
                  checked={form.cross_border_transfer}
                  onChange={(e) => setForm({...form, cross_border_transfer: e.target.checked})}
                />
                Cross-Border Data Transfer
              </label>
            </div>

            <div style={styles.btnGroup}>
              {activeTab === "check" && (
                <button style={styles.primaryBtn} onClick={handleCheckCompliance} disabled={loading}>
                  {loading ? "Checking..." : "⚖️ Check Compliance"}
                </button>
              )}
              {activeTab === "laws" && (
                <button style={styles.primaryBtn} onClick={handleGetApplicableLaws} disabled={loading}>
                  {loading ? "Loading..." : "📜 Get Applicable Laws"}
                </button>
              )}
              {activeTab === "requirements" && (
                <button style={styles.primaryBtn} onClick={handleGetRequirements} disabled={loading}>
                  {loading ? "Loading..." : "📋 Get Requirements"}
                </button>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div style={styles.card}>
            {activeTab === "check" && (
              <>
                <h3 style={styles.cardTitle}>📊 Compliance Report</h3>
                {complianceResult ? (
                  <div>
                    {/* Overall Status */}
                    <div style={{
                      ...styles.statusBox,
                      background: getComplianceColor(complianceResult.overall_status).bg,
                      borderColor: getComplianceColor(complianceResult.overall_status).border,
                      color: getComplianceColor(complianceResult.overall_status).text
                    }}>
                      <div style={styles.statusHeader}>
                        <span style={styles.statusIcon}>
                          {complianceResult.overall_status === "compliant" ? "✅" : 
                           complianceResult.overall_status === "conditional" ? "⚠️" : "❌"}
                        </span>
                        <span style={styles.statusText}>
                          {complianceResult.overall_status?.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                      <p style={styles.statusDesc}>
                        Strictest applicable law: <strong>{complianceResult.applicable_jurisdiction}</strong>
                      </p>
                    </div>

                    {/* Required Actions */}
                    {complianceResult.required_actions?.length > 0 && (
                      <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>📝 Required Actions</h4>
                        <ul style={styles.actionList}>
                          {complianceResult.required_actions.map((action, i) => (
                            <li key={i} style={styles.actionItem}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Legal Bases */}
                    {complianceResult.legal_bases && (
                      <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>📚 Valid Legal Bases</h4>
                        <div style={styles.basisGrid}>
                          {complianceResult.legal_bases.map((basis, i) => (
                            <span key={i} style={styles.basisChip}>{basis}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data Transfer Requirements */}
                    {complianceResult.transfer_mechanism && (
                      <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>🌍 Cross-Border Transfer</h4>
                        <div style={styles.transferBox}>
                          <span style={styles.transferMech}>
                            {complianceResult.transfer_mechanism}
                          </span>
                          {complianceResult.transfer_requirements?.map((req, i) => (
                            <span key={i} style={styles.transferReq}>{req}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Retention */}
                    {complianceResult.retention_limit && (
                      <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>⏱️ Retention Limit</h4>
                        <p style={styles.retentionText}>{complianceResult.retention_limit}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={{fontSize: "48px", marginBottom: "16px"}}>⚖️</div>
                    <p>Configure your scenario and run a compliance check</p>
                    <p style={{fontSize: "12px", color: "#94a3b8"}}>
                      The engine will analyze applicable laws and provide guidance
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "laws" && (
              <>
                <h3 style={styles.cardTitle}>📜 Applicable Laws</h3>
                {applicableLaws ? (
                  <div style={styles.lawsContainer}>
                    {applicableLaws.applicable_laws?.map((law, i) => (
                      <div key={i} style={styles.lawCard}>
                        <div style={styles.lawHeader}>
                          <span style={styles.lawName}>{law.name}</span>
                          <span style={styles.lawJurisdiction}>{law.jurisdiction}</span>
                        </div>
                        <div style={styles.lawDetails}>
                          {law.key_requirements?.map((req, j) => (
                            <span key={j} style={styles.lawReq}>• {req}</span>
                          ))}
                        </div>
                        {law.is_strictest && (
                          <div style={styles.strictestBadge}>★ Strictest</div>
                        )}
                      </div>
                    ))}
                    <div style={styles.conflictBox}>
                      <h4>Resolution Strategy</h4>
                      <p>{applicableLaws.resolution_strategy || "Apply strictest requirements from each applicable law"}</p>
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={{fontSize: "48px", marginBottom: "16px"}}>📜</div>
                    <p>Select locations to see applicable laws</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "requirements" && (
              <>
                <h3 style={styles.cardTitle}>📋 Merged Requirements</h3>
                {requirements ? (
                  <div style={styles.reqContainer}>
                    {Object.entries(requirements.requirements || {}).map(([category, reqs]) => (
                      <div key={category} style={styles.reqSection}>
                        <h4 style={styles.reqCategory}>{category.replace(/_/g, " ")}</h4>
                        <ul style={styles.reqList}>
                          {reqs.map((req, i) => (
                            <li key={i} style={styles.reqItem}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={{fontSize: "48px", marginBottom: "16px"}}>📋</div>
                    <p>Get merged requirements from applicable laws</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Law Comparison Table */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🌍 Global Privacy Law Comparison</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Aspect</th>
                  <th style={styles.th}>🇪🇺 GDPR</th>
                  <th style={styles.th}>🇺🇸 CCPA</th>
                  <th style={styles.th}>🇮🇳 DPDP</th>
                  <th style={styles.th}>🇬🇧 UK GDPR</th>
                  <th style={styles.th}>🇧🇷 LGPD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}><strong>Consent Basis</strong></td>
                  <td style={styles.td}>Opt-in Required</td>
                  <td style={styles.td}>Opt-out Allowed</td>
                  <td style={styles.td}>Opt-in Required</td>
                  <td style={styles.td}>Opt-in Required</td>
                  <td style={styles.td}>Opt-in Required</td>
                </tr>
                <tr>
                  <td style={styles.td}><strong>Breach Notification</strong></td>
                  <td style={styles.td}>72 hours</td>
                  <td style={styles.td}>"Expedient"</td>
                  <td style={styles.td}>72 hours</td>
                  <td style={styles.td}>72 hours</td>
                  <td style={styles.td}>"Reasonable"</td>
                </tr>
                <tr>
                  <td style={styles.td}><strong>Data Deletion</strong></td>
                  <td style={styles.td}>✅ Right to Erasure</td>
                  <td style={styles.td}>✅ Right to Delete</td>
                  <td style={styles.td}>✅ Right to Erasure</td>
                  <td style={styles.td}>✅ Right to Erasure</td>
                  <td style={styles.td}>✅ Right to Erasure</td>
                </tr>
                <tr>
                  <td style={styles.td}><strong>Cross-Border Transfer</strong></td>
                  <td style={styles.td}>SCCs/Adequacy</td>
                  <td style={styles.td}>No restriction</td>
                  <td style={styles.td}>Govt. approval</td>
                  <td style={styles.td}>UK Adequacy</td>
                  <td style={styles.td}>DPA approval</td>
                </tr>
                <tr>
                  <td style={styles.td}><strong>Max Penalty</strong></td>
                  <td style={styles.td}>€20M / 4% revenue</td>
                  <td style={styles.td}>$7,500/violation</td>
                  <td style={styles.td}>₹250 Cr</td>
                  <td style={styles.td}>£17.5M / 4%</td>
                  <td style={styles.td}>2% revenue</td>
                </tr>
                <tr>
                  <td style={styles.td}><strong>DPO Required</strong></td>
                  <td style={styles.td}>✅ Often</td>
                  <td style={styles.td}>❌ No</td>
                  <td style={styles.td}>✅ SDF</td>
                  <td style={styles.td}>✅ Often</td>
                  <td style={styles.td}>✅ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingTop: "100px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px" },
  header: { marginBottom: "24px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "14px", marginTop: "8px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "24px", background: "#fff", padding: "8px", borderRadius: "12px", border: "1px solid #e2e8f0" },
  tab: { flex: 1, padding: "12px", border: "none", background: "transparent", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#64748b" },
  activeTab: { background: "#3b82f6", color: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px", marginBottom: "24px" },
  card: { background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  cardTitle: { fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#1e293b" },
  field: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px", textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" },
  categoryGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  categoryChip: { padding: "8px 12px", background: "#f1f5f9", borderRadius: "8px", fontSize: "12px", cursor: "pointer", border: "1px solid #e2e8f0", transition: "all 0.2s" },
  categoryChipActive: { background: "#3b82f6", color: "#fff", borderColor: "#3b82f6" },
  btnGroup: { marginTop: "20px" },
  primaryBtn: { width: "100%", padding: "14px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  errorBox: { padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
  statusBox: { padding: "20px", borderRadius: "12px", border: "2px solid", marginBottom: "20px" },
  statusHeader: { display: "flex", alignItems: "center", gap: "12px" },
  statusIcon: { fontSize: "28px" },
  statusText: { fontSize: "20px", fontWeight: "700" },
  statusDesc: { marginTop: "8px", fontSize: "14px" },
  section: { marginBottom: "20px" },
  sectionTitle: { fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#1e293b" },
  actionList: { margin: 0, paddingLeft: "20px" },
  actionItem: { padding: "6px 0", fontSize: "13px", color: "#475569" },
  basisGrid: { display: "flex", flexWrap: "wrap", gap: "8px" },
  basisChip: { padding: "6px 12px", background: "#e0e7ff", color: "#3730a3", borderRadius: "6px", fontSize: "12px" },
  transferBox: { display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" },
  transferMech: { padding: "8px 16px", background: "#fef3c7", color: "#92400e", borderRadius: "8px", fontWeight: "600", fontSize: "13px" },
  transferReq: { padding: "6px 12px", background: "#f1f5f9", borderRadius: "6px", fontSize: "12px", color: "#475569" },
  retentionText: { fontSize: "16px", fontWeight: "600", color: "#0f172a" },
  emptyState: { padding: "40px", textAlign: "center", color: "#64748b" },
  lawsContainer: { display: "flex", flexDirection: "column", gap: "12px" },
  lawCard: { padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", position: "relative" },
  lawHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  lawName: { fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  lawJurisdiction: { fontSize: "12px", color: "#64748b", padding: "4px 8px", background: "#e2e8f0", borderRadius: "4px" },
  lawDetails: { display: "flex", flexDirection: "column", gap: "4px" },
  lawReq: { fontSize: "13px", color: "#475569" },
  strictestBadge: { position: "absolute", top: "12px", right: "12px", padding: "4px 8px", background: "#fef3c7", color: "#92400e", borderRadius: "4px", fontSize: "11px", fontWeight: "700" },
  conflictBox: { padding: "16px", background: "#eff6ff", borderRadius: "12px", marginTop: "16px" },
  reqContainer: { display: "flex", flexDirection: "column", gap: "16px" },
  reqSection: { padding: "16px", background: "#f8fafc", borderRadius: "12px" },
  reqCategory: { fontSize: "14px", fontWeight: "700", color: "#0f172a", textTransform: "capitalize", marginBottom: "8px" },
  reqList: { margin: 0, paddingLeft: "20px" },
  reqItem: { padding: "4px 0", fontSize: "13px", color: "#475569" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: { padding: "12px 16px", textAlign: "left", background: "#f8fafc", fontWeight: "600", color: "#64748b", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" },
  td: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }
};
