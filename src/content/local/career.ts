/**
 * Career history, in the order of the CV (Curriculum Vitae - Abdullah_Faisal,
 * October 2026), most recent first.
 *
 * Each role has:
 *   brief    the few lines shown while the entry is closed
 *   groups   every detail from the CV, shown when the entry is opened
 *
 * Job titles and group headings translate (message files: about.roles.<key>
 * and about.career.groups.<group>). Organisation names, dates and the detail
 * lines are kept in English, as they are on the CV.
 *
 * To add a role: add an entry here, plus `about.roles.<key>` in all six message
 * files. A new group heading needs a key in CAREER_GROUPS and
 * `about.career.groups.<group>` in all six files too. `npm run preflight`
 * checks that the six files keep the same keys.
 */

export const CAREER_GROUPS = [
  'responsibilities',
  'scope',
  'projects',
  'emerging',
  'clients',
  'powerProjects',
  'tenders',
  'energyProjects',
  'roleBizDev',
  'roleSupervision',
  'special',
  'roleLocal',
  'rolePm',
  'assigned',
  'pipeline',
  'roleOffice',
  'roleDocControl',
  'assessments',
  'solarProposals',
  'audits',
  'factories',
  'software',
] as const

export type CareerGroupKey = (typeof CAREER_GROUPS)[number]
export type CareerGroup = { group: CareerGroupKey; items: readonly string[] }

export type CareerRole = {
  /** Message key for the job title: about.roles.<key>. Also the entry's id. */
  key: string
  when: string
  org: string
  /** Optional one-line note under the organisation, as on the CV. */
  note?: string
  brief: readonly string[]
  groups: readonly CareerGroup[]
}

