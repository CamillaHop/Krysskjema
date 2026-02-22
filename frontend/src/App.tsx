import { useCallback, useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  createKryss,
  createIce,
  deleteKryss,
  fetchKryss,
  fetchPeople,
} from "./api";
import type { KryssCreatePayload, IceCreatePayload, KryssEntry, Person } from "./types";
import KryssFormPage from "./pages/FormPage";
import IceFormPage from "./pages/IceFormPage";
import AddChoicePage from "./pages/AddChoicePage";
import LogPage from "./pages/LogPage";
import StatsPage from "./pages/StatsPage";
import "./App.css";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

export default function App() {
  const [dark, toggleDark] = useDarkMode();
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
  const navigate = useNavigate();

  async function handleCreateKryss(payload: KryssCreatePayload) {
    await createKryss(payload);
    await loadData();
    navigate("/logg");
  }

  async function handleCreateIce(payload: IceCreatePayload) {
    await createIce(payload);
    await loadData();
    navigate("/logg");
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
        <div className="header-top">
          <div />
          <div>
            <h1>Team Rystad</h1>
            <p className="subtitle">Krysskjema og Ice</p>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            title={dark ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
          >
            {dark ? "☀︎" : "⏾"}

          </button>
        </div>
        <nav className="app-nav">
          <NavLink to="/logg">Oversikt</NavLink>
          <NavLink
            to="/"
            className={({ isActive }) => {
              const onAdd = window.location.pathname.startsWith("/legg-til");
              return isActive || onAdd ? "active" : "";
            }}
            end
          >
            Legg til
          </NavLink>
          <NavLink to="/statistikk">Statistikk</NavLink>
        </nav>
      </header>

      {error && <div className="global-error">{error}</div>}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<AddChoicePage />} />
          <Route
            path="/legg-til/kryss"
            element={
              <KryssFormPage people={people} onSubmit={handleCreateKryss} />
            }
          />
          <Route
            path="/legg-til/ice"
            element={
              <IceFormPage people={people} onSubmit={handleCreateIce} />
            }
          />
          <Route
            path="/logg"
            element={
              <LogPage
                entries={entries}
                people={people}
                onDelete={handleDelete}
                loading={loading}
              />
            }
          />
          <Route path="/statistikk" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  );
}
