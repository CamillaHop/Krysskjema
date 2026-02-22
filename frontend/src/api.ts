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
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

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

export function createKryss(payload: KryssCreatePayload): Promise<KryssEntry> {
  return request<KryssEntry>("/kryss", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateKryss(
  id: string,
  payload: KryssUpdatePayload
): Promise<KryssEntry> {
  return request<KryssEntry>(`/kryss/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteKryss(id: string): Promise<void> {
  return request<void>(`/kryss/${id}`, { method: "DELETE" });
}

/* ── Ice CRUD ── */

export function fetchIce(limit = 100): Promise<IceEntry[]> {
  return request<IceEntry[]>(`/ice?limit=${limit}`);
}

export function createIce(payload: IceCreatePayload): Promise<IceEntry> {
  return request<IceEntry>("/ice", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteIce(id: string): Promise<void> {
  return request<void>(`/ice/${id}`, { method: "DELETE" });
}

export function updateIce(
  id: string,
  payload: IceUpdatePayload
): Promise<IceEntry> {
  return request<IceEntry>(`/ice/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ── Quote CRUD ── */

export function fetchQuotes(limit = 200): Promise<QuoteEntry[]> {
  return request<QuoteEntry[]>(`/quotes?limit=${limit}`);
}

export function createQuote(payload: QuoteCreatePayload): Promise<QuoteEntry> {
  return request<QuoteEntry>("/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteQuote(id: string): Promise<void> {
  return request<void>(`/quotes/${id}`, { method: "DELETE" });
}

export function updateQuote(
  id: string,
  payload: QuoteUpdatePayload
): Promise<QuoteEntry> {
  return request<QuoteEntry>(`/quotes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
