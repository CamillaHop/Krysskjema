import { useState, useMemo, useCallback } from "react";
import type { QuoteCreatePayload, Person } from "../types";
import CustomSelect from "./CustomSelect";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";

interface Props {
  people: Person[];
  onSubmit: (payload: QuoteCreatePayload) => Promise<void>;
}

export default function QuoteForm({ people, onSubmit }: Props) {
  const [personId, setPersonId] = useState("");
  const [context, setContext] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = personId !== "" || text !== "";
  useUnsavedGuard(isDirty);

  const peopleOptions = useMemo(
    () => people.map((p) => ({ value: p.id, label: p.name })),
    [people]
  );

  const isValid = useCallback((): boolean => {
    if (!personId) return false;
    if (!text.trim()) return false;
    return true;
  }, [personId, text]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid()) return;

    setSubmitting(true);
    setError(null);

    const payload: QuoteCreatePayload = {
      personId,
      context: context.trim() || null,
      text: text.trim(),
    };

    try {
      await onSubmit(payload);
      setPersonId("");
      setContext("");
      setText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="kryss-form" onSubmit={handleSubmit}>
      <h2>Legg til sitat</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <label>
          Person
          <CustomSelect
            options={peopleOptions}
            value={personId}
            onChange={setPersonId}
            placeholder="Hvem sa det…"
            required
          />
        </label>
        <label>
          Kontekst
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Om eller til person X"
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Sitat
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Skriv sitatet her…"
            required
            rows={3}
          />
        </label>
      </div>

      <button type="submit" disabled={!isValid() || submitting}>
        {submitting ? "Lagrer…" : "Legg til"}
      </button>
    </form>
  );
}
