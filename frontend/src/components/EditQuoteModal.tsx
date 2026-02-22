import { useEffect, useState, useMemo } from "react";
import type { QuoteEntry, QuoteUpdatePayload, Person } from "../types";
import CustomSelect from "./CustomSelect";

interface Props {
  entry: QuoteEntry;
  people: Person[];
  onSave: (id: string, payload: QuoteUpdatePayload) => Promise<void>;
  onClose: () => void;
}

export default function EditQuoteModal({ entry, people, onSave, onClose }: Props) {
  const [personId, setPersonId] = useState(entry.personId);
  const [context, setContext] = useState(entry.context ?? "");
  const [text, setText] = useState(entry.text);
  const [saving, setSaving] = useState(false);

  const peopleOptions = useMemo(
    () => people.map((p) => ({ value: p.id, label: p.name })),
    [people]
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: QuoteUpdatePayload = {
        personId,
        context: context.trim() || null,
        text: text.trim(),
      };
      await onSave(entry.id, payload);
      onClose();
    } catch {
      alert("Kunne ikke lagre endringer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rediger sitat</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Person
            <CustomSelect
              options={peopleOptions}
              value={personId}
              onChange={setPersonId}
              placeholder="Velg person…"
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
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Avbryt</button>
            <button type="submit" disabled={saving || !text.trim() || !personId}>
              {saving ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
