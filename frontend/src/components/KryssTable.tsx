import type { KryssEntry, Person } from "../types";

interface Props {
  entries: KryssEntry[];
  people: Person[];
  onDelete: (id: string) => void;
  loading: boolean;
}

function personName(people: Person[], id: string): string {
  return people.find((p) => p.id === id)?.name ?? id;
}

export default function KryssTable({
  entries,
  people,
  onDelete,
  loading,
}: Props) {
  if (loading) return <p className="loading">Laster…</p>;
  if (entries.length === 0) return <p className="empty">Ingen kryss ennå.</p>;

  function handleDelete(id: string) {
    if (window.confirm("Er du sikker på at du vil slette dette krysset?")) {
      onDelete(id);
    }
  }

  return (
    <div className="kryss-table-wrapper">
      <h2>Oversikt</h2>
      <table className="kryss-table">
        <thead>
          <tr>
            <th>Dato</th>
            <th>Mottaker</th>
            <th>Gitt av</th>
            <th>Kategori</th>
            <th>Min. for sent</th>
            <th>Kommentar</th>
            <th>Kryss</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{personName(people, e.recipientPersonId)}</td>
              <td>{personName(people, e.givenByPersonId)}</td>
              <td>{e.category}</td>
              <td>{e.minutesLate ?? "–"}</td>
              <td className="comment-cell">{e.comment ?? "–"}</td>
              <td className="kryss-count">{e.kryssCount}</td>
              <td>
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
    </div>
  );
}
