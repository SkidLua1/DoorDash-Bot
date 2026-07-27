export function getAuthHeaders() {
  const token = localStorage.getItem("dashboard_token") ?? "";
  return { "x-dashboard-token": token };
}

/**
 * The API base URL.
 * In development, Vite's proxy forwards /api → localhost:8080.
 * On Vercel (or any static host), set VITE_API_URL to your deployed API server
 * e.g. https://your-api.replit.app
 * Without it, /api calls hit the static host and return HTML — not JSON.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "";
