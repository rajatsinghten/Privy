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

export async function requestDataAccess(payload, token) {
  const res = await fetch(`${API_BASE}/request-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Request failed");
  }

  return await res.json();
}

export async function fetchAuditLogs(token) {
  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Audit log fetch failed");
  }

  return await res.json();
}
