export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data as T;
}

export const AuthAPI = {
  requestCode: (email: string) =>
    post<{ ok: true; message: string }>("/api/auth/request-code", { email }),
  verifyCode: (email: string, code: string) =>
    post<{ ok: true; emailVerifiedToken: string }>("/api/auth/verify-code", { email, code }),
  register: (token: string, nickname: string, password: string) =>
    post<{ ok: true; session: string; user: { id: string; email: string; nickname: string } }>(
      "/api/auth/register", { token, nickname, password }
    ),
  login: (email: string, password: string) =>
    post<{ ok: true; session: string; user: { id: string; email: string; nickname: string } }>(
      "/api/auth/login", { email, password }
    ),
};
