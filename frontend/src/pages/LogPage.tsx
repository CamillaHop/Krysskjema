import KryssTable from "../components/KryssTable";
import type { KryssEntry, Person } from "../types";

interface Props {
  entries: KryssEntry[];
  people: Person[];
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function LogPage({ entries, people, onDelete, loading }: Props) {
  return (
    <section className="table-section">
      <KryssTable
        entries={entries}
        people={people}
        onDelete={onDelete}
        loading={loading}
      />
    </section>
  );
}
