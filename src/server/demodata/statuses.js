/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Statuses, Tenant } from '/src/shared/collections/collections.js';
import inOutOptions from '/src/server/initdata/inout-options.js';
import { Random } from 'meteor/random';

dayjs.extend(utc);
dayjs.extend(timezone);

// In/out status ids (see /src/server/initdata/inout-options.js):
// 1 IN, 2 LUNCH, 3 MEETING, 4 COURT, 5 REMOTE, 6 OUT, 7 VACATION.
// IN, MEETING, COURT and REMOTE are "work" statuses.

// Number of calendar days, counted back from the current day at demo creation,
// that demo data is generated for. Weekdays get a full workday; weekends are
// mostly OUT but a few people put in a couple of billable hours (see below).
// Read from the environment, falling back to 21 (~3 work weeks).
const DEMO_PERIOD_DAYS = Number.parseInt(process.env.DEMO_PERIOD_DAYS, 10) || 21;
// Court opening hours, minutes from local midnight (09:00-17:00).
const COURT_OPEN_MIN = 9 * 60;
const COURT_CLOSE_MIN = 17 * 60;
// At most this many of the demo users are on vacation at once.
const VACATION_USERS_MAX = 4;
// Average hours a demo user tracks on a normal working day. This is the main
// knob for overall workload - raise or lower it to make demo users busier or
// quieter. Individual days vary by +/- WORK_HOURS_VARIATION hours around it
// (clamped to a sane floor/ceiling), so it need not be exact. Defaults of 7 +/-
// 5 give the usual 2-12h spread.
const AVG_WORK_HOURS_PER_DAY = 7;
const WORK_HOURS_VARIATION = 5;

// random integer between min and max, inclusive of both ends
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// All calendar days within the `periodDays` window ending today (inclusive),
// oldest first, each as { dayStr: 'YYYY-MM-DD', weekend } reckoned in `refTz`.
const getDemoDays = (refTz, periodDays) => {
  const days = [];
  let cursor = dayjs().tz(refTz).startOf('day');
  for (let i = 0; i < periodDays; i += 1) {
    const dow = cursor.day(); // 0 Sun .. 6 Sat
    days.unshift({ dayStr: cursor.format('YYYY-MM-DD'), weekend: dow === 0 || dow === 6 });
    cursor = cursor.subtract(1, 'day');
  }
  return days;
};

const getRandomNoteGeneral = () => {
  const notes = [
    'Will check email occasionally',
    'Reachable by phone if urgent',
    'Checking messages every hour or so',
    'On chat, just slower to respond',
    'Reachable by text only',
    'Available by phone for urgent matters',
    'Back by end of day',
    'Back later today, not sure exactly when',
  ];
  return notes[Math.floor(Math.random() * notes.length)];
};

const getVacationNote = (returnLabel) => {
  const templates = [
    d => `Back ${d}, reachable by email for urgent matters`,
    d => `Back ${d}, only checking messages occasionally`,
    d => `Back ${d}, call my mobile if it's urgent`,
    d => `Returning ${d}, will not be checking email`,
    d => `Back ${d}, mostly offline until then`,
    d => `Back ${d}, contact my assistant if anything comes up`,
  ];
  return templates[Math.floor(Math.random() * templates.length)](returnLabel);
};

