/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Given an absolute Date and an IANA tz string, return minutes-from-midnight in
// that tz. Converting an instant -> wall clock is a total function, so this
// never fails; the IANA name applies the offset in effect AT THAT INSTANT
// (handling DST automatically).
export const minutesInTz = (date, tz) => {
  const m = dayjs(date).tz(tz || 'UTC');
  return m.hour() * 60 + m.minute();
};

// Given a calendar day label (YYYY-MM-DD) and an IANA tz string, return that
// day's start/end as absolute Date instants. NB: on DST transition days the
// span between them is 23h or 25h, not exactly 24h — do not assume otherwise.
export const dayBoundsInTz = (dayStr, tz) => {
  const zone = tz || 'UTC';
  const startOfDay = dayjs.tz(dayStr, zone).startOf('day').toDate();
  const endOfDay = dayjs.tz(dayStr, zone).endOf('day').toDate();
  return { startOfDay, endOfDay };
};

// Convert an in/out ETA preset (as clicked in the UI) into an absolute Date
// instant, or null to clear it. Relative presets are `now + delta` (tz-agnostic
// instants); "evening"/"tomorrow" are anchored to a wall-clock time in the
// TARGET user's tz so they mean the same local moment regardless of who sets it.
export const etaPresetToInstant = (preset, tz) => {
  const zone = tz || 'UTC';
  switch (preset) {
    case '15m': return dayjs().add(15, 'minutes').toDate();
    case '30m': return dayjs().add(30, 'minutes').toDate();
    case '1h': return dayjs().add(1, 'hours').toDate();
    case '2h': return dayjs().add(2, 'hours').toDate();
    case '3h': return dayjs().add(3, 'hours').toDate();
    case '4h': return dayjs().add(4, 'hours').toDate();
    case 'evening': return dayjs().tz(zone).hour(18).minute(0).second(0).millisecond(0).toDate();
    case 'tomorrow': return dayjs().tz(zone).add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toDate();
    default: return null; // 'clear' or anything unrecognized
  }
};

// Display an ETA instant in the relevant user's tz. Shows time only when the
// instant falls on that user's current calendar day, otherwise date + time.
export const displayEtaInTz = (date, tz, dateFormat, timeFormat) => {
  if (!date) return '';
  const zone = tz || 'UTC';
  const m = dayjs(date).tz(zone);
  if (!m.isValid()) return ''; // guard against any legacy string ETA values
  const sameDay = m.format('YYYY-MM-DD') === dayjs().tz(zone).format('YYYY-MM-DD');
  return sameDay ? m.format(timeFormat) : `${m.format(dateFormat)} ${m.format(timeFormat)}`;
};

export const minutesToDuration = (minutesIn, showZeroHours) => {
  const minutesInAbs = Math.abs(minutesIn);
  const hoursOut = Math.floor(minutesInAbs / 60);
  const minutesOut = minutesInAbs % 60;
  const sign = minutesIn < 0 ? '-' : '';
  if (!showZeroHours && hoursOut < 1) {
    return `${sign}${minutesOut}m`;
  }
  return `${sign}${hoursOut}h ${minutesOut}m`;
};

export const minutesToHHMM = minutesIn => {
  let hoursOut = Math.floor(minutesIn / 60);
  let minutesOut = minutesIn % 60;

  // leading zeros for hours
  if (hoursOut === 0) {
    hoursOut = '00';
  } else if (hoursOut < 10) {
    hoursOut = `0${hoursOut}`;
  }

  // leading zeros for minutes
  if (minutesOut === 0) {
    minutesOut = '00';
  } else if (minutesOut < 10) {
    minutesOut = `0${minutesOut}`;
  }

  return `${hoursOut}:${minutesOut}`;
};
