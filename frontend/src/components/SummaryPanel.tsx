import type { KryssEntry, IceEntry, Person } from "../types";

interface Props {
  entries: KryssEntry[];
  iceEntries: IceEntry[];
  people: Person[];
}

/** Render grouped tally marks: groups of 2 */
function TallyMarks({ count }: { count: number }) {
  const fullGroups = Math.floor(count / 2);
  const remainder = count % 2;

  return (
    <span className="tally-marks" aria-label={`${count} kryss`}>
      {Array.from({ length: fullGroups }, (_, i) => (
        <span key={`g${i}`} className="tally-group">
          {"✕✕"}
        </span>
      ))}
      {remainder > 0 && (
        <span className="tally-group">
          {"✕"}
        </span>
      )}
      <span className="tally-total">({count})</span>
    </span>
  );
}

export default function SummaryPanel({ entries, iceEntries, people }: Props) {
  // Total kryss per recipient
  const kryssTotals = new Map<string, number>();
  for (const e of entries) {
    kryssTotals.set(
      e.recipientPersonId,
      (kryssTotals.get(e.recipientPersonId) ?? 0) + e.kryssCount
    );
  }

  // Ice received (icee) and given (icer) per person
  const iceReceived = new Map<string, number>();
  const iceGiven = new Map<string, number>();
  for (const e of iceEntries) {
    iceReceived.set(e.iceePersonId, (iceReceived.get(e.iceePersonId) ?? 0) + 1);
    iceGiven.set(e.icerPersonId, (iceGiven.get(e.icerPersonId) ?? 0) + 1);
  }

  // Sort by total kryss desc
  const sorted = people
    .map((p) => ({
      person: p,
      kryss: kryssTotals.get(p.id) ?? 0,
      iced: iceReceived.get(p.id) ?? 0,
      icedOthers: iceGiven.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.kryss - a.kryss);

  return (
    <div className="summary-panel">
      <h2>Oppsummering</h2>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Kryss</th>
            <th>Enheter</th>
            <th>Blitt icet</th>
            <th>Icet andre</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ person, kryss, iced, icedOthers }) => (
            <tr key={person.id}>
              <td>{person.name}</td>
              <td>
                <TallyMarks count={kryss} />
              </td>
              <td className="enheter-count">{Math.ceil(kryss / 2) * 3}</td>
              <td className="ice-count">{iced}</td>
              <td className="ice-count">{icedOthers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
