import { useEffect, useState } from "react";
import type { KryssEntry, KryssUpdatePayload, Person, Category } from "../types";

interface Props {
  entry: KryssEntry;
  people: Person[];
  onSave: (id: string, payload: KryssUpdatePayload) => Promise<void>;
  onClose: () => void;
}

export default function EditKryssModal({ entry, people, onSave, onClose }: Props) {
  const [date, setDate] = useState(entry.date);
  const [recipientPersonId, setRecipientPersonId] = useState(entry.recipientPersonId);
  const [category, setCategory] = useState<Category>(entry.category);
  const [minutesLate, setMinutesLate] = useState<string>(entry.minutesLate?.toString() ?? "");
  const [comment, setComment] = useState(entry.comment ?? "");
  const [kryssCount, setKryssCount] = useState<string>(entry.kryssCount?.toString() ?? "1");
  const [saving, setSaving] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: KryssUpdatePayload = {
        date,
        recipientPersonId,
        category,
        minutesLate: category === "Forsentkomming" ? Number(minutesLate) : null,
        comment: category !== "Forsentkomming" ? comment : (comment || null),
        kryssCount: category !== "Forsentkomming" ? Number(kryssCount) : null,
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
          <h3>Rediger kryss</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Dato
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Mottaker
            <select value={recipientPersonId} onChange={(e) => setRecipientPersonId(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            Kategori
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="Forsentkomming">Forsentkomming</option>
              <option value="Udugelighet">Udugelighet</option>
              <option value="Annet">Annet</option>
            </select>
          </label>
          {category === "Forsentkomming" && (
            <label>
              Minutter for sent
              <input
                type="number"
                min={0}
                value={minutesLate}
                onChange={(e) => setMinutesLate(e.target.value)}
                required
              />
            </label>
          )}
          {category !== "Forsentkomming" && (
            <>
              <label>
                Kommentar
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
              </label>
              <label>
                Antall kryss
                <input
                  type="number"
                  min={1}
                  value={kryssCount}
                  onChange={(e) => setKryssCount(e.target.value)}
                  required
                />
              </label>
            </>
          )}
          {category === "Forsentkomming" && (
            <label>
              Kommentar (valgfritt)
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>
          )}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Avbryt</button>
            <button type="submit" disabled={saving}>
              {saving ? "Lagrer…" : "Lagre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
