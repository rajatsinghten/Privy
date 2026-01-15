import { useState } from "react";

export default function Policies() {
  const policies = [
    {
      role: "Admin",
      purposes: ["analytics", "research", "compliance", "audit", "reporting", "operational", "marketing", "security"],
      jurisdictions: ["US", "EU", "UK", "APAC", "LATAM", "GLOBAL"],
      maxSensitivity: "High",
      color: "#1e3a8a",
      description: "Super-user access for system administration and global auditing."
    },
    {
      role: "Analyst",
      purposes: ["analytics", "research", "reporting"],
      jurisdictions: ["US", "EU", "UK"],
      maxSensitivity: "Medium",
      color: "#0891b2",
      description: "Standard access for internal data processing and regional insights."
    },
    {
      role: "External",
      purposes: ["reporting"],
      jurisdictions: ["US"],
      maxSensitivity: "Low",
      color: "#475569",
      description: "Restricted access for third-party partners and guest auditors."
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Policy Engine</h1>
          <p style={styles.subtitle}>
            Governance rules defining role-based access control (RBAC) and purpose-based limitations.
          </p>
        </div>

        {/* POLICY GRID */}
        <div style={styles.grid}>
          {policies.map((p, i) => (
            <div key={i} style={styles.policyCard}>
              <div style={{ ...styles.roleHeader, backgroundColor: p.color }}>
                <div>
                  <span style={styles.roleTitle}>{p.role}</span>
                  <p style={{margin: '4px 0 0 0', fontSize: '11px', opacity: 0.8}}>{p.description}</p>
                </div>
                <span style={styles.sensitivityBadge}>{p.maxSensitivity} Sensitive</span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.ruleSection}>
                  <label style={styles.ruleLabel}>Authorized Purposes</label>
                  <div style={styles.badgeContainer}>
                    {p.purposes.map(purpose => (
                      <span key={purpose} style={styles.ruleBadge}>{purpose}</span>
                    ))}
                  </div>
                </div>

                <div style={styles.divider} />

                <div style={styles.ruleSection}>
                  <label style={styles.ruleLabel}>Allowed Jurisdictions</label>
                  <div style={styles.badgeContainer}>
                    {p.jurisdictions.map(loc => (
                      <span key={loc} style={{...styles.ruleBadge, background: '#f1f5f9', color: '#475569'}}>{loc}</span>
                    ))}
                  </div>
                </div>

                <div style={styles.footer}>
                  <div style={styles.statusIndicator}>
                    <div style={styles.activePulse} />
                    Active Enforcement
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LOGIC EXPLAINER */}
        
        <div style={styles.logicBox}>
          <h4 style={{ margin: "0 0 10px 0", color: "#0f172a", display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span> Enforcement Hierarchy
          </h4>
          <div style={styles.flowContainer}>
            <div style={styles.flowStep}>Authentication <span style={styles.arrow}>&rarr;</span></div>
            <div style={styles.flowStep}>Role Mapping <span style={styles.arrow}>&rarr;</span></div>
            <div style={styles.flowStep}>Purpose Check <span style={styles.arrow}>&rarr;</span></div>
            <div style={styles.flowStep}>Jurisdiction Check <span style={styles.arrow}>&rarr;</span></div>
            <div style={styles.flowStepActive}>Final Decision</div>
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginTop: "16px" }}>
            The <strong>Privy Engine</strong> uses a short-circuit evaluation. If a requester's role (e.g., External) 
            attempts to access a purpose not in their authorized list (e.g., Marketing), the request is rejected 
            immediately with a <code>DENY</code> status, and a risk penalty is applied to the risk engine score.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { paddingTop: "100px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  header: { marginBottom: "40px" },
  title: { fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "16px", marginTop: "8px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px", marginBottom: "40px" },
  policyCard: { background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" },
  roleHeader: { padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", color: "#fff" },
  roleTitle: { fontSize: "22px", fontWeight: "800" },
  sensitivityBadge: { fontSize: "10px", fontWeight: "900", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", border: '1px solid rgba(255,255,255,0.3)' },
  cardBody: { padding: "24px" },
  ruleSection: { marginBottom: "16px" },
  ruleLabel: { fontSize: "11px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "12px", letterSpacing: '0.05em' },
  badgeContainer: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  ruleBadge: { background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  divider: { height: "1px", background: "#f1f5f9", margin: "20px 0" },
  footer: { marginTop: "12px" },
  statusIndicator: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#10b981" },
  activePulse: { width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)" },
  logicBox: { background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  flowContainer: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '20px' },
  flowStep: { fontSize: '13px', fontWeight: '600', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px' },
  flowStepActive: { fontSize: '13px', fontWeight: '700', color: '#10b981', background: '#dcfce7', padding: '4px 12px', borderRadius: '6px' },
  arrow: { color: '#cbd5e1', fontWeight: '400' }
};