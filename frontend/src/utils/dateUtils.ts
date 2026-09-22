const SPANISH_MONTHS: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  set: 8,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

export function parseFlexibleDate(dateStr: string | undefined | null): Date {
  if (!dateStr) return new Date(0);

  // 1. Try native Date constructor (works for ISO or RFC dates)
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;

  const clean = dateStr.trim();

  // 2. Format: "18 Abr 2026", "18 abr 2026", "18 abr. 2026"
  const spanishMatch = clean.match(
    /^(\d{1,2})\s+([a-zA-ZáéíóúÁÉÍÓÚ]{3,4})\.?\s+(\d{4})/i,
  );
  if (spanishMatch) {
    const day = parseInt(spanishMatch[1], 10);
    const monthKey = spanishMatch[2]
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .slice(0, 3);
    const year = parseInt(spanishMatch[3], 10);
    const month = SPANISH_MONTHS[monthKey] ?? 0;
    return new Date(year, month, day);
  }

  // 3. Format: "18/04/2026" or "18-04-2026"
  const slashMatch = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    const year = parseInt(slashMatch[3], 10);
    return new Date(year, month, day);
  }

  return new Date();
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