// Build one realistic working day as a contiguous chain of local-minute
// segments. Returns null for a day with no work at all (e.g. a personal day).
const buildWorkday = () => {
  // a few days have no work statuses at all
  if (Math.random() < 0.08) return null;

  // a person uses either IN or REMOTE for the whole day, not both, ~50/50
  const base = Math.random() < 0.5 ? '1' : '5';
  // arrive in the morning, 08:00-09:30
  const arrival = randomInt(8 * 60, 9 * 60 + 30);
  // total work statuses for the day, centred on the configured daily average
  const minWork = Math.max(30, (AVG_WORK_HOURS_PER_DAY - WORK_HOURS_VARIATION) * 60);
  const maxWork = Math.max(minWork, Math.min(14 * 60, (AVG_WORK_HOURS_PER_DAY + WORK_HOURS_VARIATION) * 60));
  const workMinutes = randomInt(minWork, maxWork);

  // a single lunch, usually starting at 12:00, between 12:00-14:00, 25-60 min,
  // placed so there is real work on both sides of it
  let lunch = null;
  const lunchEarliest = Math.max(12 * 60, arrival + 30);
  const lunchLatest = Math.min(14 * 60, arrival + workMinutes - 30);
  if (lunchLatest >= lunchEarliest) {
    // bias the start toward 12:00 by taking the earlier of two picks
    const start = Math.min(randomInt(lunchEarliest, lunchLatest), randomInt(lunchEarliest, lunchLatest));
    lunch = { start, dur: randomInt(25, 60) };
  }

  const departure = arrival + workMinutes + (lunch ? lunch.dur : 0);

  // base-work intervals (everything not lunch), which meetings/court carve into
  const free = lunch
    ? [[arrival, lunch.start], [lunch.start + lunch.dur, departure]]
    : [[arrival, departure]];

  const specials = [];
  // place a work sub-block of `dur` with status, constrained to [winMin, winMax]
  const insertSpecial = (dur, status, winMin, winMax) => {
    for (let i = 0; i < free.length; i += 1) {
      const [s, e] = free[i];
      const lo = Math.max(s, winMin);
      const hi = Math.min(e, winMax) - dur;
      if (hi >= lo) {
        const start = randomInt(lo, hi);
        const end = start + dur;
        specials.push({ start, end, status });
        const replacement = [];
        if (start > s) replacement.push([s, start]);
        if (end < e) replacement.push([end, e]);
        free.splice(i, 1, ...replacement);
        return;
      }
    }
  };

  // court: 30min-5h, entirely within court opening hours
  if (Math.random() < 0.15) insertSpecial(randomInt(30, 5 * 60), '4', COURT_OPEN_MIN, COURT_CLOSE_MIN);
  // meeting: 30min-3h, any time during the workday
  if (Math.random() < 0.35) insertSpecial(randomInt(30, 3 * 60), '3', 0, 24 * 60);

  const segs = [];
  for (const [s, e] of free) if (e > s) segs.push({ start: s, end: e, status: base });
  for (const sp of specials) segs.push({ start: sp.start, end: sp.end, status: sp.status });
  if (lunch) segs.push({ start: lunch.start, end: lunch.start + lunch.dur, status: '2' });
  segs.sort((a, b) => a.start - b.start);

  return { arrival, departure, segs };
};

// Build a weekend day. Most people are simply OUT all weekend. A small number
// actually update the board to IN/REMOTE and put in a couple of hours; their
// timesheet entries then flow from these statuses in the normal way. (Weekend
// work done while staying marked OUT is added separately in times.js.)
const buildWeekendDay = () => {
  if (Math.random() >= 0.03) return null; // only a few people mark themselves working

  const base = Math.random() < 0.5 ? '1' : '5'; // IN or REMOTE
  const start = randomInt(10 * 60, 14 * 60); // start late morning / early afternoon
  const end = Math.min(start + randomInt(90, 210), 20 * 60); // a couple of hours, capped at 20:00
  if (end - start < 30) return null;

  return { arrival: start, departure: end, segs: [{ start, end, status: base }] };
};

