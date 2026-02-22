import { Link } from "react-router-dom";

export default function AddChoicePage() {
  return (
    <section className="choice-section">
      <h2>Legg til</h2>
      <div className="choice-cards">
        <Link to="/legg-til/kryss" className="choice-card">
          <span className="choice-icon">✕</span>
          <span className="choice-label">Kryss</span>
        </Link>
        <Link to="/legg-til/ice" className="choice-card">
          <span className="choice-icon">🧊</span>
          <span className="choice-label">Ice</span>
        </Link>
      </div>
    </section>
  );
}
