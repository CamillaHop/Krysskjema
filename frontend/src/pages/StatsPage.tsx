import { useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { KryssEntry, IceEntry, Person } from "../types";

/* ── Red-shade palette for chart slices ── */
const COLORS = [
  "#B32519", "#d4382b", "#e04a3e", "#e8675d", "#f0857c",
  "#f4a29b", "#8f1e14", "#c93a2f", "#a13025", "#f7bfba",
  "#7a1a11", "#e95e52", "#d45046", "#b84a42", "#ff9e97",
];

interface Props {
  entries: KryssEntry[];
  iceEntries: IceEntry[];
  people: Person[];
  loading: boolean;
}

/* helper: person name by id */
function pName(people: Person[], id: string) {
  return people.find((p) => p.id === id)?.name ?? id;
}

/* ── Custom tooltip for pie charts ── */
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="stats-tooltip">
      <span className="stats-tooltip-label">{d.name}</span>
      <span className="stats-tooltip-value">{d.value}</span>
    </div>
  );
}

/* ── Custom legend ── */
function renderLegend(props: any) {
  const { payload } = props;
  return (
    <ul className="stats-legend">
      {payload.map((entry: any, i: number) => (
        <li key={i}>
          <span
            className="stats-legend-dot"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export default function StatsPage({ entries, iceEntries, people, loading }: Props) {
  /* ── Kryss distribution (total kryssCount per person) ── */
  const kryssData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      const name = pName(people, e.recipientPersonId);
      map[name] = (map[name] ?? 0) + (e.kryssCount ?? 1);
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries, people]);

  /* ── Ice given (icer) ── */
  const iceGivenData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of iceEntries) {
      const name = pName(people, e.icerPersonId);
      map[name] = (map[name] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [iceEntries, people]);

  /* ── Ice received (icee) ── */
  const iceReceivedData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of iceEntries) {
      const name = pName(people, e.iceePersonId);
      map[name] = (map[name] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [iceEntries, people]);

  /* ── Summary stats ── */
  const totalKryss = useMemo(
    () => entries.reduce((s, e) => s + (e.kryssCount ?? 1), 0),
    [entries],
  );

  const totalIce = iceEntries.length;

  const totalEnheter = useMemo(
    () => entries.reduce((s, e) => s + Math.ceil((e.kryssCount ?? 1) / 2) * 3, 0),
    [entries],
  );

  const avgKryssPerPerson = useMemo(() => {
    if (kryssData.length === 0) return "–";
    return (totalKryss / kryssData.length).toFixed(1);
  }, [totalKryss, kryssData]);

  const topCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      map[e.category] = (map[e.category] ?? 0) + 1;
    }
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "–";
  }, [entries]);

  const topKryssReceiver = kryssData[0]?.name ?? "–";
  const topIceReceiver = iceReceivedData[0]?.name ?? "–";
  const topIceGiver = iceGivenData[0]?.name ?? "–";

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 210;
    if (direction === "right") {
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft <= 4) {
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -cardWidth, behavior: "smooth" });
      }
    }
  }, []);

  if (loading) {
    return (
      <section className="stats-section">
        <h2>Statistikk</h2>
        <p className="empty">Laster…</p>
      </section>
    );
  }

  if (entries.length === 0 && iceEntries.length === 0) {
    return (
      <section className="stats-section">
        <h2>Statistikk</h2>
        <p className="empty">Ingen data ennå.</p>
      </section>
    );
  }

  return (
    <section className="stats-section">
      <h2>Statistikk</h2>

      {/* ── Summary cards carousel ── */}
      <div className="stats-cards-wrapper">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() => scrollCarousel("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="stats-cards" ref={scrollRef}>
          <div className="stat-card">
            <span className="stat-card-icon">✕</span>
            <span className="stat-card-value">{totalKryss}</span>
            <span className="stat-card-label">Totalt kryss</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">🏆</span>
            <span className="stat-card-value highlight">{topKryssReceiver}</span>
            <span className="stat-card-label">Flest kryss mottatt</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">🍺</span>
            <span className="stat-card-value">{totalEnheter}</span>
            <span className="stat-card-label">Totalt enheter</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">📊</span>
            <span className="stat-card-value">{avgKryssPerPerson}</span>
            <span className="stat-card-label">Snitt kryss per person</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">📂</span>
            <span className="stat-card-value highlight">{topCategory}</span>
            <span className="stat-card-label">Vanligste kategori</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">❄️</span>
            <span className="stat-card-value">{totalIce}</span>
            <span className="stat-card-label">Totalt ice</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">🥶</span>
            <span className="stat-card-value highlight">{topIceReceiver}</span>
            <span className="stat-card-label">Mest icet (mottatt)</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">🧊</span>
            <span className="stat-card-value highlight">{topIceGiver}</span>
            <span className="stat-card-label">Flest ice gitt</span>
          </div>
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() => scrollCarousel("right")}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Pie charts ── */}
      <div className="stats-charts">
        {/* Kryss distribution */}
        {kryssData.length > 0 && (
          <div className="chart-card">
            <h3>Fordeling av kryss</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={kryssData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent = 0 }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                >
                  {kryssData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Ice given */}
        {iceGivenData.length > 0 && (
          <div className="chart-card">
            <h3>Antall ice gitt</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={iceGivenData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent = 0 }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                >
                  {iceGivenData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Ice received */}
        {iceReceivedData.length > 0 && (
          <div className="chart-card">
            <h3>Antall ice mottatt</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={iceReceivedData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent = 0 }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={true}
                >
                  {iceReceivedData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
