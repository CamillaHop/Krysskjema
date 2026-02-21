import type { KryssEntry, Person } from "../types";

interface Props {
  entries: KryssEntry[];
  people: Person[];
}

export default function SummaryPanel({ entries, people }: Props) {
  // Total kryss per recipient
  const totals = new Map<string, number>();
  for (const e of entries) {
    totals.set(
      e.recipientPersonId,
      (totals.get(e.recipientPersonId) ?? 0) + e.kryssCount
    );
  }

  // Sort by total desc
  const sorted = people
    .map((p) => ({ person: p, total: totals.get(p.id) ?? 0 }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="summary-panel">
      <h2>Oppsummering</h2>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Totalt kryss</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ person, total }) => (
            <tr key={person.id}>
              <td>{person.name}</td>
              <td className="kryss-count">{total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
