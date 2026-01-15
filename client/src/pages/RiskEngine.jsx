import { useState } from "react";

export default function RiskEngine() {
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
                   <span style={styles.thresholdLabel}>THRESHOLD: {THRESHOLD}</span>
                </div>
              </div>
              <div style={styles.gaugeLabels}>
                <span style={{color: '#10b981'}}>SAFE</span>
                <span style={{color: '#ef4444'}}>CRITICAL</span>
              </div>
            </div>
            <p style={styles.description}>
              The Gateway enforces a <strong>Strict-Deny</strong> policy for any request exceeding 
              a calculated score of <code style={styles.code}>{THRESHOLD}</code>. 
            </p>
            <div style={styles.alertBox}>
              <strong>Note:</strong> Scores above 0.7 trigger an immediate revocation of access tokens for that session.
            </div>
          </div>

          {/* RIGHT: WEIGHT DISTRIBUTION */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Impact Weights</h3>
            <div style={styles.factorList}>
              {riskFactors.map((f, i) => (
                <div key={i} style={styles.factorItem}>
                  <div style={styles.factorHeader}>
                    <span style={styles.factorName}>{f.factor}</span>
                    <span style={styles.factorWeight}>{f.weight}% Impact</span>
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

        

[Image of a cybersecurity risk assessment matrix]


        {/* CALCULATION FORMULA */}
        <div style={styles.formulaCard}>
          <h4 style={styles.formulaTitle}>Real-time Heuristic Formula</h4>
          <div style={styles.formulaBox}>
            Score = (S × 0.35) + (R × 0.25) + (P × 0.25) + (L × 0.15)
          </div>
          <div style={styles.legend}>
            <span>S: Sensitivity</span> | <span>R: Role</span> | <span>P: Purpose</span> | <span>L: Location</span>
          </div>
          <p style={styles.footerNote}>
            Integrated with PostgreSQL persistence. Risk metrics are updated per-request to identify anomalous patterns in data consumption.
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px", marginBottom: "24px" },
  card: { background: "#fff", padding: "32px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  cardTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "24px", color: "#1e293b" },
  gaugeContainer: { margin: "30px 0" },
  gaugeBg: { height: "24px", background: "#f1f5f9", borderRadius: "12px", position: "relative", overflow: "hidden", border: "1px solid #e2e8f0" },
  gaugeFill: { height: "100%", background: "linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 100%)", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "10px" },
  thresholdLabel: { color: "#fff", fontSize: "9px", fontWeight: "900", whiteSpace: "nowrap" },
  gaugeLabels: { display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', fontWeight: '800' },
  description: { fontSize: "14px", color: "#64748b", lineHeight: "1.6" },
  alertBox: { marginTop: '20px', padding: '12px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', fontSize: '12px', color: '#9a3412' },
  code: { background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", color: "#ef4444" },
  factorList: { display: "flex", flexDirection: "column", gap: "20px" },
  factorHeader: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
  factorName: { fontSize: "14px", fontWeight: "600", color: "#334155" },
  factorWeight: { fontSize: "13px", fontWeight: "700", color: "#1e3a8a" },
  barBg: { height: "8px", background: "#f1f5f9", borderRadius: "4px", marginBottom: "6px" },
  barFill: { height: "100%", borderRadius: "4px" },
  factorExamples: { fontSize: "11px", color: "#94a3b8", fontWeight: '500' },
  formulaCard: { background: "#0f172a", padding: "40px", borderRadius: "16px", textAlign: "center", color: "#fff" },
  formulaTitle: { margin: "0 0 16px 0", color: "#38bdf8", textTransform: "uppercase", fontSize: "11px", fontWeight: '800', letterSpacing: "1.5px" },
  formulaBox: { fontSize: "28px", margin: "20px 0", fontFamily: "'Courier New', monospace", fontWeight: '700', color: '#e2e8f0' },
  legend: { fontSize: '12px', color: '#64748b', marginBottom: '20px' },
  footerNote: { fontSize: "13px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: '1.6' },
};