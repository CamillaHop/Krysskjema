/* ── Domain types matching backend models ── */

export interface Person {
  id: string;
  name: string;
}

export type Category = "Forsentkomming" | "Udugelighet" | "Annet";

export interface KryssEntry {
  id: string;
  date: string;
  recipientPersonId: string;
  givenByPersonId?: string | null;
  category: Category;
  minutesLate: number | null;
  comment: string | null;
  kryssCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface KryssCreatePayload {
  date: string;
  recipientPersonId: string;
  givenByPersonId?: string | null;
  category: Category;
  minutesLate?: number | null;
  comment?: string | null;
  kryssCount?: number | null;
}

export interface KryssUpdatePayload {
  date?: string;
  recipientPersonId?: string;
  givenByPersonId?: string;
  category?: Category;
  minutesLate?: number | null;
  comment?: string | null;
  kryssCount?: number | null;
}

/* ── Ice ── */

export interface IceEntry {
  id: string;
  date: string;
  iceePersonId: string;
  icerPersonId: string;
  comment: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IceCreatePayload {
  date: string;
  iceePersonId: string;
  icerPersonId: string;
  comment?: string | null;
}

export interface IceUpdatePayload {
  date?: string;
  iceePersonId?: string;
  icerPersonId?: string;
  comment?: string | null;
}

/* ── Quotes ── */

export interface QuoteEntry {
  id: string;
  personId: string;
  context?: string | null;
  text: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface QuoteCreatePayload {
  personId: string;
  context?: string | null;
  text: string;
}

export interface QuoteUpdatePayload {
  personId?: string;
  context?: string | null;
  text?: string;
}