export const CAREER: readonly CareerRole[] = [
  {
    key: 'mz_director',
    when: 'Dec 2024 – Present',
    org: 'MZ Consulting Services',
    brief: [
      '100 MW solar plant, approved by government (JV-NEPCS-BMSTAR)',
      '400 MW solar under PPP guideline for Feemac Solar Limited',
      'Strategy, external stakeholder relationships and business development',
    ],
    groups: [
      {
        group: 'responsibilities',
        items: [
          "Develop and execute the organisation's strategic plan with other executives and stakeholders",
          'Establish and maintain relationships with external stakeholders such as investors, customers and suppliers',
          'Manage day-to-day operations, making sure policies and procedures are followed and the organisation complies with all regulatory requirements',
          'Business development: identifying opportunities for growth and building partnerships with other organisations',
          "Stay up to date on industry trends and changes, adapting the organisation's strategy to remain competitive",
        ],
      },
      {
        group: 'projects',
        items: [
          '100 MW solar power plant project, JV-NEPCS-BMSTAR (approved by government)',
          '400 MW solar power plant under the PPP guideline, Feemac Solar Limited (inception stage)',
        ],
      },
    ],
  },
  {
    key: 'mz_consultant',
    when: 'Aug 2022 – Nov 2024',
    org: 'MZ Consulting Services',
    note: 'Working for several power plant developers',
    brief: [
      'Authored winning proposals and tender documents for over 1,500 MW of solar',
      '1,000 MWac + 20% BESS for Eleris Energy Global (Pacific Group, USA)',
      '100 MWac + 20% BESS for Sumitomo Corporation and East Coast Group',
    ],
    groups: [
      {
        group: 'scope',
        items: [
          'Power plant site selection and due diligence',
          'Land acquisition process and review of the compliances it needs',
          'Proposals, project development plans and tariff negotiation',
          'Authored winning proposals and tender documents for over 1,500 MW of solar projects, securing critical stakeholder buy-in',
          'Worked with company managers to create and improve project development strategies',
          "Gap analyses that aligned clients' proposals with off-taker criteria, significantly raising qualification success rates",
          'Diversifying into other business areas and developing business strategies',
        ],
      },
      {
        group: 'projects',
        items: [
          '2 × 100 MW grid-tied solar PV power plant project, Hosaf Group',
          '101 MW (+10%) + 15% BESS grid-tied solar PV power plant project, Solen Energy Limited',
          '100 MW + 20% BESS grid-tied solar project, consortium of Sumitomo Corporation and East Coast Group',
          '50 MW + 20% BESS grid-tied solar PV power plant project, JV-Vapus-Novelty',
          '1,000 MW + 20% BESS grid-tied solar project, Eleris Energy Global LLC (a concern of Pacific Group, USA)',
        ],
      },
      {
        group: 'emerging',
        items: [
          'EV charging stations',
          'Hydrogen plants',
          'Waste management of obsolete PV modules',
          'Waste to energy',
          'Carbon trading',
          'Sustainable Development Goals',
        ],
      },
    ],
  },
  {
    key: 'metito',
    when: 'Sep 2020 – Jul 2023',
    org: 'Consortium of Metito Utilities, Aljomaih Energy & Water, and Jinko Solar',
    brief: [
      'Local stakeholder engagement for the consortium on visits to Bangladesh',
      'Permits, licences, land and right of way for the transmission line',
      'Support through project agreement negotiations with BPDB',
    ],
    groups: [
      {
        group: 'responsibilities',
        items: [
          'Arranging meetings with local stakeholders during the consortium’s visits to Bangladesh to develop renewable energy projects',
          'Introductions to, and negotiation with, local subcontractors, survey companies and other local suppliers',
          'Identifying and arranging every permit and licence the renewable project needs',
          'Securing land and right of way to build the transmission line',
          'Securing land inside the substation premises for the bay extension',
          'Support during the project agreement negotiations with BPDB',
          'Business, liaison, meetings and site visits in Bangladesh',
        ],
      },
    ],
  },
  {
    key: 'rangunia',
    when: 'Sep 2020 – Jul 2022',
    org: 'Rangunia Solar Limited',
    brief: [
      '55 MWac solar power plant, Rangunia, Chittagong',
      'Led financial close and the operating financial model for the SPC',
      'EPC and O&M contract supervision, board and PPA reporting',
    ],
    groups: [
      {
        group: 'responsibilities',
        items: [
          'Supervised the EPC contract (engineering, procurement, construction, commissioning and start-up) and the preparation of the O&M contract',
          'Led financial close and the financial administration that followed, with the client, banks and financial partners, government entities and others',
          "Made sure the SPC's financial statements, budgets and forecasts were issued",
          'Made sure funding arrived on time and was in place for every part of the SPC’s operations',
          'Followed up the development work due before financial close: transmission line land acquisition, river protection design, and geotechnical and topographic surveys',
          'Planned and controlled project costs to reduce risk to the company',
          'Developed and implemented the operating financial model for the SPC',
          'Coordinated and reported all activities to the SPC Board of Directors, working closely with every stakeholder under the PPA',
          'Set plans in a framework with a dashboard and everything needed for reporting',
          'Recruited and assisted the external auditors',
          'Liaised with auditors, lawyers, tax advisers, bankers and shareholders for compliance and smooth operations',
          'Developed and maintained senior stakeholder relationships',
          'Reviewed and updated strategy and plans by tracking government and industry policy changes and the market',
          'Kept engagement high for everyone involved in the project',
          'Regular QHSE reviews and continuous improvement',
          'ISO implementation and compliance',
        ],
      },
      { group: 'projects', items: ['55 MW solar power plant, Rangunia, Chittagong, Bangladesh'] },
    ],
  },
  {
    key: 'xsergy',
    when: 'Feb 2019 – Aug 2020',
    org: 'XSERGY Limited',
    note: 'Local agency',
    brief: [
      'Clients: Power China, State Grid of China, Shandong Kerui, XJ Group, Sterling & Wilson, General Electric, Sonatrach',
      '2,000 MWac phased solar (Chandpur) · 3,600 MW CCPP and LNG import terminal',
      'Transmission and pipeline tenders: 400 kV, 230 kV, GTCL, Jalalabad',
    ],
    groups: [
      {
        group: 'responsibilities',
        items: [
          'Developed, implemented and reviewed operational policies and procedures',
          'Assisted HR with recruiting when needed',
          'Stakeholder management',
          'Made sure all legal and regulatory documents were filed, and monitored compliance',
          'Worked with the board of directors on values, mission and the business plan',
          'Identified and addressed problems and business opportunities for the company',
          'Built alliances and partnerships with foreign principals and stakeholders',
          'Drafted and executed agreements with clients',
        ],
      },
      {
        group: 'clients',
        items: [
          'Power China',
          'State Grid Corporation of China',
          'Shandong Kerui',
          'Sonatrach, Algeria',
          'XJ Group Corporation, China',
          'Sterling & Wilson',
          'General Electric (GE)',
        ],
      },
      {
        group: 'powerProjects',
        items: [
          'Development of a 2,000 MW solar power plant (in phases), Chandpur, Bangladesh',
          'Development of the Panchagarh 100 MW solar power plant',
          'Development of a 100 MW solar power plant, BEZA Chandpur',
          'Development of a 3,600 MW CCPP and LNG import terminal',
          'Development of a 1,200 MW coal mine-mouth power plant',
          'Development of a 400–600 MW dual-fuel combined cycle power plant',
          'Keraniganj 1–1.5 MW waste to energy',
        ],
      },
      {
        group: 'tenders',
        items: [
          'OTM: 400 kV Payra–Gopalganj–Aminbazar',
          'OTM: 11 kV upgrade and underground cabling',
          'OTM: Chandpur 230 kV transmission line infrastructure',
          'OTM: GTCL 30-inch gas transmission pipeline, supply and procurement',
          'OTM: Jalalabad gas transmission pipeline, supply and procurement',
          'Development of a smart city at Keraniganj',
        ],
      },
      {
        group: 'energyProjects',
        items: [
          'Supply of petroleum products to the Government of Bangladesh (G2G)',
          'Supply of LNG to the Government of Bangladesh (G2G)',
        ],
      },
    ],
  },
  {
    key: 'symbior',
    when: 'Feb 2018 – Apr 2018',
    org: 'Symbior Solar Bangladesh Limited',
    note: 'A subsidiary of Symbior Solar Limited, Hong Kong',
    brief: [
      '9.6 MWac and 10 MWac grid-tied solar plants, Tetulia and Moulvibazar',
      'Investor due diligence, RFPs and EPC offer evaluation',
      'ESG and EHS compliance process and reporting',
    ],
    groups: [
      {
        group: 'roleBizDev',
        items: [
          'Led early-stage utility-scale solar PV projects',
          'Supported due diligence and negotiations with potential investors and co-developers',
          'Market intelligence and monitoring of the renewable energy market',
          'Liaison with government authorities on power purchase, investment privileges, permits and licences',
          "Development of utility-scale projects across Symbior's portfolio",
          'Prepared RFPs and evaluated EPC offers',
          "Worked in line with the company's service rules and regulations",
        ],
      },
      {
        group: 'roleSupervision',
        items: [
          'Project briefs with key risk analysis and a pre-development budget for the investment committee',
          "Managed and developed Symbior's operations in Bangladesh",
          'Monitored and supervised the contractors on site',
          'Monitored and supervised the installation works',
          'Managed the commissioning and acceptance of the solar power plant',
          'Managed the ESG and EHS compliance process and reporting',
        ],
      },
      {
        group: 'special',
        items: [
          'KPIs for each country portfolio: leads, approvals, profitability',
          'New capacity of utility-scale solar PV made bankable and ready for construction each year',
          'New capacity of utility-scale solar PV in operation',
          'Meeting or beating the project development budget',
          'Projects on time, within budget and at the required quality',
        ],
      },
      {
        group: 'assigned',
        items: [
          '9.6 MW grid-tied solar power plant, Tetulia',
          '10 MW grid-tied solar power plant, Moulvibazar',
        ],
      },
      {
        group: 'pipeline',
        items: ['20 MW solar power plant, Bangladesh', '30 MW solar power plant, Bangladesh'],
      },
    ],
  },
  {
    key: 'reliance',
    when: 'Jan 2017 – Jan 2019',
    org: 'Reliance Bangladesh LNG & Power Limited',
    note: 'A subsidiary of Reliance Power Limited, India',
    brief: [
      '750 MWac RLNG-fired combined cycle plant, Narayanganj',
      '500 mmscfd FSRU-based LNG terminal, Kutubdia Island',
      'PPA, IA, GSA and LLA negotiation, vetting and management',
    ],
    groups: [
      {
        group: 'roleLocal',
        items: [
          'Coordinated all local affairs',
          'Liaison with government offices: BPDB, PGCB, Petrobangla, Titas, GTCL, the Power Division, the Energy Division and other agencies',
          "Communication with investors, contractors, suppliers and consultants: potential shareholders, EPC and O&M contractors, equipment suppliers, the owner's engineer, legal, ESIA and insurance advisers, lenders, banks and financial institutions",
          'Coordinated site visits for contractors and stakeholders and answered their on-site questions',
          'Negotiation, vetting and management of the PPA, IA, GSA, LLA and consultant engagements',
          'Licences, approvals and permits: organising, planning and carrying out the strategy',
          'Project and business development',
        ],
      },
      {
        group: 'rolePm',
        items: [
          'Organising, planning and carrying out strategy',
          'Coordinating project development operations',
          'Tracking the progress of project activities',
          'Making sure schedules and objectives were met',
          'Monitoring operating costs, budgets and resources',
          'Working with clients to evaluate their needs and specifications',
          'Reports, data analysis and interpretation',
          'Driving recruitment, training and development',
          "Making sure the company's policies and guidelines were followed",
          'Other responsibilities as needed',
        ],
      },
      {
        group: 'assigned',
        items: [
          '750 MW RLNG-fired combined cycle power plant, Narayanganj, Bangladesh',
          "500 mmscfd LNG terminal, Kutubdia Island, Cox's Bazar, Bangladesh",
        ],
      },
      {
        group: 'pipeline',
        items: [
          '1,500 MW RLNG-fired combined cycle power plant, Chittagong, Bangladesh',
          "750 MW RLNG-fired combined cycle power plant, Maheshkhali, Cox's Bazar, Bangladesh",
        ],
      },
    ],
  },
  {
    key: 'om',
    when: 'Nov 2013 – Dec 2016',
    org: 'O&M Solutions Bangladesh Limited',
    note: 'A subsidiary of O&M Solutions, Mauritius',
    brief: [
      'Feasibility, IEE, EIA and SIA across 1,320 MW, 350 MW and 225 MW studies',
      "Owner's engineer support for Ghorashal 365 MW and Bibiyana South 400 MW",
      'Financial modelling for solicited and unsolicited power projects',
    ],
    groups: [
      {
        group: 'responsibilities',
        items: [
          'Team member on power plant feasibility studies and technical consultancy',
          "Team member on power plant owner's engineering projects",
          'Tender documents for international bidding of IPP projects floated by the Government of Bangladesh',
          'Reports for power plant construction management and O&M services',
          'Feasibility reports for coal and combined cycle power plants',
          'Pre-qualification documents such as RFQs, RFPs and EOIs',
          'Financial models for solicited and unsolicited power projects',
        ],
      },
      {
        group: 'roleOffice',
        items: [
          'Detailed feasibility study, IEE, EIA and SIA of the Gazaria 350 MW (+10%) coal-fired thermal power plant, Munshiganj, for RPCL (Feb 2016 – Nov 2016)',
          'Feasibility study and EIA of a 1,320 MW coal-fired thermal power plant, Chittagong, IPP (POSCO E&C, Korea) (Feb 2016 – Jul 2016)',
          'Feasibility study of the Sirajganj 225 MW CCPP (dual fuel, 3rd unit), Sirajganj, for NWPGCL (May 2015 – Aug 2015)',
          'Development of a 3,000 MW LNG-based CCPP and FSRU-based LNG terminal in Chittagong, for Reliance Power Limited (Sep 2014 – Dec 2014)',
          'Pre-feasibility study and IEE of the Patuakhali 1,320 MW USC coal-fired power plant, for NWPGCL (Feb 2014 – Oct 2014)',
          'Pre-feasibility study and IEE of a 600–800 MW coal-fired power plant, Munshiganj, for EGCB (Sep 2013 – Jul 2014)',
        ],
      },
      {
        group: 'roleDocControl',
        items: [
          "Owner's engineer for the Ghorashal 365 MW CCPP project, Ghorashal, BPDB (Nov 2014 – Dec 2016)",
          "Owner's engineer for the Bibiyana South 400 MW (+10%) CCPP project, Bibiyana, BPDB (Nov 2014 – Dec 2016)",
        ],
      },
      {
        group: 'assessments',
        items: ['Bheramara 110 MW HSD power plant, OTOBI', 'Noapara 105 MW HFO power plant, OTOBI'],
      },
      {
        group: 'solarProposals',
        items: [
          "Owner's engineering services for a 200 MW solar power project, Panchagarh, Beximco Group",
          'Feasibility study of a 50 MW solar power plant, 8 Minutes Energy',
          'Dhorola 30 MW solar park on a BOO basis, Kurigram, Intraco Group',
        ],
      },
    ],
  },
  {
    key: 'eclectic',
    when: 'May 2013 – Oct 2013',
    org: 'Eclectic Limited',
    note: 'Electrical safety and energy audits in RMG factories, organised by GIZ Bangladesh',
    brief: [
      'Electrical safety and energy audits across a dozen major RMG factories, organised by GIZ',
      'Audits to BNBC 2010, NEC, NFPA-70 and NFPA-70E',
      'Cleaner production audit under IFC-SEDF',
    ],
    groups: [
      {
        group: 'audits',
        items: [
          'Electrical safety audit to BNBC 2010, NEC, NFPA-70 and NFPA-70E',
          'Energy audit: identified energy saving opportunities in the textile industry',
          'Electrical systems design to international standards',
          'Cleaner production audit: audited a textile mill as electrical safety and energy auditor under IFC-SEDF',
        ],
      },
      {
        group: 'factories',
        items: [
          'Fakir Fashion Limited',
          'Purbani Fabrics Limited',
          'Epyllion Fabrics Limited',
          'Niagara Textiles Limited',
          'Denimach Washing Limited',
          'Square Textiles Limited',
          'Divine Textile Limited',
          'Mega Yarn Dyeing Mills Limited',
          'Libas Textiles Limited',
          'Metro Knitting & Dyeing Mills Limited',
          'Karim Textiles Limited',
          'Purbani Yarn Dyeing Limited',
          'Fakhruddin Textile Mills Limited',
        ],
      },
    ],
  },
  {
    key: 'aloron',
    when: 'Mar 2012 – Dec 2016',
    org: 'Aloron Technologies',
    brief: [
      'Founded and led the company: strategy, capital allocation, business development',
      'Inventory, educational institution and hospital management systems',
    ],
    groups: [
      {
        group: 'responsibilities',
        items: [
          'Setting strategy and owning the vision',
          'Building the company and its business culture',
          'Team building, project planning and execution',
          "Overseeing and delivering the company's performance",
          'Capital allocation',
          'Business development',
        ],
      },
      {
        group: 'software',
        items: [
          'Inventory Management System (IMS)',
          'Educational Institution Management System (EIMS)',
          'Hospital Management System',
        ],
      },
    ],
  },
]
