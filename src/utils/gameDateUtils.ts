/**
 * Helpers para la fecha de las partidas.
 *
 * Las partidas se juegan en Montevideo, Uruguay. Muchas veces arrancan cerca de
 * las 22:00 y terminan de madrugada, pero la partida "cuenta" para el día en que
 * empezó. Por eso, si en Montevideo son menos de las 2 AM, asumimos que la
 * partida arrancó el día anterior.
 */

export const GAME_TIMEZONE = 'America/Montevideo';

/** Hora (en Montevideo) antes de la cual se asume que la partida arrancó ayer. */
export const LATE_NIGHT_CUTOFF_HOUR = 2;

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
}

const zonedFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: GAME_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
});

/** Descompone un instante en sus partes de fecha/hora en Montevideo. */
function getZonedParts(date: Date = new Date()): ZonedParts {
  const parts = zonedFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(p => p.type === type)?.value ?? '0');

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Convierte partes de fecha al formato `YYYY-MM-DD` que usa `<input type="date">`. */
function toDateInputValue({ year, month, day }: Omit<ZonedParts, 'hour'>): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Suma (o resta) días a una fecha calendaria, sin depender de la timezone local. */
function shiftDays(parts: Omit<ZonedParts, 'hour'>, days: number): Omit<ZonedParts, 'hour'> {
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

/** Fecha de hoy en Montevideo, como `YYYY-MM-DD`. */
export function getMontevideoToday(now: Date = new Date()): string {
  return toDateInputValue(getZonedParts(now));
}

/** Fecha de ayer en Montevideo, como `YYYY-MM-DD`. */
export function getMontevideoYesterday(now: Date = new Date()): string {
  return toDateInputValue(shiftDays(getZonedParts(now), -1));
}

/**
 * ¿Estamos en la madrugada en Montevideo (antes de las 2 AM)? En ese caso se
 * asume que la partida en curso arrancó el día anterior.
 */
export function isLateNightInMontevideo(now: Date = new Date()): boolean {
  return getZonedParts(now).hour < LATE_NIGHT_CUTOFF_HOUR;
}

/**
 * Fecha preseleccionada para una nueva partida: ayer si son menos de las 2 AM en
 * Montevideo, hoy en cualquier otro caso.
 */
export function getDefaultGameDate(now: Date = new Date()): string {
  return isLateNightInMontevideo(now) ? getMontevideoYesterday(now) : getMontevideoToday(now);
}

/** Convierte `YYYY-MM-DD` a timestamp local al mediodía (evita corrimientos de timezone). */
export function dateInputToTimestamp(dateInput: string): number {
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime();
}
