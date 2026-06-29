/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Accounts } from 'meteor/accounts-base';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async () => {
  const persons = [
    {
      name: 'John Smith',
      pic: 'https://assets.tuumik.com/users/v1/user1-large.jpg',
    },
    {
      name: 'Elizabeth Jones',
      pic: 'https://assets.tuumik.com/users/v1/user2-large.jpg',
    },
    {
      name: 'Chris Moore',
      pic: 'https://assets.tuumik.com/users/v1/user3-large.jpg',
    },
    {
      name: 'Jessica Miller',
      pic: 'https://assets.tuumik.com/users/v1/user4-large.jpg',
    },
    {
      name: 'Frank Davis',
      pic: 'https://assets.tuumik.com/users/v1/user5-large.jpg',
    },
    {
      name: 'Peter Wilson',
      pic: 'https://assets.tuumik.com/users/v1/user6-large.jpg',
    },
    {
      name: 'Samantha Anderson',
      pic: 'https://assets.tuumik.com/users/v1/user7-large.jpg',
    },
    {
      name: 'Richard Jones',
      pic: 'https://assets.tuumik.com/users/v1/user8-large.jpg',
    },
    {
      name: 'George Harris',
      pic: 'https://assets.tuumik.com/users/v1/user9-large.jpg',
    },
    {
      name: 'Robin Hawkins',
      pic: 'https://assets.tuumik.com/users/v1/user10-large.jpg',
    },
    {
      name: 'Brooke Norman',
      pic: 'https://assets.tuumik.com/users/v1/user11-large.jpg',
    },
    {
      name: 'Peter Freeman',
      pic: 'https://assets.tuumik.com/users/v1/user12-large.jpg',
    },
    {
      name: 'Gary Carroll',
      pic: 'https://assets.tuumik.com/users/v1/user13-large.jpg',
    },
    {
      name: 'Chloe Robinson',
      pic: 'https://assets.tuumik.com/users/v1/user14-large.jpg',
    },
    {
      name: 'Spencer Howell',
      pic: 'https://assets.tuumik.com/users/v1/user15-large.jpg',
    },
    {
      name: 'Amanda Green',
      pic: 'https://assets.tuumik.com/users/v1/user16-large.jpg',
    },
    { name: 'Olivia Bennett' },
    { name: 'Emma Coleman' },
    { name: 'Sophia Reed' },
    { name: 'Isabella Ward' },
    { name: 'Charlotte Hayes' },
    { name: 'Mia Foster' },
    { name: 'Ava Russell' },
    { name: 'Emily Bryant' },
    { name: 'Abigail Spencer' },
    { name: 'Grace Murphy' },
    { name: 'Lily Hudson' },
    { name: 'Hannah Wallace' },
    { name: 'Natalie Brooks' },
    { name: 'Victoria Sanders' },
    { name: 'Zoe Patterson' },
    { name: 'Lauren Fisher' },
    { name: 'Megan Stewart' },
    { name: 'Rachel Powell' },
    { name: 'Sarah Bishop' },
    { name: 'James Holloway' },
    { name: 'William Barrett' },
    { name: 'Daniel Carter' },
    { name: 'Michael Pearson' },
    { name: 'Thomas Lawson' },
    { name: 'Henry Mitchell' },
    { name: 'Joseph Sullivan' },
    { name: 'David Newton' },
    { name: 'Matthew Reeves' },
    { name: 'Andrew Bradley' },
    { name: 'Benjamin Watts' },
    { name: 'Jack Morrison' },
    { name: 'Samuel Greenwood' },
    { name: 'Nathan Curtis' },
    { name: 'Oliver Hampton' },
  ];

  for (const person of persons) {
    const permissions = {
      timeTracker: true,
      historyOthers: true,
      catalog: true,
      monitor: true,
      clientsEdit: true,
      projectsEdit: true,
      composer: true,
      inOutSelf: true,
      inOutView: true,
      inOutEditOthers: true,
      admin: true,
    };

    const randomTeamId = Math.random() < 0.5 ? '20' : '30';

    const profile = {
      name: person.name,
      nameNormalized: normalizeStringForAC(person.name),
      permissions,
      inOutStatus: '6',
      inTeams: ['10', randomTeamId],
      enabled: true,
    };

    if (person.pic) profile.pic = person.pic;

    let email;
    do {
      email = `user${Math.floor(Math.random() * 100000 + 100000)}@example.com`;
    } while (await Accounts.findUserByEmail(email));
    const password = 'demo';
    await Accounts.createUserAsync({ email, password, profile });
  }
};
