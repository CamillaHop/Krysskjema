import { useState, useMemo } from "react";
import type { QuoteEntry, Person } from "../types";
import CustomSelect from "../components/CustomSelect";

interface Props {
  quotes: QuoteEntry[];
  people: Person[];
  onDelete: (id: string) => void;
  loading: boolean;
}

function personName(people: Person[], id: string): string {
  return people.find((p) => p.id === id)?.name ?? id;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function QuotesPage({ quotes, people, onDelete, loading }: Props) {
  const [filterPerson, setFilterPerson] = useState("");

  const peopleOptions = useMemo(
    () => [{ value: "", label: "Alle" }, ...people.map((p) => ({ value: p.id, label: p.name }))],
    [people]
  );

  if (loading) return <p className="loading">Laster…</p>;

  const sorted = [...quotes].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );

  const filtered = filterPerson
    ? sorted.filter((q) => q.personId === filterPerson)
    : sorted;

  function handleDelete(id: string) {
    if (window.confirm("Er du sikker på at du vil slette dette sitatet?")) {
      onDelete(id);
    }
  }

  return (
    <section className="quotes-page">
      <div className="quotes-header">
        <h2>Sitater</h2>
        <div className="table-filter">
          <label className="table-filter-label">Filtrer person</label>
          <CustomSelect
            options={peopleOptions}
            value={filterPerson}
            onChange={setFilterPerson}
            placeholder="Alle"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">Ingen sitater funnet.</p>
      ) : (
        <div className="quotes-grid">
          {filtered.map((q) => (
            <article key={q.id} className="quote-card">
              <blockquote className="quote-text">"{q.text}"</blockquote>
              <div className="quote-meta">
                <span className="quote-person">
                  — {personName(people, q.personId)}
                </span>
                {q.context && (
                  <span className="quote-to-whom">
                    {q.context}
                  </span>
                )}
              </div>
              <div className="quote-footer">
                <span className="quote-date">
                  {formatDateTime(q.createdAt)}
                </span>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(q.id)}
                  title="Slett"
                >
                  ✕
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
