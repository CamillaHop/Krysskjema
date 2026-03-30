import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import {
  createKryss,
  createIce,
  createQuote,
  deleteKryss,
  deleteIce,
  deleteQuote,
  updateQuote,
  updateKryss,
  updateIce,
  fetchKryss,
  fetchIce,
  fetchQuotes,
  fetchPeople,
} from "./api";
import type { KryssCreatePayload, KryssUpdatePayload, IceCreatePayload, IceUpdatePayload, QuoteCreatePayload, QuoteUpdatePayload, KryssEntry, IceEntry, QuoteEntry, Person } from "./types";
import KryssFormPage from "./pages/FormPage";
import IceFormPage from "./pages/IceFormPage";
import QuoteFormPage from "./pages/QuoteFormPage";
import AddChoicePage from "./pages/AddChoicePage";
import LandingPage from "./pages/LandingPage";
import LogPage from "./pages/LogPage";
import QuotesPage from "./pages/QuotesPage";
import StatsPage from "./pages/StatsPage";
import MyAccountPage from "./pages/MyAccountPage";
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

type ColorTheme = "red" | "blue";

function useColorTheme() {
  const [color, setColor] = useState<ColorTheme>(() => {
    return (localStorage.getItem("colorTheme") as ColorTheme) || "red";
  });

  useEffect(() => {
    document.documentElement.classList.remove("blue");
    if (color === "blue") document.documentElement.classList.add("blue");
    localStorage.setItem("colorTheme", color);
  }, [color]);

  const toggle = () => setColor((c) => (c === "red" ? "blue" : "red"));
  return [color, toggle] as const;
}

