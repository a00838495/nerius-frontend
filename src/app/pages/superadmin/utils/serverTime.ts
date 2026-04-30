// The backend emits naive UTC timestamps (datetime.utcnow()). Without a
// timezone marker, the browser parses ISO date-time strings as local time,
// which silently shifts the value. These helpers force UTC parsing and
// then render the result at a fixed UTC-6 offset so super-admins always see
// times anchored to the corporate timezone, regardless of viewer locale.

const UTC_MINUS_6_OFFSET_MS = 6 * 60 * 60 * 1000;

function parseAsUtc(input: string | Date | null | undefined): Date | null {
  if (input == null || input === "") return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;

  const trimmed = input.trim();
  // Already has timezone info (Z or ±hh:mm) — let JS parse natively.
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed);
  const iso = hasTz ? trimmed : `${trimmed}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatShifted(date: Date, opts: Intl.DateTimeFormatOptions): string {
  // Pre-shift then format in UTC so the rendered components reflect UTC-6.
  const shifted = new Date(date.getTime() - UTC_MINUS_6_OFFSET_MS);
  return new Intl.DateTimeFormat("es-MX", { ...opts, timeZone: "UTC" }).format(shifted);
}

export function formatServerDateTime(input: string | Date | null | undefined): string {
  const d = parseAsUtc(input);
  if (!d) return "—";
  const formatted = formatShifted(d, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${formatted} (UTC-6)`;
}

export function formatServerTime(input: string | Date | null | undefined): string {
  const d = parseAsUtc(input);
  if (!d) return "—";
  return formatShifted(d, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatServerHourMinute(input: string | Date | null | undefined): string {
  const d = parseAsUtc(input);
  if (!d) return "—";
  return formatShifted(d, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
