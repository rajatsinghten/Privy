const API_BASE = "http://localhost:8000/api";

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
    // If backend returns a 401, this throws the "Could not validate credentials" message
    throw new Error(errorBody.detail || "Engine evaluation failed");
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