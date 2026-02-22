import IceForm from "../components/IceForm";
import type { IceCreatePayload, Person } from "../types";

interface Props {
  people: Person[];
  onSubmit: (payload: IceCreatePayload) => Promise<void>;
}

export default function IceFormPage({ people, onSubmit }: Props) {
  return (
    <section className="form-section">
      <IceForm people={people} onSubmit={onSubmit} />
    </section>
  );
}
