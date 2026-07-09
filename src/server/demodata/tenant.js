/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Tenant } from '/src/shared/collections/collections.js';
import inOutOptions from '/src/server/initdata/inout-options.js';

export default async () => {
  const teams = [
    { id: '10', name: 'Dispute' },
    { id: '20', name: 'Finance' },
    { id: '30', name: 'Employment' },
  ];

  const initialExportersFront = [
    { name: 'XLSX', id: '10' },
    { name: 'PDF', id: '11' },
  ];

  const initialExportersBack = [
    { name: 'XLSX', id: '10', url: 'http://export:3000/xlsx1', apiKey: 'tuumik' },
    { name: 'PDF', id: '11', url: 'http://export:3000/pdf1', apiKey: 'tuumik' },
  ];

  await Tenant.insertAsync({
    name: 'Sample Law Firm',
    email: 'demo@tuumik.com',
    phone: '+12345678912345',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    defaultTimezone: 'Europe/Tallinn',
    weekStart: 'mon',
    thouMark: 'comma',
    decimalMark: 'period',
    currency: { str: 'EUR', sign: '€' },
    useTaskTypesByDefault: false,
    trackerStep: 1,
    aiInstructions: '',
    inOutOptions,
    teams,
    homeView: 'recent',
    composerExportersFront: initialExportersFront,
    composerExportersBack: initialExportersBack,
    demo: true,
    createdAt: new Date(),
  });
};
