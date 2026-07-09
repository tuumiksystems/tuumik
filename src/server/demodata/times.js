/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Times, Statuses, Projects, Tenant } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { Random } from 'meteor/random';

dayjs.extend(utc);
dayjs.extend(timezone);

// Timesheet entries are derived from the in/out work statuses generated in
// statuses.js, so the timesheet agrees with the in/out board: general tasks are
// logged during IN/REMOTE periods, a court hearing during each COURT period and
// a meeting during each MEETING period. Non-work statuses (lunch, out, vacation)
// produce no time entries. Entries are deliberately not stacked edge-to-edge:
// there is a ramp-up before the first task of a period and short breaks between
// tasks, so the timesheet does not line up exactly with the board.

// work status ids (see /src/server/initdata/inout-options.js)
const IN = '1';
const MEETING = '3';
const COURT = '4';
const REMOTE = '5';

// Fraction of a person's IN/REMOTE (desk-work) time that ends up tracked as
// billable hours. The rest becomes a ramp-up before the first task plus short
// breaks between tasks, so the timesheet does not fill the whole work period.
// Each user gets a personal base drawn from [MIN, MAX] (their tracking
// discipline) and each work period wobbles around it by up to JITTER, so
// firm-wide utilization shows a realistic spread instead of one flat ratio.
// Controls desk work only - court and meeting periods are billed in full and
// are unaffected.
const BILLABLE_COVERAGE_MIN = 0.5;
const BILLABLE_COVERAGE_MAX = 0.9;
const BILLABLE_COVERAGE_JITTER = 0.08;

const DAY_MS = 24 * 60 * 60 * 1000;

// random integer between min and max, inclusive of both ends
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// split `total` minutes into `parts` non-negative integers summing exactly to
// `total`, distributed with some randomness (used to scatter the non-billable
// idle time across the breaks between tasks)
const splitMinutes = (total, parts) => {
  if (parts <= 0) return [];
  if (total <= 0) return new Array(parts).fill(0);
  const weights = Array.from({ length: parts }, () => Math.random() + 0.2);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / weightSum) * total);
  const ints = raw.map(Math.floor);
  let remainder = total - ints.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => { if (remainder > 0) { ints[i] += 1; remainder -= 1; } });
  return ints;
};

const getRandomPleading = () => pick(['complaint', 'counterclaim', 'cross-claim', 'demurrer', 'cross-complaint', 'third party complaint']);
const getRandomHearing = () => pick(['court of first instance', 'district court']);
const getRandomAgreement = () => pick([
  'Loan Agreement', 'Share Purchase Agreement', 'Sales Agreement', 'Lease Agreement',
  'Non-Disclosure Agreement', 'Term Sheet', 'Letter of Intent', 'License Agreement',
  'Founders Agreement', 'Employment Agreement', 'Option Agreement', 'Shareholders Agreement',
  'Settlement Agreement',
]);
const getRandomAnalysisTopic = () => pick([
  'tax residency in EU', 'set-off of claims', 'penalties for unlawful disclosure of confidential data',
  'prerequisites for exportation of restricted goods', 'compensation of procedural expenses',
  'possibilities to demand evidence from third parties', 'termination of joint ownership',
  'limitations on establishment of SPVs', 'terms for filing claims in insolvency proceedings',
  'limitations of expert opinions in civil process', 'data protection requirements',
  'zoning requirements pertaining to wind generators',
]);
const getRandomEmailPhoneTopic = () => pick([
  'state fee', 'settlement negotiations', 'outstanding invoices', 'payment details',
  'additional documents', 'additional claims', 'closing details', 'third party contacts',
  'meeting', 'compensation of procedural expenses', 'press release', 'review of statements',
]);
const getRandomPersons = () => pick([
  'S. Barnes', 'P. Eastgate', 'F. Williams', 'L. Jones', 'E. Murphy', 'S. Wilson', 'T. Smith',
  'C. Anderson', 'A. Davies', 'J. Brown and A. Morton', 'S. Roberts and R. Garcia', 'O. Walsh and J. Lee',
]);
const getRandomInternalComment = () => pick([
  'This might constitute a violation of client agreement terms',
  'Perhaps we should not disclose performing this task?',
  'Should this be modified into something more general?',
  'NB! A potential risk with regard to other proceedings!',
]);

