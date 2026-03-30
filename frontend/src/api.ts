/* ── API client — all backend communication goes through here ── */

import type {
  KryssCreatePayload,
  KryssEntry,
  KryssUpdatePayload,
  Person,
  IceCreatePayload,
  IceEntry,
  IceUpdatePayload,
  QuoteCreatePayload,
  QuoteEntry,
  QuoteUpdatePayload,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(
  path: string,
  options?: RequestInit,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    throw new Error("Du må være innlogget for å gjøre dette");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  // 204 No Content (e.g. DELETE)
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

/* ── People ── */

export function fetchPeople(): Promise<Person[]> {
  return request<Person[]>("/people");
}

/* ── Kryss CRUD ── */

export function fetchKryss(limit = 100): Promise<KryssEntry[]> {
  return request<KryssEntry[]>(`/kryss?limit=${limit}`);
}

export function createKryss(payload: KryssCreatePayload, token?: string | null): Promise<KryssEntry> {
  return request<KryssEntry>("/kryss", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function updateKryss(
  id: string,
  payload: KryssUpdatePayload,
  token?: string | null,
): Promise<KryssEntry> {
  return request<KryssEntry>(`/kryss/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteKryss(id: string, token?: string | null): Promise<void> {
  return request<void>(`/kryss/${id}`, { method: "DELETE" }, token);
}

/* ── Ice CRUD ── */

export function fetchIce(limit = 100): Promise<IceEntry[]> {
  return request<IceEntry[]>(`/ice?limit=${limit}`);
}

export function createIce(payload: IceCreatePayload, token?: string | null): Promise<IceEntry> {
  return request<IceEntry>("/ice", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteIce(id: string, token?: string | null): Promise<void> {
  return request<void>(`/ice/${id}`, { method: "DELETE" }, token);
}

export function updateIce(
  id: string,
  payload: IceUpdatePayload,
  token?: string | null,
): Promise<IceEntry> {
  return request<IceEntry>(`/ice/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}

/* ── Quote CRUD ── */

export function fetchQuotes(limit = 200): Promise<QuoteEntry[]> {
  return request<QuoteEntry[]>(`/quotes?limit=${limit}`);
}

export function createQuote(payload: QuoteCreatePayload, token?: string | null): Promise<QuoteEntry> {
  return request<QuoteEntry>("/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteQuote(id: string, token?: string | null): Promise<void> {
  return request<void>(`/quotes/${id}`, { method: "DELETE" }, token);
}

export function updateQuote(
  id: string,
  payload: QuoteUpdatePayload,
  token?: string | null,
): Promise<QuoteEntry> {
  return request<QuoteEntry>(`/quotes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }, token);
}
