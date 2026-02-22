import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="landing">
      <h2 className="typewriter">Vær pilset…</h2>
      <div className="landing-nav">
        <Link to="/logg" className="landing-card">
          <span className="landing-icon">📋</span>
          <span className="landing-label">Oversikt</span>
        </Link>
        <Link to="/legg-til" className="landing-card">
          <span className="landing-icon">＋</span>
          <span className="landing-label">Legg til</span>
        </Link>
        <Link to="/statistikk" className="landing-card">
          <span className="landing-icon">📊</span>
          <span className="landing-label">Statistikk</span>
        </Link>
      </div>
    </section>
  );
}
