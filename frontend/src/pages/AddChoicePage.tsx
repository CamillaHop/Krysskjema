import { Link } from "react-router-dom";
import { X, Snowflake, MessageCircle } from "lucide-react";

export default function AddChoicePage() {
  return (
    <section className="choice-section">
      <h2>Hva ønsker du å legge til?</h2>
      <div className="choice-cards">
        <Link to="/legg-til/kryss" className="choice-card">
          <X className="choice-icon" size={36} />
          <span className="choice-label">Kryss</span>
        </Link>
        <Link to="/legg-til/ice" className="choice-card">
          <Snowflake className="choice-icon" size={36} />
          <span className="choice-label">Ice</span>
        </Link>
        <Link to="/legg-til/sitat" className="choice-card">
          <MessageCircle className="choice-icon" size={36} />
          <span className="choice-label">Sitat</span>
        </Link>
      </div>
    </section>
  );
}
