import { useState, useMemo } from "react";
import type { KryssEntry, KryssUpdatePayload, Person } from "../types";
import EditKryssModal from "./EditKryssModal";
import CustomSelect from "./CustomSelect";

interface Props {
  entries: KryssEntry[];
  people: Person[];
  onDelete: (id: string) => void;
  onEdit: (id: string, payload: KryssUpdatePayload) => Promise<void>;
  loading: boolean;
}

const PAGE_SIZE = 3;
const EXPAND_SIZE = 5;

function personName(people: Person[], id: string): string {
  return people.find((p) => p.id === id)?.name ?? id;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export default function KryssTable({
  entries,
  people,
  onDelete,
  onEdit,
  loading,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [editing, setEditing] = useState<KryssEntry | null>(null);
  const [filterPerson, setFilterPerson] = useState("");

  const peopleOptions = useMemo(
    () => [{ value: "", label: "Alle" }, ...people.map((p) => ({ value: p.id, label: p.name }))],
    [people]
  );

  if (loading) return <p className="loading">Laster…</p>;
  if (entries.length === 0) return <p className="empty">Flink gjeng som ikke har fått noen kryss ennå!</p>;

  // Sort by date descending, then filter
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filterPerson
    ? sorted.filter((e) => e.recipientPersonId === filterPerson)
    : sorted;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const isExpanded = visibleCount > PAGE_SIZE;

  function handleDelete(id: string) {
    if (window.confirm("Er du sikker på at du vil slette dette krysset?")) {
      onDelete(id);
    }
  }

  return (
    <div className="kryss-table-wrapper">
      <div className="table-header-row">
        <h2>Kryss</h2>
        <div className="table-filter">
          <label className="table-filter-label">Filtrer mottaker</label>
          <CustomSelect
            options={peopleOptions}
            value={filterPerson}
            onChange={(v) => { setFilterPerson(v); setVisibleCount(PAGE_SIZE); }}
            placeholder="Alle"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="empty">Ingen kryss funnet.</p>
      ) : (
      <table className="kryss-table kryss-table-fixed">
        <colgroup>
          <col style={{ width: "9%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "7%" }} />
          <col />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Dato</th>
            <th>Mottaker</th>
            <th>Kategori</th>
            <th># Min.</th>
            <th>Kommentar</th>
            <th>Kryss</th>
            <th className="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          {visible.map((e) => (
            <tr key={e.id}>
              <td>{formatDate(e.date)}</td>
              <td>{personName(people, e.recipientPersonId)}</td>
              <td>{e.category}</td>
              <td>{e.minutesLate ?? "–"}</td>
              <td className="comment-cell">{e.comment ?? "–"}</td>
              <td className="kryss-count">{e.kryssCount}</td>
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
        <EditKryssModal
          entry={editing}
          people={people}
          onSave={onEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
