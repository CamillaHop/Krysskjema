import KryssForm from "../components/KryssForm";
import type { KryssCreatePayload, Person } from "../types";

interface Props {
  people: Person[];
  onSubmit: (payload: KryssCreatePayload) => Promise<void>;
}

export default function KryssFormPage({ people, onSubmit }: Props) {
  return (
    <section className="form-section">
      <KryssForm people={people} onSubmit={onSubmit} />
    </section>
  );
}
