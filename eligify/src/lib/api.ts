/**
 * Shared API fetch utility with automatic JWT token refresh.
 *
 * If a request returns 401, it tries to refresh the access token using
 * the stored refresh token and retries the original request once.
 * If refresh also fails, clears tokens and redirects to login.
 */

const API_BASE = "http://127.0.0.1:8000";

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return null;

    try {
        const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        const newAccess = data.access;
        localStorage.setItem("access_token", newAccess);

        // If the server rotates refresh tokens, store the new one too
        if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
        }

        return newAccess;
    } catch {
        return null;
    }
}

/**
 * Wrapper around fetch that:
 * 1. Injects the Bearer token from localStorage
 * 2. Auto-refreshes on 401 and retries once
 * 3. Redirects to "/" if refresh fails
 *
 * @param url - Full URL or path (will be prefixed with API_BASE if relative)
 * @param options - Standard fetch RequestInit (headers will be merged)
 */
export async function fetchWithAuth(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

    const token = localStorage.getItem("access_token");
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let res = await fetch(fullUrl, { ...options, headers });

    // If 401, try to refresh and retry once
    if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            headers.set("Authorization", `Bearer ${newToken}`);
            res = await fetch(fullUrl, { ...options, headers });
        } else {
            // Refresh failed — clear tokens and redirect to login
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/";
        }
    }

    return res;
}
