import { useState, useMemo } from "react";
import type { IceEntry, IceUpdatePayload, Person } from "../types";
import EditIceModal from "./EditIceModal";
import CustomSelect from "./CustomSelect";

interface Props {
  entries: IceEntry[];
  people: Person[];
  onDelete: (id: string) => void;
  onEdit: (id: string, payload: IceUpdatePayload) => Promise<void>;
  loading: boolean;
}

const PAGE_SIZE = 3;
const EXPAND_SIZE = 5;

function personName(people: Person[], id: string): string {
  return people.find((p) => p.id === id)?.name ?? id;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function IceTable({
  entries,
  people,
  onDelete,
  onEdit,
  loading,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [editing, setEditing] = useState<IceEntry | null>(null);
  const [filterPerson, setFilterPerson] = useState("");

  const peopleOptions = useMemo(
    () => [{ value: "", label: "Alle" }, ...people.map((p) => ({ value: p.id, label: p.name }))],
    [people]
  );

  if (loading) return <p className="loading">Laster…</p>;
  if (entries.length === 0) return <p className="empty">Urutta gjeng som ikke har Icet noen ennå...</p>;

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filterPerson
    ? sorted.filter((e) => e.iceePersonId === filterPerson || e.icerPersonId === filterPerson)
    : sorted;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const isExpanded = visibleCount > PAGE_SIZE;

  function handleDelete(id: string) {
    if (window.confirm("Er du sikker på at du vil slette denne icen?")) {
      onDelete(id);
    }
  }

  return (
    <div className="kryss-table-wrapper">
      <div className="table-header-row">
        <h2>Ice</h2>
        <div className="table-filter">
          <label className="table-filter-label">Filtrer person</label>
          <CustomSelect
            options={peopleOptions}
            value={filterPerson}
            onChange={(v) => { setFilterPerson(v); setVisibleCount(PAGE_SIZE); }}
            placeholder="Alle"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="empty">Ingen ice funnet.</p>
      ) : (
      <table className="kryss-table">
        <thead>
          <tr>
            <th>Dato</th>
            <th>Icet</th>
            <th>Icet av</th>
            <th>Kommentar</th>
            <th className="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          {visible.map((e) => (
            <tr key={e.id}>
              <td>{formatDate(e.date)}</td>
              <td>{personName(people, e.iceePersonId)}</td>
              <td>{personName(people, e.icerPersonId)}</td>
              <td className="comment-cell">{e.comment ?? "–"}</td>
              <td className="actions-col">
                <button
                  className="btn-edit"
                  onClick={() => setEditing(e)}
                  title="Rediger"
                >
                  ✎
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(e.id)}
                  title="Slett"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
      <div className="table-pagination">
        {hasMore && (
          <button
            className="btn-link"
            onClick={() => setVisibleCount((c) => Math.min(c + EXPAND_SIZE, sorted.length))}
          >
            Se mer
          </button>
        )}
        {isExpanded && (
          <button
            className="btn-link"
            onClick={() => setVisibleCount(PAGE_SIZE)}
          >
            Skjul
          </button>
        )}
      </div>

      {editing && (
        <EditIceModal
          entry={editing}
          people={people}
          onSave={onEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
