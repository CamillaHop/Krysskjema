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
  givenByPersonId: string;
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
  givenByPersonId: string;
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
