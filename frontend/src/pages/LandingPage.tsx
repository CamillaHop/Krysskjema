import { Link } from "react-router-dom";
import { ClipboardList, PlusCircle, BarChart3, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <section className="landing">
      <h2 className="typewriter">Vær pilset...</h2>
      <div className="landing-nav">
        <Link to="/logg" className="landing-card">
          <ClipboardList className="landing-icon" size={48} />
          <span className="landing-label">Oversikt</span>
        </Link>
        <Link to="/legg-til" className="landing-card">
          <PlusCircle className="landing-icon" size={48} />
          <span className="landing-label">Legg til</span>
        </Link>
        <Link to="/sitater" className="landing-card">
          <MessageCircle className="landing-icon" size={48} />
          <span className="landing-label">Sitater</span>
        </Link>
        <Link to="/statistikk" className="landing-card">
          <BarChart3 className="landing-icon" size={48} />
          <span className="landing-label">Statistikk</span>
        </Link>
      </div>
    </section>
  );
}
