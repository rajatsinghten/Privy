const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`;

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return await res.json();
}

/**
 * Data Request Evaluation
 * Matches README payload: { requester_id, role, purpose, location, data_sensitivity }
 */
export async function requestDataAccess(payload, token) {
  const res = await fetch(`${API_BASE}/request-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
    body: JSON.stringify({
      requester_id: payload.requester_id,
      role: payload.role,
      purpose: payload.purpose,
      location: payload.location,
      data_sensitivity: payload.data_sensitivity
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Engine evaluation failed");
  }

  return await res.json();
}

/**
 * Enhanced Data Request with all privacy features
 */
export async function requestDataAccessEnhanced(payload, token) {
  const res = await fetch(`${API_BASE}/request-data/enhanced`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Enhanced evaluation failed");
  }

  return await res.json();
}

export async function fetchAuditLogs(token) {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Audit log fetch failed");
  }

  return await res.json();
}

// ============ Self-Destructing Token APIs ============

export async function generateTaskToken(payload, token) {
  const res = await fetch(`${API_BASE}/tokens/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Token generation failed");
  }

  return await res.json();
}

export async function validateTaskToken(taskToken, authToken) {
  const res = await fetch(`${API_BASE}/tokens/validate?token=${encodeURIComponent(taskToken)}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Token validation failed");
  }

  return await res.json();
}

export async function completeTask(taskId, token) {
  const res = await fetch(`${API_BASE}/tokens/task-complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ task_id: taskId }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Task completion failed");
  }

  return await res.json();
}

export async function getActiveTokens(token) {
  const res = await fetch(`${API_BASE}/tokens/active`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch active tokens");
  }

  return await res.json();
}

// ============ Privacy Budget APIs ============

export async function checkPrivacyBudget(payload, token) {
  const res = await fetch(`${API_BASE}/privacy-budget/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Budget check failed");
  }

  return await res.json();
}

export async function getBudgetStatus(subjectId, token) {
  const res = await fetch(`${API_BASE}/privacy-budget/status/${subjectId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch budget status");
  }

  return await res.json();
}

export async function getAllBudgets(token) {
  const res = await fetch(`${API_BASE}/privacy-budget/all`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch all budgets");
  }

  return await res.json();
}

// ============ Adaptive Masking APIs ============

export async function applyMasking(payload, token) {
  const res = await fetch(`${API_BASE}/masking/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Masking failed");
  }

  return await res.json();
}

export async function getMaskingStats(token) {
  const res = await fetch(`${API_BASE}/masking/stats`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch masking stats");
  }

  return await res.json();
}

// ============ RTBF APIs ============

export async function triggerRTBF(payload, token) {
  const res = await fetch(`${API_BASE}/rtbf/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "RTBF trigger failed");
  }

  return await res.json();
}

export async function getRTBFStatus(requestId, token) {
  const res = await fetch(`${API_BASE}/rtbf/status/${requestId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch RTBF status");
  }

  return await res.json();
}

export async function getDeletionCertificate(subjectId, token) {
  const res = await fetch(`${API_BASE}/rtbf/certificate/${subjectId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch deletion certificate");
  }

  return await res.json();
}

export async function checkRTBFBlock(subjectId, token) {
  const res = await fetch(`${API_BASE}/rtbf/blocked/${subjectId}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to check RTBF block");
  }

  return await res.json();
}

export async function getAllRTBFRequests(token) {
  const res = await fetch(`${API_BASE}/rtbf/all`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch RTBF requests");
  }

  return await res.json();
}

// ============ Legal Compliance APIs ============

export async function checkCompliance(payload, token) {
  const res = await fetch(`${API_BASE}/compliance/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Compliance check failed");
  }

  return await res.json();
}

export async function getAllLaws(token) {
  const res = await fetch(`${API_BASE}/compliance/laws`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch laws");
  }

  return await res.json();
}

export async function getApplicableLaws(payload, token) {
  const res = await fetch(`${API_BASE}/compliance/applicable-laws`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to get applicable laws");
  }

  return await res.json();
}

export async function getRequirements(payload, token) {
  const res = await fetch(`${API_BASE}/compliance/requirements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to get requirements");
  }

  return await res.json();
}

export async function getLawDetails(jurisdiction, token) {
  const res = await fetch(`${API_BASE}/compliance/law/${jurisdiction}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch law details");
  }

  return await res.json();
}

export async function getComplianceReport(token) {
  const res = await fetch(`${API_BASE}/compliance/report`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch compliance report");
  }

  return await res.json();
}