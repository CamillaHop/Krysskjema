import { useCallback, useEffect, useState } from "react";
import {
  createKryss,
  deleteKryss,
  fetchKryss,
  fetchPeople,
} from "./api";
import KryssForm from "./components/KryssForm";
import KryssTable from "./components/KryssTable";
import SummaryPanel from "./components/SummaryPanel";
import type { KryssCreatePayload, KryssEntry, Person } from "./types";
import "./App.css";

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [entries, setEntries] = useState<KryssEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Load initial data ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ppl, kryss] = await Promise.all([fetchPeople(), fetchKryss()]);
      setPeople(ppl);
      setEntries(kryss);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunne ikke laste data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Handlers ── */
  async function handleCreate(payload: KryssCreatePayload) {
    await createKryss(payload);
    await loadData();
  }

  async function handleDelete(id: string) {
    try {
      await deleteKryss(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunne ikke slette");
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Krysskjema</h1>
        <p className="subtitle">Team Rystad</p>
      </header>

      {error && <div className="global-error">{error}</div>}

      <main className="app-main">
        <section className="form-section">
          <KryssForm people={people} onSubmit={handleCreate} />
        </section>

        <section className="summary-section">
          <SummaryPanel entries={entries} people={people} />
        </section>

        <section className="table-section">
          <KryssTable
            entries={entries}
            people={people}
            onDelete={handleDelete}
            loading={loading}
          />
        </section>
      </main>
    </div>
  );
}