// tasks suitable for a general working period (IN or REMOTE) - deskwork and
// correspondence, deliberately excluding court hearings and meetings, which
// are represented by their own in/out statuses. Each description is paired
// with the matching task type from /src/server/initdata/taskgroups.js; the
// type lands on the entry only for projects with useTaskTypes.
const getGeneralTask = () => {
  const tasks = [
    () => ({ taskDesc: `drafting of ${getRandomPleading()}`, taskType: 'preparation of pleading:' }),
    () => ({ taskDesc: `drafting of ${getRandomAgreement()}`, taskType: 'preparation of agreement:' }),
    () => ({ taskDesc: `drafting of amendments to ${getRandomAgreement()}`, taskType: 'preparation of amendments to agreement:' }),
    () => ({ taskDesc: `review of ${getRandomAgreement()}`, taskType: 'review of document:' }),
    () => ({ taskDesc: `legal analysis re ${getRandomAnalysisTopic()}`, taskType: 'legal analysis:' }),
    () => ({ taskDesc: `drafting of memorandum re ${getRandomAnalysisTopic()}`, taskType: 'preparation of memorandum:' }),
    () => ({ taskDesc: `drafting of email to ${getRandomPersons()} re ${getRandomEmailPhoneTopic()}`, taskType: 'preparation of email:' }),
    () => ({ taskDesc: `telephone call with ${getRandomPersons()} re ${getRandomEmailPhoneTopic()}`, taskType: 'telephone call:' }),
  ];
  return pick(tasks)();
};

const getTaskForStatus = (status) => {
  if (status === COURT) return { taskDesc: `court hearing, ${getRandomHearing()}`, taskType: 'court hearing:' };
  if (status === MEETING) return { taskDesc: `meeting with ${getRandomPersons()}`, taskType: 'meeting:' };
  return getGeneralTask();
};

// A small share of entries carry a tag color the way a real firm uses them:
// red = write-off / do-not-bill, yellow = needs review, green = approved.
const getRandomTag = () => {
  const r = Math.random();
  if (r < 0.02) return { tagColor: 'red', tagText: pick(['do not bill', 'write-off']) };
  if (r < 0.045) return { tagColor: 'yellow', tagText: pick(['review before invoicing', 'check description with partner']) };
  if (r < 0.06) return { tagColor: 'green', tagText: 'approved for invoicing' };
  return { tagColor: '', tagText: '' };
};