export default async () => {
  const tenant = await Tenant.findOneAsync();
  const refTz = tenant?.defaultTimezone || 'UTC';
  const demoDays = getDemoDays(refTz, DEMO_PERIOD_DAYS);
  if (!demoDays.length) return; // empty window, nothing to generate
  const now = new Date();

  const users = await Meteor.users.find({}).fetchAsync();

  // pick which users are currently on vacation (up to VACATION_USERS_MAX)
  const vacationUserIds = new Set();
  const shuffled = [...users].sort(() => Math.random() - 0.5);
  const vacationCount = Math.min(randomInt(2, VACATION_USERS_MAX), users.length);
  for (let i = 0; i < vacationCount; i += 1) vacationUserIds.add(shuffled[i]._id);

  const docs = [];

  for (const user of users) {
    const userTz = user.timezone || refTz;
    // convert a local minute-of-day on a demo day into an absolute instant
    const toAbs = (dayStr, minute) => dayjs.tz(dayStr, userTz).add(minute, 'minute').toDate();

    const onVacation = vacationUserIds.has(user._id);
    // a vacation covers roughly the last 3-8 calendar days through today; normal
    // days are generated for the days before it starts. Clamped to a valid
    // index so short DEMO_PERIOD_DAYS windows can't overrun the day list.
    const vacationStartIndex = onVacation
      ? Math.min(demoDays.length - 1, Math.max(1, demoDays.length - randomInt(3, 8)))
      : demoDays.length;

    // completed vacations earlier in the window: most users have taken 1-2
    // vacations (5-14 calendar days) that are long over, so archived VACATION
    // periods exist for "vacation days taken this year" questions. Only
    // generated when the window is long enough to fit them cleanly.
    const pastVacations = [];
    if (vacationStartIndex > 40) {
      const vacationsWanted = Math.random() < 0.25 ? 0 : Math.random() < 0.65 ? 1 : 2;
      let earliest = 5;
      for (let v = 0; v < vacationsWanted; v += 1) {
        const len = randomInt(5, 14);
        const latestStart = vacationStartIndex - 10 - len;
        if (latestStart <= earliest) break;
        const startIdx = randomInt(earliest, latestStart);
        pastVacations.push({ startIdx, endIdx: startIdx + len - 1 });
        earliest = startIdx + len + 20; // a real gap before any second vacation
      }
    }

    const segments = []; // { start, end, status, note, eta } absolute instants
    // OUT filler bridges the gaps (overnight, before arrival, after departure)
    let cursor = toAbs(demoDays[0].dayStr, 0); // local midnight of the first demo day

    for (let di = 0; di < vacationStartIndex; di += 1) {
      const pastVac = pastVacations.find(v => v.startIdx === di);
      if (pastVac) {
        const vacStartAbs = toAbs(demoDays[pastVac.startIdx].dayStr, 0);
        const vacEndAbs = toAbs(demoDays[pastVac.endIdx].dayStr, 24 * 60); // midnight after the last vacation day
        if (vacStartAbs > cursor) segments.push({ start: cursor, end: vacStartAbs, status: '6', note: '', eta: null });
        const returnLabel = dayjs(vacEndAbs).tz(userTz).format('D MMMM');
        segments.push({ start: vacStartAbs, end: vacEndAbs, status: '7', note: getVacationNote(returnLabel), eta: vacEndAbs });
        cursor = vacEndAbs;
        di = pastVac.endIdx; // skip the covered days; the loop resumes the day after
        continue;
      }

      const { dayStr, weekend } = demoDays[di];
      const day = weekend ? buildWeekendDay() : buildWorkday();
      if (!day) continue; // no work: stays OUT, bridged to the next worked day

      const arrivalAbs = toAbs(dayStr, day.arrival);
      if (arrivalAbs > cursor) segments.push({ start: cursor, end: arrivalAbs, status: '6', note: '', eta: null });
      for (const seg of day.segs) {
        segments.push({ start: toAbs(dayStr, seg.start), end: toAbs(dayStr, seg.end), status: seg.status, note: '', eta: null });
      }
      cursor = toAbs(dayStr, day.departure);
    }

    if (onVacation) {
      let returnDate = dayjs.utc(now).add(randomInt(3, 14), 'days');
      if (returnDate.day() === 6) returnDate = returnDate.add(2, 'days'); // Sat -> Mon
      else if (returnDate.day() === 0) returnDate = returnDate.add(1, 'days'); // Sun -> Mon
      const returnLabel = returnDate.tz(userTz).format('D MMMM');
      const vacStartAbs = toAbs(demoDays[vacationStartIndex].dayStr, 0);
      if (vacStartAbs > cursor) segments.push({ start: cursor, end: vacStartAbs, status: '6', note: '', eta: null });
      segments.push({ start: vacStartAbs, end: now, status: '7', note: getVacationNote(returnLabel), eta: returnDate.toDate() });
    } else if (cursor < now) {
      // trailing OUT after the last departure up to now
      segments.push({ start: cursor, end: now, status: '6', note: '', eta: null });
    }

    // drop anything in the future, clamp a straddling segment to now; likewise
    // drop/clamp anything before the account existed (new hires created inside
    // the demo window must not have board history predating their createdAt)
    const accountCreatedAt = user.createdAt || null;
    const emitted = [];
    for (const seg of segments) {
      if (seg.start >= now) continue;
      if (accountCreatedAt && seg.end <= accountCreatedAt) continue;
      if (accountCreatedAt && seg.start < accountCreatedAt) seg.start = accountCreatedAt;
      if (seg.end > now) seg.end = now;
      if (seg.end > seg.start) emitted.push(seg);
    }
    if (!emitted.length) continue;

    // occasional general note on a non-vacation user's current status
    const liveSeg = emitted[emitted.length - 1];
    if (!onVacation && liveSeg.status !== '7' && Math.random() < 0.25) {
      liveSeg.note = getRandomNoteGeneral();
    }

    // only completed segments become Statuses docs; the live segment exists
    // solely as the user's inOut* fields, matching the real app (setInOutSelf
    // inserts history only on status change) — monitors synthesize the live
    // segment from the user doc, so storing it too would double-count it
    for (const seg of emitted) {
      if (seg === liveSeg) continue;
      const option = inOutOptions.find(opt => opt.id === seg.status);
      docs.push({
        _id: Random.id(),
        userId: user._id,
        start: seg.start,
        end: seg.end,
        status: seg.status,
        statusText: option?.text || '',
        work: !!option?.work,
        note: seg.note,
        eta: seg.eta,
        tz: userTz,
        updaters: [{ id: user._id, name: user.name }],
      });
    }

    // the user's live board status is whatever is active at `now`
    await Meteor.users.updateAsync(
      { _id: user._id },
      {
        $set: {
          inOutStatus: liveSeg.status,
          inOutNote: liveSeg.note,
          inOutETA: liveSeg.eta,
          inOutUpdateById: user._id,
          inOutUpdateByName: user.name,
          inOutUpdateAt: liveSeg.start,
          inOutUpdaters: [{ id: user._id, name: user.name }],
        },
      },
    );
  }

  if (docs.length) await Statuses.rawCollection().insertMany(docs);
};
