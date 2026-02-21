/**
 * Compute kryss count from minutes late (mirrors backend formula).
 *
 * raw = ln(1 + minutesLate)
 * if raw < 1 → 1
 * else standard 0.5‑up rounding to nearest int
 */
export function computeKryssForMinutes(minutesLate: number): number {
  if (minutesLate < 0) return 1;
  const raw = Math.log(1 + minutesLate);
  if (raw < 1) return 1;
  const intPart = Math.floor(raw);
  const frac = raw - intPart;
  return frac >= 0.5 ? intPart + 1 : intPart;
}