export default async () => {
  const projects = await Projects.find({}).fetchAsync();
  if (!projects.length) return;

  const workStatuses = [IN, MEETING, COURT, REMOTE];
  const users = await Meteor.users.find({}).fetchAsync();
  const now = new Date();

  // Projects are picked uniformly at random for every entry - any user can log
  // time on any matter, so each timesheet spans random projects. The only
  // constraint is that a project must already exist on the entry's date, so no
  // entry ever predates its project or client.
  const pickProjectFor = entryTime => {
    const eligible = projects.filter(p => p.createdAt <= entryTime);
    return eligible.length ? pick(eligible) : null;
  };

  const docs = [];

  for (const user of users) {
    // the user's personal tracking profile: how much of a desk-work period they
    // bill, and whether they log same-day or habitually enter time days later
    const coverageBase = BILLABLE_COVERAGE_MIN + Math.random() * (BILLABLE_COVERAGE_MAX - BILLABLE_COVERAGE_MIN);
    const maxLoggingDelayDays = Math.random() < 0.2 ? randomInt(1, 5) : 0;

    // the user's generated in/out work periods, chronological
    const segments = await Statuses.find(
      { userId: user._id, status: { $in: workStatuses } },
      { fields: { start: 1, end: 1, status: 1, tz: 1 }, sort: { start: 1 } },
    ).fetchAsync();

    // the live board status is not stored in Statuses (it exists only on the
    // user doc, see statuses.js), so synthesize it to generate entries for the
    // currently running work period as well
    if (workStatuses.includes(user.inOutStatus) && user.inOutUpdateAt < now) {
      segments.push({ start: user.inOutUpdateAt, end: now, status: user.inOutStatus, tz: user.timezone });
    }

    for (const seg of segments) {
      const tz = seg.tz || user.timezone || 'UTC';
      const localStart = dayjs(seg.start).tz(tz);
      const localMidnight = localStart.startOf('day');
      // whole-minute local offsets from midnight for this work period
      const segStartMin = localStart.hour() * 60 + localStart.minute();
      const localEnd = dayjs(seg.end).tz(tz);
      const segEndMin = localEnd.hour() * 60 + localEnd.minute();
      if (segEndMin <= segStartMin) continue; // sub-minute period, skip

      // day marker: UTC midnight + 1ms of the local calendar date
      const date = dayjs.utc(localStart.format('YYYY-MM-DD')).millisecond(1).toDate();

      // split the period into time entries. A court hearing / meeting is logged
      // as a single entry matching the period. General (desk) work bills only a
      // BILLABLE_COVERAGE fraction of the period: that much is chopped into
      // tasks, and the remaining idle time becomes a ramp-up before the first
      // task plus short breaks between and after tasks.
      const chunks = [];
      if (seg.status === COURT || seg.status === MEETING) {
        chunks.push([segStartMin, segEndMin]);
      } else {
        const periodLen = segEndMin - segStartMin;
        const coverage = Math.min(0.95, Math.max(0.3, coverageBase + (Math.random() * 2 - 1) * BILLABLE_COVERAGE_JITTER));
        const billable = Math.round(periodLen * coverage);
        if (billable >= 15) {
          // chop the billable time into tasks
          const taskLens = [];
          let remaining = billable;
          while (remaining >= 15) {
            let len = Math.min(remaining, randomInt(20, 150));
            if (remaining - len < 15) len = remaining; // absorb a tiny remainder
            taskLens.push(len);
            remaining -= len;
          }
          // ramp-up before the first task (usually the longest idle stretch),
          // then scatter the rest of the idle time between and after tasks
          const idle = periodLen - billable;
          const rampUp = randomInt(Math.floor(idle * 0.2), Math.floor(idle * 0.6));
          const gaps = splitMinutes(idle - rampUp, taskLens.length);
          let cur = segStartMin + rampUp;
          taskLens.forEach((len, i) => {
            chunks.push([cur, cur + len]);
            cur += len + gaps[i];
          });
        }
      }

      for (const [startMinute, endMinute] of chunks) {
        const task = getTaskForStatus(seg.status);
        const entryEnd = localMidnight.add(endMinute, 'minute').toDate();
        const project = pickProjectFor(entryEnd);
        if (!project) continue; // no project existed yet on this date
        // late loggers enter time up to a few days after the work happened
        const loggedAt = new Date(Math.min(now.getTime(), entryEnd.getTime() + randomInt(0, maxLoggingDelayDays) * DAY_MS));
        docs.push({
          _id: Random.id(),
          date,
          owner: user._id,
          startMinute,
          endMinute,
          plan: false,
          projectId: project._id,
          clientId: project.clientId,
          taskDesc: task.taskDesc,
          taskDescNormalized: normalizeStringForAC(task.taskDesc),
          ...(project.useTaskTypes ? { taskType: task.taskType } : {}),
          intCom: Math.random() < 0.05 ? getRandomInternalComment() : '',
          ...getRandomTag(),
          tz,
          createdAt: loggedAt,
          createdBy: { id: user._id, name: user.name },
          modifiedAt: loggedAt,
          modifiedBy: { id: user._id, name: user.name },
        });
      }
    }
  }

  // Weekend work done while staying marked OUT on the in/out board: a few people
  // each weekend day track a short block of hours even though their status stays
  // OUT (no backing work status exists, so these are added directly here). Days
  // where the user already has tracked work (they marked IN/REMOTE) or is on
  // vacation are skipped, which also guarantees no overlap with existing entries.
  const tenant = await Tenant.findOneAsync();
  const refTz = tenant?.defaultTimezone || 'UTC';
  // mirrors DEMO_PERIOD_DAYS in statuses.js so the two cover the same window
  const periodDays = Number.parseInt(process.env.DEMO_PERIOD_DAYS, 10) || 21;

  // weekend calendar dates within the demo window (oldest first)
  const weekendDays = [];
  let dcur = dayjs().tz(refTz).startOf('day');
  for (let i = 0; i < periodDays; i += 1) {
    const dow = dcur.day(); // 0 Sun .. 6 Sat
    if (dow === 0 || dow === 6) weekendDays.unshift(dcur.format('YYYY-MM-DD'));
    dcur = dcur.subtract(1, 'day');
  }

  // calendar dates (per user) that already have tracked work, for a quick skip
  const workedDayKeys = new Set(docs.map(d => `${d.owner}|${d.date.getTime()}`));

  for (const user of users) {
    const tz = user.timezone || refTz;
    // all of the user's vacation periods (current and completed), to keep
    // people off weekend work while away
    const vacations = await Statuses.find(
      { userId: user._id, status: '7' },
      { fields: { start: 1, end: 1 } },
    ).fetchAsync();

    for (const dayStr of weekendDays) {
      if (Math.random() >= 0.08) continue; // only a few people per weekend day

      const date = dayjs.utc(dayStr).millisecond(1).toDate();
      if (workedDayKeys.has(`${user._id}|${date.getTime()}`)) continue; // marked IN/REMOTE that day

      const dayStart = dayjs.tz(dayStr, tz);
      if (user.createdAt && dayStart.toDate() < user.createdAt) continue; // account didn't exist yet
      if (vacations.some(vac => vac.start < dayStart.add(1, 'day').toDate() && vac.end > dayStart.toDate())) continue; // on vacation

      const dur = randomInt(30, 150); // 30 min to 2.5h
      const startMinute = randomInt(9 * 60, 18 * 60 - dur); // sometime during the day
      const endMinute = startMinute + dur;
      const entryEnd = dayStart.add(endMinute, 'minute').toDate();
      if (entryEnd > now) continue; // don't create future entries on today

      const task = getGeneralTask();
      const project = pickProjectFor(entryEnd);
      if (!project) continue; // no project existed yet on this date
      // weekend work is often entered on Monday rather than on the day itself
      const loggedAt = new Date(Math.min(now.getTime(), entryEnd.getTime() + (Math.random() < 0.5 ? randomInt(1, 3) : 0) * DAY_MS));
      docs.push({
        _id: Random.id(),
        date,
        owner: user._id,
        startMinute,
        endMinute,
        plan: false,
        projectId: project._id,
        clientId: project.clientId,
        taskDesc: task.taskDesc,
        taskDescNormalized: normalizeStringForAC(task.taskDesc),
        ...(project.useTaskTypes ? { taskType: task.taskType } : {}),
        intCom: Math.random() < 0.05 ? getRandomInternalComment() : '',
        ...getRandomTag(),
        tz,
        createdAt: loggedAt,
        createdBy: { id: user._id, name: user.name },
        modifiedAt: loggedAt,
        modifiedBy: { id: user._id, name: user.name },
      });
      // at most one OUT weekend block per user per day, so nothing else can overlap it
      workedDayKeys.add(`${user._id}|${date.getTime()}`);
    }
  }

  // Planned (plan:true) entries: a small handful of forward-scheduled tasks,
  // 1-3 days in the future, so "what's scheduled" questions have data. Kept
  // deliberately rare (~PLAN_ENTRIES_TARGET across the whole firm) and always
  // in the future - actual entries never extend past "now" and each user's
  // planned blocks for a day are laid out sequentially, so no time entry can
  // overlap another one.
  const PLAN_ENTRIES_TARGET = 10;
  const planDayOffsets = [1, 2, 3];
  const planUsers = [...users].sort(() => Math.random() - 0.5);
  let planCount = 0;
  for (const user of planUsers) {
    if (planCount >= PLAN_ENTRIES_TARGET) break;

    const tz = user.timezone || refTz;
    // offsets are reckoned in the user's own calendar, so a plan is always
    // genuinely 1-3 days in that user's future
    const dayStart = dayjs().tz(tz).startOf('day').add(pick(planDayOffsets), 'day');
    const dow = dayStart.day();
    if (dow === 0 || dow === 6) continue; // plans land on weekdays (user's local calendar)
    if (user.inOutStatus === '7' && user.inOutETA && dayStart.toDate() < user.inOutETA) continue; // on vacation until ETA

    const date = dayjs.utc(dayStart.format('YYYY-MM-DD')).millisecond(1).toDate();
    // plans were authored recently, before demo creation time
    const authoredAt = new Date(Math.max(
      user.createdAt ? user.createdAt.getTime() : 0,
      now.getTime() - randomInt(1, 48) * 60 * 60 * 1000,
    ));

    // 1-2 planned blocks per picked user, sequential with gaps
    const blocks = randomInt(1, 2);
    let cur = randomInt(9 * 60, 13 * 60);
    for (let b = 0; b < blocks && planCount < PLAN_ENTRIES_TARGET; b += 1) {
      const len = randomInt(60, 180);
      const task = getGeneralTask();
      const project = pickProjectFor(dayStart.toDate());
      if (!project) break;
      docs.push({
        _id: Random.id(),
        date,
        owner: user._id,
        startMinute: cur,
        endMinute: cur + len,
        plan: true,
        projectId: project._id,
        clientId: project.clientId,
        taskDesc: task.taskDesc,
        taskDescNormalized: normalizeStringForAC(task.taskDesc),
        ...(project.useTaskTypes ? { taskType: task.taskType } : {}),
        intCom: '',
        tagColor: '',
        tagText: '',
        tz,
        createdAt: authoredAt,
        createdBy: { id: user._id, name: user.name },
        modifiedAt: authoredAt,
        modifiedBy: { id: user._id, name: user.name },
      });
      planCount += 1;
      cur += len + randomInt(15, 60);
    }
  }

  if (docs.length) await Times.rawCollection().insertMany(docs);
};
