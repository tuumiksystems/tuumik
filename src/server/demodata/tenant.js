/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Tenants } from '/src/shared/collections/collections.js';
import inOutOptions from '/src/server/initdata/inout-options.js';

export default async () => {
  const teams = [
    { id: '10', name: 'Dispute' },
    { id: '20', name: 'Finance' },
    { id: '30', name: 'Employment' },
  ];

    const initialExportersFront = [
      { name: 'XLSX', id: '10' },
    ];

    const initialExportersBack = [
      { name: 'XLSX', id: '10', url: 'http://export:3000/xlsx1', apiKey: 'tuumik' },
    ];

  const tenantId = await Tenants.insertAsync({
    name: 'Sample Law Firm',
    email: 'demo@tuumik.com',
    phone: '+12345678912345',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    weekStart: 'mon',
    thouMark: 'comma',
    decimalMark: 'period',
    currency: { str: 'EUR', sign: '€' },
    useTaskTypesByDefault: false,
    trackerStep: 1,
    inOutOptions,
    teams,
    homeView: 'recent',
    composerExportersFront: initialExportersFront,
    composerExportersBack: initialExportersBack,
    preventLogin: false,
    demo: true,
    createdAt: new Date(),
  });
  return tenantId;
};
