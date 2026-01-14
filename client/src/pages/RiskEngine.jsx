import { useState } from "react";

export default function RiskEngine() {
  // These weights match your backend's heuristic logic
  const riskFactors = [
    { factor: "Data Sensitivity", weight: 35, color: "#ef4444", examples: "High (+0.9), Med (+0.5), Low (+0.1)" },
    { factor: "Requester Role", weight: 25, color: "#3b82f6", examples: "External (+0.7), Analyst (+0.3), Admin (+0.1)" },
    { factor: "Request Purpose", weight: 25, color: "#f59e0b", examples: "Marketing (+0.8), Research (+0.4), Audit (+0.1)" },
    { factor: "Jurisdiction", weight: 15, color: "#10b981", examples: "Global (+0.6), US/EU/UK (+0.2)" },
  ];

  const THRESHOLD = 0.7;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Risk Engine</h1>
          <p style={styles.subtitle}>
            Heuristic-based scoring engine for evaluating data access security posture.
          </p>
        </div>

        <div style={styles.grid}>
          {/* LEFT: THRESHOLD VISUALIZER */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Global Risk Threshold</h3>
            <div style={styles.gaugeContainer}>
              <div style={styles.gaugeBg}>
                <div style={{...styles.gaugeFill, width: `${THRESHOLD * 100}%`}}>
                   <span style={styles.thresholdLabel}>MAX ALLOWED: {THRESHOLD}</span>
                </div>
              </div>
            </div>
            <p style={styles.description}>
              The Gateway enforces a <strong>Strict-Deny</strong> policy for any request exceeding 
              a calculated score of <code style={styles.code}>{THRESHOLD}</code>. 
              This prevents high-risk cross-border data transfers or unauthorized sensitive access.
            </p>
          </div>

          {/* RIGHT: WEIGHT DISTRIBUTION */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Weight Distribution</h3>
            <div style={styles.factorList}>
              {riskFactors.map((f, i) => (
                <div key={i} style={styles.factorItem}>
                  <div style={styles.factorHeader}>
                    <span style={styles.factorName}>{f.factor}</span>
                    <span style={styles.factorWeight}>{f.weight}%</span>
                  </div>
                  <div style={styles.barBg}>
                    <div style={{...styles.barFill, width: `${f.weight}%`, backgroundColor: f.color}} />
                  </div>
                  <span style={styles.factorExamples}>{f.examples}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CALCULATION FORMULA */}
        <div style={styles.formulaCard}>
          <h4 style={styles.formulaTitle}>Dynamic Risk Formula</h4>
          <div style={styles.formulaBox}>
            $$RiskScore = \sum (FactorValue \times Weight)$$
          </div>
          <p style={styles.footerNote}>
            Calculated at runtime using SQLAlchemy-backed heuristics. The result is compared against Policy Engine rules before final decision output.
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
  header: { marginBottom: "40px" },
  title: { fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: "16px", marginTop: "8px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr",
    gap: "24px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    padding: "32px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  },
  cardTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "24px", color: "#1e293b" },
  gaugeContainer: { margin: "40px 0" },
  gaugeBg: {
    height: "24px",
    background: "#f1f5f9",
    borderRadius: "12px",
    position: "relative",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  gaugeFill: {
    height: "100%",
    background: "linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "10px",
  },
  thresholdLabel: { color: "#fff", fontSize: "10px", fontWeight: "800", whiteSpace: "nowrap" },
  description: { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
  code: { background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", color: "#ef4444" },
  factorList: { display: "flex", flexDirection: "column", gap: "20px" },
  factorHeader: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
  factorName: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  factorWeight: { fontSize: "14px", fontWeight: "700", color: "#1e3a8a" },
  barBg: { height: "8px", background: "#f1f5f9", borderRadius: "4px", marginBottom: "6px" },
  barFill: { height: "100%", borderRadius: "4px" },
  factorExamples: { fontSize: "12px", color: "#94a3b8" },
  formulaCard: {
    background: "#0f172a",
    padding: "32px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#fff",
  },
  formulaTitle: { margin: "0 0 16px 0", color: "#38bdf8", textTransform: "uppercase", fontSize: "12px", letterSpacing: "1px" },
  formulaBox: { fontSize: "24px", margin: "20px 0", fontFamily: "serif" },
  footerNote: { fontSize: "13px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto" },
};