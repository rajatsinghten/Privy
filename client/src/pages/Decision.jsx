import { useLocation, useNavigate } from "react-router-dom";

export default function Decision() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="container">
        <div className="card">
          <h2>No decision available</h2>
          <button onClick={() => navigate("/")}>Go Back</button>
        </div>
      </div>
    );
  }

  const {
    decision,
    reason,
    risk_score,
    timestamp,
    policy_checks,
    consent_status
  } = state;

  return (
    <div className="container">
      <div className="card">
        <h1>Access Decision</h1>
        <p className="subtitle">
          Result of real-time privacy enforcement evaluation
        </p>

        {/* Decision */}
        <p>
          <strong>Decision:</strong>{" "}
          <span
            style={{
              fontWeight: 700,
              color: decision === "ALLOW" ? "#16a34a" : "#dc2626"
            }}
          >
            {decision}
          </span>
        </p>

        {/* Risk */}
        <p>
          <strong>Risk Score:</strong>{" "}
          {Math.round(risk_score * 100)}%
        </p>

        {/* Timestamp */}
        <p>
          <strong>Evaluated At:</strong>{" "}
          {new Date(timestamp).toLocaleString()}
        </p>

        {/* Reason */}
        <div style={{ marginTop: "16px" }}>
          <strong>Reason</strong>
          <p style={{ marginTop: "6px", color: "#374151" }}>
            {reason}
          </p>
        </div>

        {/* Policy Checks */}
        <div style={{ marginTop: "24px" }}>
          <strong>Policy Evaluation</strong>
          <pre
            style={{
              marginTop: "8px",
              background: "#f9fafb",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "13px",
              overflowX: "auto"
            }}
          >
            {JSON.stringify(policy_checks, null, 2)}
          </pre>
        </div>

        {/* Consent Status */}
        <div style={{ marginTop: "24px" }}>
          <strong>Consent Status</strong>
          <pre
            style={{
              marginTop: "8px",
              background: "#f9fafb",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "13px",
              overflowX: "auto"
            }}
          >
            {JSON.stringify(consent_status, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div style={{ marginTop: "32px" }}>
          <button onClick={() => navigate("/")}>
            Evaluate Another Request
          </button>
        </div>
      </div>
    </div>
  );
}
