/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Accounts } from 'meteor/accounts-base';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async () => {
  // team memberships: 50 users in "Dispute" (10), 15 in "Finance" (20), 30 in "Employment" (30)
  const persons = [
    {
      name: 'John Smith',
      pic: 'https://assets.tuumik.com/users/v2/user1.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Elizabeth Jones',
      pic: 'https://assets.tuumik.com/users/v2/user2.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Jessica Miller',
      pic: 'https://assets.tuumik.com/users/v2/user3.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Chris Moore',
      pic: 'https://assets.tuumik.com/users/v2/user4.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'Samantha Anderson',
      pic: 'https://assets.tuumik.com/users/v2/user5.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Frank Davis',
      pic: 'https://assets.tuumik.com/users/v2/user6.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Peter Wilson',
      pic: 'https://assets.tuumik.com/users/v2/user7.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Richard Jones',
      pic: 'https://assets.tuumik.com/users/v2/user8.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Robin Hawkins',
      pic: 'https://assets.tuumik.com/users/v2/user9.jpg',
      inTeams: ['20'],
    },
    {
      name: 'George Harris',
      pic: 'https://assets.tuumik.com/users/v2/user10.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Peter Freeman',
      pic: 'https://assets.tuumik.com/users/v2/user11.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Brooke Norman',
      pic: 'https://assets.tuumik.com/users/v2/user12.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'Chloe Robinson',
      pic: 'https://assets.tuumik.com/users/v2/user13.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Amanda Green',
      pic: 'https://assets.tuumik.com/users/v2/user14.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Olivia Bennett',
      pic: 'https://assets.tuumik.com/users/v2/user15.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Gary Carroll',
      pic: 'https://assets.tuumik.com/users/v2/user16.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Emma Coleman',
      pic: 'https://assets.tuumik.com/users/v2/user17.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Sophia Reed',
      pic: 'https://assets.tuumik.com/users/v2/user18.jpg',
      inTeams: ['20', '30'],
    },
    {
      name: 'Isabella Ward',
      pic: 'https://assets.tuumik.com/users/v2/user19.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Spencer Howell',
      pic: 'https://assets.tuumik.com/users/v2/user20.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'James Holloway',
      pic: 'https://assets.tuumik.com/users/v2/user21.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Charlotte Hayes',
      pic: 'https://assets.tuumik.com/users/v2/user22.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Mia Foster',
      pic: 'https://assets.tuumik.com/users/v2/user23.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Ava Russell',
      pic: 'https://assets.tuumik.com/users/v2/user24.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'William Barrett',
      pic: 'https://assets.tuumik.com/users/v2/user25.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Emily Bryant',
      pic: 'https://assets.tuumik.com/users/v2/user26.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'Daniel Carter',
      pic: 'https://assets.tuumik.com/users/v2/user27.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Michael Pearson',
      pic: 'https://assets.tuumik.com/users/v2/user28.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Abigail Spencer',
      pic: 'https://assets.tuumik.com/users/v2/user29.jpg',
      inTeams: ['20'],
    },
    {
      name: 'Thomas Lawson',
      pic: 'https://assets.tuumik.com/users/v2/user30.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Henry Mitchell',
      pic: 'https://assets.tuumik.com/users/v2/user31.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Joseph Sullivan',
      pic: 'https://assets.tuumik.com/users/v2/user32.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'David Newton',
      pic: 'https://assets.tuumik.com/users/v2/user33.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Grace Murphy',
      pic: 'https://assets.tuumik.com/users/v2/user34.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'Lily Hudson',
      pic: 'https://assets.tuumik.com/users/v2/user35.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Hannah Wallace',
      pic: 'https://assets.tuumik.com/users/v2/user36.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Matthew Reeves',
      pic: 'https://assets.tuumik.com/users/v2/user37.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Natalie Brooks',
      pic: 'https://assets.tuumik.com/users/v2/user38.jpg',
      inTeams: ['20', '30'],
    },
    {
      name: 'Andrew Bradley',
      pic: 'https://assets.tuumik.com/users/v2/user39.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Victoria Sanders',
      pic: 'https://assets.tuumik.com/users/v2/user40.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Zoe Patterson',
      pic: 'https://assets.tuumik.com/users/v2/user41.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Lauren Fisher',
      pic: 'https://assets.tuumik.com/users/v2/user42.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'Megan Stewart',
      pic: 'https://assets.tuumik.com/users/v2/user43.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Benjamin Watts',
      pic: 'https://assets.tuumik.com/users/v2/user44.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Rachel Powell',
      pic: 'https://assets.tuumik.com/users/v2/user45.jpg',
      inTeams: ['20'],
    },
    {
      name: 'Jack Morrison',
      pic: 'https://assets.tuumik.com/users/v2/user46.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Sarah Bishop',
      pic: 'https://assets.tuumik.com/users/v2/user47.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Anna Whitfield',
      pic: 'https://assets.tuumik.com/users/v2/user48.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Samuel Greenwood',
      pic: 'https://assets.tuumik.com/users/v2/user49.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Nathan Curtis',
      pic: 'https://assets.tuumik.com/users/v2/user50.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Claire Donovan',
      pic: 'https://assets.tuumik.com/users/v2/user51.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'Julia Thornton',
      pic: 'https://assets.tuumik.com/users/v2/user52.jpg',
      inTeams: ['20'],
    },
    {
      name: 'Nora Ellison',
      pic: 'https://assets.tuumik.com/users/v2/user53.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Alice Harmon',
      pic: 'https://assets.tuumik.com/users/v2/user54.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Oliver Hampton',
      pic: 'https://assets.tuumik.com/users/v2/user55.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Ethan Parker',
      pic: 'https://assets.tuumik.com/users/v2/user56.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Lucas Grant',
      pic: 'https://assets.tuumik.com/users/v2/user57.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Kate Sheldon',
      pic: 'https://assets.tuumik.com/users/v2/user58.jpg',
      inTeams: ['10', '20'],
    },
    {
      name: 'Laura Bentley',
      pic: 'https://assets.tuumik.com/users/v2/user59.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Maria Vaughn',
      pic: 'https://assets.tuumik.com/users/v2/user60.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Ellen Prescott',
      pic: 'https://assets.tuumik.com/users/v2/user61.jpg',
      inTeams: ['20'],
    },
    {
      name: 'Diana Mercer',
      pic: 'https://assets.tuumik.com/users/v2/user62.jpg',
      inTeams: ['30'],
    },
    {
      name: 'Ruth Callahan',
      pic: 'https://assets.tuumik.com/users/v2/user63.jpg',
      inTeams: ['10', '30'],
    },
    {
      name: 'Ryan Cooper',
      pic: 'https://assets.tuumik.com/users/v2/user64.jpg',
      inTeams: ['10'],
    },
    {
      name: 'Ivy Sinclair',
      pic: 'https://assets.tuumik.com/users/v2/user65.jpg',
      inTeams: ['10'],
    },
  ];

  // spread demo users across a few IANA zones so the monitors demonstrate the
  // multi-timezone feature (each user's board renders in their own local wall clock)
  // const demoTimezones = ['America/New_York', 'Europe/Tallinn', 'Asia/Singapore'];
  // for now keep all demo users in a single timezone (swap in the line above to spread them out)
  const demoTimezones = ['Europe/Tallinn'];

  for (const [personIndex, person] of persons.entries()) {
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

    const profile = {
      name: person.name,
      nameNormalized: normalizeStringForAC(person.name),
      permissions,
      inOutStatus: '6',
      inTeams: person.inTeams,
      timezone: demoTimezones[personIndex % demoTimezones.length],
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
