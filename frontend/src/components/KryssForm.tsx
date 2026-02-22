import { useState, useEffect, useCallback, useMemo } from "react";
import type { Category, KryssCreatePayload, Person } from "../types";
import { computeKryssForMinutes } from "../kryssCalc";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";
import CustomSelect from "./CustomSelect";

const CATEGORIES: Category[] = ["Forsentkomming", "Udugelighet", "Annet"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  people: Person[];
  onSubmit: (payload: KryssCreatePayload) => Promise<void>;
}

export default function KryssForm({ people, onSubmit }: Props) {
  const [date, setDate] = useState(todayISO);
  const [recipientPersonId, setRecipientPersonId] = useState("");
  const [givenByPersonId, setGivenByPersonId] = useState("");
  const [category, setCategory] = useState<Category>("Forsentkomming");
  const [minutesLate, setMinutesLate] = useState<string>("");
  const [comment, setComment] = useState("");
  const [kryssCount, setKryssCount] = useState<string>("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    recipientPersonId !== "" ||
    givenByPersonId !== "" ||
    minutesLate !== "" ||
    comment !== "";
  useUnsavedGuard(isDirty);

  // Auto‑calculate kryss for Forsentkomming
  const computedKryss =
    category === "Forsentkomming" && minutesLate !== ""
      ? computeKryssForMinutes(Number(minutesLate))
      : null;

  // Reset conditional fields when category changes
  useEffect(() => {
    setMinutesLate("");
    setComment("");
    setKryssCount("1");
  }, [category]);

  const isForsentkomming = category === "Forsentkomming";

  const isValid = useCallback((): boolean => {
    if (!date || !recipientPersonId || !givenByPersonId) return false;
    if (isForsentkomming) {
      if (minutesLate === "" || Number(minutesLate) < 0) return false;
      if (!Number.isInteger(Number(minutesLate))) return false;
    } else {
      if (!comment.trim()) return false;
      const kc = Number(kryssCount);
      if (!kc || kc < 1 || !Number.isInteger(kc)) return false;
    }
    return true;
  }, [
    date,
    recipientPersonId,
    givenByPersonId,
    isForsentkomming,
    minutesLate,
    comment,
    kryssCount,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid()) return;

    setSubmitting(true);
    setError(null);

    const payload: KryssCreatePayload = {
      date,
      recipientPersonId,
      givenByPersonId,
      category,
      minutesLate: isForsentkomming ? Number(minutesLate) : null,
      comment: !isForsentkomming ? comment : comment || null,
      kryssCount: isForsentkomming ? computedKryss : Number(kryssCount),
    };

    try {
      await onSubmit(payload);
      // Reset form
      setDate(todayISO());
      setRecipientPersonId("");
      setGivenByPersonId("");
      setCategory("Forsentkomming");
      setMinutesLate("");
      setComment("");
      setKryssCount("1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  const peopleOptions = useMemo(
    () => people.map((p) => ({ value: p.id, label: p.name })),
    [people]
  );

  const categoryOptions = useMemo(
    () => CATEGORIES.map((c) => ({ value: c, label: c })),
    []
  );

  return (
    <form className="kryss-form" onSubmit={handleSubmit}>
      <h2>Legg til kryss</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <label>
          Dato
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Mottaker
          <CustomSelect
            options={peopleOptions}
            value={recipientPersonId}
            onChange={setRecipientPersonId}
            placeholder="Velg person…"
            required
          />
        </label>
        <label>
          Gitt av
          <CustomSelect
            options={peopleOptions}
            value={givenByPersonId}
            onChange={setGivenByPersonId}
            placeholder="Velg person…"
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Kategori
          <CustomSelect
            options={categoryOptions}
            value={category}
            onChange={(v) => setCategory(v as Category)}
            placeholder="Velg kategori…"
            showSearch={false}
          />
        </label>
      </div>

      {/* Conditional fields */}
      {isForsentkomming ? (
        <div className="form-row">
          <label>
            Minutter for sent
            <input
              type="number"
              min={0}
              step={1}
              value={minutesLate}
              onChange={(e) => setMinutesLate(e.target.value)}
              placeholder="0"
              required
            />
          </label>
          <label>
            Kryss (beregnet)
            <input
              type="number"
              value={computedKryss ?? ""}
              readOnly
              className="readonly"
            />
          </label>
        </div>
      ) : (
        <div className="form-row">
          <label>
            Kommentar
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Beskrivelse…"
              required
            />
          </label>
          <label>
            Antall kryss
            <input
              type="number"
              min={1}
              step={1}
              value={kryssCount}
              onChange={(e) => setKryssCount(e.target.value)}
              required
            />
          </label>
        </div>
      )}

      {/* Optional comment for Forsentkomming */}
      {isForsentkomming && (
        <div className="form-row">
          <label>
            Kommentar (valgfritt)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Evt. kommentar…"
            />
          </label>
        </div>
      )}

      <button type="submit" disabled={!isValid() || submitting}>
        {submitting ? "Lagrer…" : "Legg til"}
      </button>
    </form>
  );
}
