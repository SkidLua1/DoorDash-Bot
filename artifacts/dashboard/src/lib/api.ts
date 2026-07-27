export function getAuthHeaders() {
  const token = localStorage.getItem("dashboard_token") ?? "";
  return { "x-dashboard-token": token };
}

/**
 * The API base URL.
 * Falls back to the bot-hosting.net server when VITE_API_URL is not set.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "https://hboy98ny4u.apps.bot-hosting.cloud";
