import { useState, useCallback } from "react";
import type { IceCreatePayload, Person } from "../types";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  people: Person[];
  onSubmit: (payload: IceCreatePayload) => Promise<void>;
}

export default function IceForm({ people, onSubmit }: Props) {
  const [date, setDate] = useState(todayISO);
  const [iceePersonId, setIceePersonId] = useState("");
  const [icerPersonId, setIcerPersonId] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    iceePersonId !== "" || icerPersonId !== "" || comment !== "";
  useUnsavedGuard(isDirty);

  const isValid = useCallback((): boolean => {
    if (!date || !iceePersonId || !icerPersonId) return false;
    return true;
  }, [date, iceePersonId, icerPersonId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid()) return;

    setSubmitting(true);
    setError(null);

    const payload: IceCreatePayload = {
      date,
      iceePersonId,
      icerPersonId,
      comment: comment.trim() || null,
    };

    try {
      await onSubmit(payload);
      // Reset form
      setDate(todayISO());
      setIceePersonId("");
      setIcerPersonId("");
      setComment("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="kryss-form" onSubmit={handleSubmit}>
      <h2>Legg til ice</h2>

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
          Icee
          <select
            value={iceePersonId}
            onChange={(e) => setIceePersonId(e.target.value)}
            required
          >
            <option value="">Velg person…</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Icer
          <select
            value={icerPersonId}
            onChange={(e) => setIcerPersonId(e.target.value)}
            required
          >
            <option value="">Velg person…</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

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

      <button type="submit" disabled={!isValid() || submitting}>
        {submitting ? "Lagrer…" : "Legg til"}
      </button>
    </form>
  );
}
