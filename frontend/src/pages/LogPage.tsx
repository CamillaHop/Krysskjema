import KryssTable from "../components/KryssTable";
import IceTable from "../components/IceTable";
import SummaryPanel from "../components/SummaryPanel";
import type { KryssEntry, KryssUpdatePayload, IceEntry, IceUpdatePayload, Person } from "../types";

interface Props {
  entries: KryssEntry[];
  iceEntries: IceEntry[];
  people: Person[];
  onDelete: (id: string) => void;
  onDeleteIce: (id: string) => void;
  onEditKryss: (id: string, payload: KryssUpdatePayload) => Promise<void>;
  onEditIce: (id: string, payload: IceUpdatePayload) => Promise<void>;
  loading: boolean;
}

export default function LogPage({ entries, iceEntries, people, onDelete, onDeleteIce, onEditKryss, onEditIce, loading }: Props) {
  return (
    <section className="table-section">
      <SummaryPanel entries={entries} iceEntries={iceEntries} people={people} />
      <KryssTable
        entries={entries}
        people={people}
        onDelete={onDelete}
        onEdit={onEditKryss}
        loading={loading}
      />
      <IceTable
        entries={iceEntries}
        people={people}
        onDelete={onDeleteIce}
        onEdit={onEditIce}
        loading={loading}
      />
    </section>
  );
}
