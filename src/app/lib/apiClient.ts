// Shared fetch helper for admin/superadmin endpoints.
// Uses cookie-based auth (credentials: include).

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    return res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function apiGet<T>(path: string, params?: Record<string, unknown> | object): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const msg = await parseError(res);
    throw new ApiError(msg, res.status, msg);
  }
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown, params?: Record<string, unknown> | object): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const msg = await parseError(res);
    throw new ApiError(msg, res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const msg = await parseError(res);
    throw new ApiError(msg, res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(path, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    const msg = await parseError(res);
    throw new ApiError(msg, res.status, msg);
  }
}

function buildUrl(path: string, params?: Record<string, unknown> | object): string {
  if (!params) return path;
  const query = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, String(v));
    }
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Trigger a CSV download by hitting an endpoint that returns text/csv. */
export async function downloadCsv(path: string, suggestedName?: string): Promise<void> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) {
    const msg = await parseError(res);
    throw new ApiError(msg, res.status, msg);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName ?? "export.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
