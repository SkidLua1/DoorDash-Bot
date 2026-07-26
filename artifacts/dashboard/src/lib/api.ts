export function getAuthHeaders() {
  const token = localStorage.getItem("dashboard_token") ?? "";
  return { "x-dashboard-token": token };
}
