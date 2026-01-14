import { useState } from "react";

export default function Policies() {
  const policies = [
    {
      role: "Admin",
      purposes: "All Purposes",
      jurisdictions: "All Jurisdictions",
      maxSensitivity: "High",
      color: "#1e3a8a",
    },
    {
      role: "Analyst",
      purposes: "Analytics, Research, Reporting",
      jurisdictions: "US, EU, UK",
      maxSensitivity: "Medium",
      color: "#0891b2",
    },
    {
      role: "External",
      purposes: "Reporting Only",
      jurisdictions: "US Only",
      maxSensitivity: "Low",
      color: "#475569",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Policy Engine</h1>
          <p style={styles.subtitle}>
            Hard-coded governance rules for purpose limitation and jurisdictional constraints.
          </p>
        </div>

        {/* POLICY GRID */}
        <div style={styles.grid}>
          {policies.map((p, i) => (
            <div key={i} style={styles.policyCard}>
              <div style={{ ...styles.roleHeader, backgroundColor: p.color }}>
                <span style={styles.roleTitle}>{p.role}</span>
                <span style={styles.sensitivityBadge}>{p.maxSensitivity} Sensitive</span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.ruleSection}>
                  <label style={styles.ruleLabel}>Authorized Purposes</label>
                  <p style={styles.ruleText}>{p.purposes}</p>
                </div>

                <div style={styles.divider} />

                <div style={styles.ruleSection}>
                  <label style={styles.ruleLabel}>Allowed Jurisdictions</label>
                  <p style={styles.ruleText}>{p.jurisdictions}</p>
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
          <h4 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Enforcement Hierarchy</h4>
          <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", margin: 0 }}>
            The gateway evaluates policies in the following order: 
            <strong> Identity Authentication &rarr; Role Mapping &rarr; Purpose Validation &rarr; Jurisdiction Check. </strong>
            If any check fails, the request is immediately terminated before reaching the data layer.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: "120px",
    paddingBottom: "40px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  header: {
    marginBottom: "40px",
    textAlign: "left",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: "16px",
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  policyCard: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  roleHeader: {
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
  },
  roleTitle: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  sensitivityBadge: {
    fontSize: "11px",
    fontWeight: "800",
    background: "rgba(255,255,255,0.2)",
    padding: "4px 10px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },
  cardBody: {
    padding: "24px",
  },
  ruleSection: {
    marginBottom: "16px",
  },
  ruleLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  },
  ruleText: {
    fontSize: "15px",
    color: "#334155",
    margin: 0,
    fontWeight: "500",
  },
  divider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "16px 0",
  },
  footer: {
    marginTop: "12px",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#10b981",
  },
  activePulse: {
    width: "8px",
    height: "8px",
    background: "#10b981",
    borderRadius: "50%",
    boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)",
  },
  logicBox: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    border: "1px dashed #cbd5e1",
  }
};