export default function App() {
  const [dark, toggleDark] = useDarkMode();
  const [colorTheme, toggleColor] = useColorTheme();
  const [people, setPeople] = useState<Person[]>([]);
  const [entries, setEntries] = useState<KryssEntry[]>([]);
  const [iceEntries, setIceEntries] = useState<IceEntry[]>([]);
  const [quotes, setQuotes] = useState<QuoteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, login, logout, getToken, loginAndGetToken } = useAuth();

  async function requireLogin(): Promise<string> {
    if (user) {
      const token = await getToken();
      if (token) return token;
    }
    return loginAndGetToken();
  }

  /* ── Load initial data ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ppl, kryss, ice, qts] = await Promise.all([fetchPeople(), fetchKryss(), fetchIce(), fetchQuotes()]);
      setPeople(ppl);
      setEntries(kryss);
      setIceEntries(ice);
      setQuotes(qts);
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

  async function handleCreateKryss(payload: KryssCreatePayload) {
    const token = await requireLogin();
    await createKryss(payload, token);
    await loadData();
  }

  async function handleCreateIce(payload: IceCreatePayload) {
    const token = await requireLogin();
    await createIce(payload, token);
    await loadData();
  }

  async function handleDelete(id: string) {
    try {
      const token = await requireLogin();
      await deleteKryss(id, token);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunne ikke slette");
    }
  }

  async function handleDeleteIce(id: string) {
    try {
      const token = await requireLogin();
      await deleteIce(id, token);
      setIceEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunne ikke slette");
    }
  }

  async function handleEditKryss(id: string, payload: KryssUpdatePayload) {
    const token = await requireLogin();
    await updateKryss(id, payload, token);
    await loadData();
  }

  async function handleEditIce(id: string, payload: IceUpdatePayload) {
    const token = await requireLogin();
    await updateIce(id, payload, token);
    await loadData();
  }

  async function handleCreateQuote(payload: QuoteCreatePayload) {
    const token = await requireLogin();
    await createQuote(payload, token);
    await loadData();
  }

  async function handleDeleteQuote(id: string) {
    try {
      const token = await requireLogin();
      await deleteQuote(id, token);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunne ikke slette");
    }
  }

  async function handleEditQuote(id: string, payload: QuoteUpdatePayload) {
    const token = await requireLogin();
    await updateQuote(id, payload, token);
    await loadData();
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div />
          <Link to="/" className="header-brand">
            <h1>TEAM RYSTAD</h1>
            <p className="subtitle">Krysskjema, Ice og Sitater</p>
          </Link>
          <div className="header-toggles">
            {user ? (
              <Link to="/konto" className="auth-avatar-link" title="Min konto">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="auth-avatar" referrerPolicy="no-referrer" />
                ) : (
                  <span className="auth-avatar-placeholder">
                    {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <button className="auth-btn auth-login" onClick={login}>Logg inn</button>
            )}
            <button
              className="color-toggle"
              onClick={toggleColor}
              aria-label="Bytt fargetema"
              title={colorTheme === "red" ? "Bytt til blått tema" : "Bytt til rødt tema"}
            >
              <span
                className="color-dot"
                style={{ background: colorTheme === "red" ? "#589EF8" : "#B32519" }}
              />
            </button>
            <button
              className="theme-toggle"
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              title={dark ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
            >
              {dark ? "☀︎" : "⏾"}
            </button>
          </div>
        </div>
        <nav className="app-nav">
          <NavLink to="/logg">Oversikt</NavLink>
          <NavLink to="/legg-til"
            className={({ isActive }) => {
              const onAdd = window.location.pathname.startsWith("/legg-til");
              return isActive || onAdd ? "active" : "";
            }}
          >
            Legg til
          </NavLink>
          <NavLink to="/sitater">Sitater</NavLink>
          <NavLink to="/statistikk">Statistikk</NavLink>
        </nav>
      </header>

      {error && <div className="global-error">{error}</div>}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/legg-til"
            element={
              user ? (
                <AddChoicePage />
              ) : (
                <section className="login-required">
                  <h2>Du er ikke logget inn</h2>
                  <p>Du må logge inn for å legge til.</p>
                  <button className="btn btn-primary" onClick={login}>
                    Logg inn med Google
                  </button>
                </section>
              )
            }
          />
          <Route
            path="/legg-til/kryss"
            element={
              user ? (
                <KryssFormPage people={people} onSubmit={handleCreateKryss} />
              ) : (
                <section className="login-required">
                  <h2>Du er ikke logget inn</h2>
                  <p>Du må logge inn for å legge til kryss.</p>
                  <button className="btn btn-primary" onClick={login}>
                    Logg inn med Google
                  </button>
                </section>
              )
            }
          />
          <Route
            path="/legg-til/ice"
            element={
              user ? (
                <IceFormPage people={people} onSubmit={handleCreateIce} />
              ) : (
                <section className="login-required">
                  <h2>Du er ikke logget inn</h2>
                  <p>Du må logge inn for å legge til ice.</p>
                  <button className="btn btn-primary" onClick={login}>
                    Logg inn med Google
                  </button>
                </section>
              )
            }
          />
          <Route
            path="/legg-til/sitat"
            element={
              user ? (
                <QuoteFormPage people={people} onSubmit={handleCreateQuote} />
              ) : (
                <section className="login-required">
                  <h2>Du er ikke logget inn</h2>
                  <p>Du må logge inn for å legge til sitater.</p>
                  <button className="btn btn-primary" onClick={login}>
                    Logg inn med Google
                  </button>
                </section>
              )
            }
          />
          <Route
            path="/sitater"
            element={
              <QuotesPage
                quotes={quotes}
                people={people}
                onDelete={handleDeleteQuote}
                onEdit={handleEditQuote}
                loading={loading}
              />
            }
          />
          <Route
            path="/logg"
            element={
              <LogPage
                entries={entries}
                iceEntries={iceEntries}
                people={people}
                onDelete={handleDelete}
                onDeleteIce={handleDeleteIce}
                onEditKryss={handleEditKryss}
                onEditIce={handleEditIce}
                loading={loading}
              />
            }
          />
          <Route
            path="/statistikk"
            element={
              <StatsPage
                entries={entries}
                iceEntries={iceEntries}
                people={people}
                loading={loading}
              />
            }
          />
          <Route
            path="/konto"
            element={
              user ? (
                <MyAccountPage
                  user={user}
                  people={people}
                  entries={entries}
                  iceEntries={iceEntries}
                  onLogout={logout}
                />
              ) : (
                <section className="login-required">
                  <h2>Du er ikke logget inn</h2>
                  <p>Logg inn for å se kontoen din.</p>
                  <button className="btn btn-primary" onClick={login}>
                    Logg inn med Google
                  </button>
                </section>
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}
