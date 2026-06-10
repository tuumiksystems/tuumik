/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Statuses } from '/src/shared/collections/collections.js';
import { Random } from 'meteor/random';

dayjs.extend(utc);

export default async tenantId => {
  const docs = [];

  const getEveningStatus = () => {
    const status = '6';
    const addMinutes = Math.floor(Math.random() * 600 + 10);
    return { status, addMinutes };
  };

  const getBusinessHoursStatus = () => {
    let status = String(Math.floor(Math.random() * 6 + 1));
    const prevStatus = docs.length ? docs[docs.length - 1].status : '';
    while (status === prevStatus) {
      status = String(Math.floor(Math.random() * 6 + 1));
    }
    const addMinutes = Math.floor(Math.random() * 180 + 10);
    return { status, addMinutes };
  };

  const getRandomNoteGeneral = () => {
    const notes = [
      'Will check email occasionally',
      'Reachable by phone if urgent',
      'Checking messages every hour or so',
      'On chat, just slower to respond',
      'Will reply to emails when I can',
      'Reachable by text only',
      'Checking in periodically throughout the day',
      'Available by phone for urgent matters',
      'Will glance at email between things',
      'On and off, message me if needed',
      'Reachable, just may be a bit slow today',
      'Checking emails a few times today',
      'Back in about an hour',
      'Back in a couple of hours',
      'Back later this afternoon',
      'Back tomorrow morning',
      'Back in a few days',
      'Back early next week',
      'Back by end of day',
      'Back in roughly 30 minutes',
      'Back sometime this evening',
      'Back in a day or two',
      'Back next Monday',
      'Back in about a week',
      'Back later today, not sure exactly when',
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  };

  const getRandomNoteVacation = () => {
    const notes = [
      'Back 14 May, reachable by email for urgent matters',
      'Back 20 June, only checking messages occasionally',
      'Back next Monday, call my mobile if it\'s urgent',
      'Returning 5 July, will not be checking email',
      'Back in two weeks, reachable by phone in an emergency',
      'Back at the end of the month, mostly offline',
      'Back 3 March, contact my assistant if needed',
      'Back after 22 April, checking email once a day',
      'Back 1 August, reachable by text if truly urgent',
      'Back 30 July, unreachable until then',
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  };

  const getRandomETA = () => {
    const text = [
      '15 minutes',
      'Noon',
      '1 hour',
      'Tomorrow morning',
      '30 minutes',
      'Around 15',
      'Couple hours',
      'Early afternoon',
      'Tomorrow',
      'Next week',
    ];
    return text[Math.floor(Math.random() * text.length)];
  };

  const setUserStatus = async (tenantUser, updateDate) => {
    let status = String(Math.floor(Math.random() * 6 + 1));
    const prevStatus = docs.length ? docs[docs.length - 1].status : '';
    while (status === prevStatus) {
      status = String(Math.floor(Math.random() * 6 + 1));
    }

    let note = '';
    if (status !== '7' && Math.random() < 0.25) note = getRandomNoteGeneral();
    if (status === '7' && Math.random() < 0.25) note = getRandomNoteVacation();
    let eta = '';
    if (status !== '1' && status !== '5' && Math.random() < 0.15) eta = getRandomETA();

    await Meteor.users.updateAsync(
      { _id: tenantUser._id },
      {
        $set: {
          inOutStatus: status,
          inOutNote: note,
          inOutETA: eta,
          inOutUpdateById: tenantUser._id,
          inOutUpdateByName: tenantUser.name,
          inOutUpdateAt: updateDate,
        },
      },
    );
  };

  const startDate = dayjs
    .utc()
    .subtract(7, 'days')
    .toDate();
  const nowDate = new Date();
  const tenantUsers = await Meteor.users.find({ tenantId }).fetchAsync();
  for (const tenantUser of tenantUsers) {
    let counterDate = dayjs.utc(startDate).toDate();
    while (counterDate < nowDate) {
      const start = dayjs.utc(counterDate).toDate();
      const hour = start.getHours();
      let x;
      if (hour > 17) {
        x = getEveningStatus();
      } else {
        x = getBusinessHoursStatus();
      }
      let note = '';
      if (x.status !== '7' && Math.random() < 0.25) note = getRandomNoteGeneral();
      if (x.status === '7' && Math.random() < 0.25) note = getRandomNoteVacation();
      let eta = '';
      if (x.status !== '1' && x.status !== '5' && Math.random() < 0.15) eta = getRandomETA();
      counterDate = dayjs.utc(counterDate).add(x.addMinutes, 'minutes').toDate();
      const doc = {
        _id: Random.id(),
        tenantId,
        userId: tenantUser._id,
        start,
        end: counterDate,
        status: x.status,
        note,
        eta,
        updaters: [{ id: tenantUser._id, name: tenantUser.name }],
      };
      if (doc.end < nowDate) {
        docs.push(doc);
      } else {
        const updateDate = docs.length ? docs[docs.length - 1].end : nowDate;
        await setUserStatus(tenantUser, updateDate);
      }
    }
  }
  await Statuses.rawCollection().insertMany(docs);
};
