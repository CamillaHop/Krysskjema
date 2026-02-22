import QuoteForm from "../components/QuoteForm";
import type { QuoteCreatePayload, Person } from "../types";

interface Props {
  people: Person[];
  onSubmit: (payload: QuoteCreatePayload) => Promise<void>;
}

export default function QuoteFormPage({ people, onSubmit }: Props) {
  return (
    <section className="form-section">
      <QuoteForm people={people} onSubmit={onSubmit} />
    </section>
  );
}
