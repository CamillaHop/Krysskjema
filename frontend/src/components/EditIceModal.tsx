import { useEffect, useState } from "react";
import type { IceEntry, IceUpdatePayload, Person } from "../types";

interface Props {
  entry: IceEntry;
  people: Person[];
  onSave: (id: string, payload: IceUpdatePayload) => Promise<void>;
  onClose: () => void;
}

export default function EditIceModal({ entry, people, onSave, onClose }: Props) {
  const [date, setDate] = useState(entry.date);
  const [iceePersonId, setIceePersonId] = useState(entry.iceePersonId);
  const [icerPersonId, setIcerPersonId] = useState(entry.icerPersonId);
  const [comment, setComment] = useState(entry.comment ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: IceUpdatePayload = {
        date,
        iceePersonId,
        icerPersonId,
        comment: comment || null,
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
          <h3>Rediger ice</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Dato
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Icet
            <select value={iceePersonId} onChange={(e) => setIceePersonId(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            Icet av
            <select value={icerPersonId} onChange={(e) => setIcerPersonId(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            Kommentar (valgfritt)
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
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
