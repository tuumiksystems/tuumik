/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Clients, Projects, TaskGroups } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { Random } from 'meteor/random';

export default async () => {
  const docs = [];

  const usedNames = new Set();
  let suffixCounter = 100;

  const getRandomProjectName = () => {
    const projectNames = [
      'Sale of Zentagrid Manufacturing Facilities',
      'Dispute with Alterion AB',
      'Public Procurement No 12845297 - Reconstruction of Ventgatan 175 Office Building',
      'Insolvency of Agerion LLC',
      'General counseling',
      'Public Procurement No 29454878 - Development of Software for Ministry of Financial Affairs',
      'Dispute with Arcturus GmbH (Civil Matter No 17-23547-734)',
      'Dispute with Financial Supervision Authority (Administrative Matter No 12-33984-247)',
      'Loan Agreements with Genningsen Bank',
      'Dispute with Data Protection Authority',
      'Cooperation Agreement with ABS Construction LLC',
      'Dispute with Alden Insurance LLC',
      'Zoning Permits for Axalia Center',
      'Project Fox',
      'Software Development Agreement (VPN Portal)',
      'Pledge Agreement with ZTF Invest AB',
      'Sales Agreement No 144-1228 (Maltikal Chemical Facilities)',
      'Dispute with Peter Wright',
      'Termination of Partnership with Chromitel AB',
      'Termination of Activities in Norway',
      'Merger with Zentalia OY',
      'Economic Activity Permits',
      'Share Purchase Agreement (Indixa AB)',
      'Dispute with Dynocel AB',
      'Lease Agreements (CRJ 700)',
      'Lease Agreements of Voonetel Plaza',
      'Termination of Lease Agreement (Atelia 17)',
      'Public Procurement No 28545218 - Expansion of Trolleby Bridge',
      'Share Purchase Agreement (Vetixen Engineering AB)',
      'Decommissioning of Gwentel Power Plant',
      'Sale of Duxley Manor',
      'Employment Agreement Templates',
      'Employment Dispute with James Smith',
      'Cooperation Agreement with Denix AB',
      'Customs and Import Restrictions in Sweden',
      'Dispute with ZTF Chemicals AB',
      'Enforcement of Court Decision in Civil Matter No 115-543478',
      'Termination of Lease Agreement No 12-42 (Idelor AB, Almena Center)',
      'Dispute with Ataxa GmbH',
      'Dispute with Zental AB',
      'Acquisition of Brentwell Logistics AB',
      'Joint Venture with Halvorsen Maritime OY',
      'Dispute with Calderon Holdings LLC (Civil Matter No 21-44872-118)',
      'Restructuring of Vantible Group',
      'Public Procurement No 33781204 - Renovation of Stadshuset Library',
      'Trademark Registration (Northwind Brands)',
      'Patent Application for Heatcore Exchanger',
      'Dispute with Tax Authority (Administrative Matter No 09-22145-603)',
      'Shareholders Agreement (Meridian Capital AB)',
      'Sale of Kessler Industrial Park',
      'Lease Agreements of Granby Business Center',
      'Employment Dispute with Laura Bennett',
      'Cooperation Agreement with Orvex Solutions LLC',
      'Insolvency of Trellix Trading AB',
      'Loan Restructuring with Hartmann Bank',
      'Dispute with Competition Authority',
      'Merger with Falkenberg Logistics OY',
      'Share Purchase Agreement (Quanterra AB)',
      'Termination of Distribution Agreement with Pollex GmbH',
      'Public Procurement No 41203956 - Supply of Medical Equipment',
      'Construction Contract Dispute (Harborline Project)',
      'Sale of Westgate Shopping Centre',
      'Pledge Agreement with Nordveil Invest AB',
      'Dispute with Velmara Insurance LLC',
      'Regulatory Compliance Review (Financial Services)',
      'Acquisition of Steinholt Properties AB',
      'Dispute with Carl Lindqvist',
      'Franchise Agreement with Bistro Nord OY',
      'Termination of Lease Agreement (Lindgatan 42)',
      'Data Processing Agreements (GDPR Compliance)',
      'Dispute with Axentor AB (Commercial Arbitration)',
      'Sale and Leaseback of Drammen Warehouse',
      'Public Procurement No 50914732 - IT Infrastructure Modernization',
      'Joint Development Agreement (Solara Energy)',
      'Insolvency of Brackmoor Retail LLC',
      'Employment Agreement Negotiations (Executive Team)',
      'Dispute with Helmsworth GmbH',
      'Corporate Governance Restructuring',
      'Share Option Plan (Veridia AB)',
      'Lease Agreements (A320 Fleet)',
      'Dispute with Environmental Protection Agency',
      'Acquisition of Trenholm Foods AB',
      'Cross-Border Merger with Aldermann GmbH',
      'Public Procurement No 60238471 - Reconstruction of Norreport Station',
      'Settlement Negotiations with Vortexa Industries',
      'Sale of Penhallow Estate',
      'Distribution Agreement with Marivelle SARL',
      'Dispute with Customs Authority',
      'Refinancing of Corporate Bond Programme',
      'Termination of Joint Venture with Quintara OY',
      'Trademark Dispute with Lunaris AB',
      'Public Procurement No 71458023 - Construction of Solvik School',
      'Employment Dispute with Daniel Carter',
      'Acquisition of Greythorn Pharmaceuticals AB',
      'Lease Agreements of Castleford Tower',
      'Dispute with Vandelore Holdings LLC',
      'Asset Purchase Agreement (Kintronic Devices)',
      'Insolvency of Ashridge Construction AB',
      'Loan Agreements with Sundström Bank',
      'Dispute with Labour Inspectorate',
      'Merger with Brightvale Media OY',
      'Share Purchase Agreement (Heliotrope AB)',
      'Termination of Supply Agreement with Granvik AB',
      'Public Procurement No 80347156 - Procurement of Public Transport Buses',
      'Dispute with Marcus Eriksson',
      'Sale of Thornbury Logistics Hub',
      'Pledge Agreement with Valmeris Invest AB',
      'Dispute with Crownhill Insurance LLC',
      'Antitrust Review of Proposed Acquisition',
      'Acquisition of Dunmore Textiles AB',
      'Cooperation Agreement with Petragon Energy LLC',
      'Termination of Lease Agreement (Björkgatan 9)',
      'Software Licensing Agreement (Cloud Platform)',
      'Dispute with Securities Authority (Administrative Matter No 14-55290-381)',
      'Sale of Wexford Manor',
      'Joint Venture with Salvanti Maritime AB',
      'Public Procurement No 90561238 - Development of E-Government Portal',
      'Dispute with Oakridge Trading GmbH',
      'Restructuring of Cavendish Group',
    ];
    let name = projectNames[Math.floor(Math.random() * projectNames.length)];
    if (usedNames.has(name)) {
      name += ` ${suffixCounter}`;
      suffixCounter += 1;
    }
    usedNames.add(name);
    return name;
  };

  const taskGroup = await TaskGroups.findOneAsync({});
  const taskGroupId = taskGroup?._id;
  const clients = await Clients.find({}).fetchAsync();
  for (const client of clients) {
    const projectCount = Math.floor(Math.random() * 2 + 1);
    for (let i = 0; i < projectCount; i += 1) {
      const name = getRandomProjectName();
      const doc = {
        _id: Random.id(),
        name,
        nameNormalized: normalizeStringForAC(name),
        clientId: client._id,
        taskGroupIds: taskGroupId ? [taskGroupId] : [],
        useTaskTypes: false,
        reminder: '',
        toEmail: 'info@example.com',
        created: new Date(),
        lastModified: new Date(),
      };
      docs.push(doc);
    }
  }
  await Projects.rawCollection().insertMany(docs);
};
