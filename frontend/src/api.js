const API_URL = "http://localhost:8000/api/appointments";

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong.");
  }

  return data;
}

export function getAppointments(date = "", status = "") {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  const query = params.toString();
  return request(`${API_URL}${query ? `?${query}` : ""}`);
}

export function createAppointment(data) {
  return request(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAppointment(id, data) {
  return request(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function completeAppointment(id) {
  return request(`${API_URL}/${id}/complete`, { method: "PATCH" });
}

export function cancelAppointment(id) {
  return request(`${API_URL}/${id}/cancel`, { method: "PATCH" });
}
