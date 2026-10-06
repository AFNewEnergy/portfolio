/**
 * The sample articles and the writing guide.
 *
 * Written in Faisal's voice from his own services, with every factual claim
 * tied to a public source in its References. The setup route copies these into
 * Notion; before Notion is connected, the site renders them straight from here.
 *
 * Photos: the portrait set in /public/photos and free Unsplash photos in
 * /public/photos/insights. Swap in real site photos in Notion whenever they
 * are available.
 *
 * House style: no em dashes anywhere. A quote's attribution line starts with
 * a hyphen ("- Name"); the site shows the name only.
 */
import {
  type NBlock, bold, ital, link, h1, h2, para, bullet, num, quote, callout, image, columns, table,
} from './dsl'

export type SampleArticle = {
  slug: string
  title: string
  subtitle: string
  topic: string
  tags: string[]
  date: string
  cover: string
  coverCaption: string
  published: boolean
  blocks: NBlock[]
}

type Src = readonly [title: string, url: string | null, source: string]

const SRC = {
  tbsLoi: ['How policy inconsistency drives foreign firms away from Bangladesh’s solar projects',
    'https://www.tbsnews.net/bangladesh/energy/how-policy-inconsistency-drives-foreign-firms-away-bangladeshs-solar-projects',
    'The Business Standard · January 2025'],
  tbsTariff: ['Solar tariff: open bidding slashes rates of new projects by over a third',
    'https://www.tbsnews.net/bangladesh/energy/solar-tariff-open-bidding-slashes-costs-new-projects-over-third-1251121',
    'The Business Standard · October 2025'],
  dsPpp: ['PPP guidelines rolled out to use public land for renewables',
    'https://www.thedailystar.net/business/economy/news/ppp-guidelines-rolled-out-use-public-land-renewables-4152391',
    'The Daily Star · April 2026'],
  tbsTargets: ['Target to generate 30% of electricity from renewables by 2040',
    'https://www.tbsnews.net/bangladesh/energy/target-generate-30-electricity-renewables-2040-1456566',
    'The Business Standard · June 2026'],
  chambers: ['Power Generation, Transmission & Distribution 2026: Bangladesh, Trends and Developments',
    'https://practiceguides.chambers.com/practice-guides/power-generation-transmission-distribution-2026/bangladesh/trends-and-developments',
    'Chambers and Partners · 2026'],
  bss918: ['Government signs agreements with 12 IPPs for 918 MW of solar power',
    'https://www.bssnews.net/special-stories/389105', 'BSS · May 2026'],
  tbs31: ['Govt mulls 31 renewable power projects cancelled during interim govt',
    'https://www.tbsnews.net/bangladesh/govt-mulls-31-renewable-power-projects-cancelled-during-interim-govt-1422991',
    'The Business Standard · April 2026'],
  mppPolicy: ['Policy for Enhancement of Private Participation in the Renewable Energy-based Power Generation, 2025',
    'https://www.solar.sreda.gov.bd/doc/Policy%20on%20Commercial%20Electricity%20Generation%20or%20Establishment%20of%20Power%20Plants%20Based%20on%20Renewable%20Energy%20with%20Private%20Participation-2025.pdf',
    'Power Division · Bangladesh Gazette, 6 October 2025'],

  bssCapacity: ['Power generation capacity now stands at 32,332 MW', 'https://www.bssnews.net/js-session/373866', 'BSS · April 2026'],
  dsRecord: ['Power generation hits record 17,200MW amid 400MW load-shedding',
    'https://www.thedailystar.net/news/environment/natural-resources/energy/news/power-generation-hits-record-17200mw-amid-400mw-load-shedding-4180566',
    'The Daily Star · May 2026'],
  mongabay: ['Bangladesh’s energy crunch highlights the promise and limits of solar',
    'https://news.mongabay.com/2026/05/bangladeshs-energy-crunch-highlights-the-promise-and-limits-of-solar/', 'Mongabay · May 2026'],
  dsSummer: ['PDB’s summer power plan: 60% capacity of gas plants to stay unutilised',
    'https://www.thedailystar.net/news/bangladesh/news/pdbs-summer-power-plan-60-capacity-gas-plants-stay-unutilised-4145386',
    'The Daily Star · April 2026'],
  dsAug: ['Load shedding off the charts once again',
    'https://www.thedailystar.net/news/bangladesh/news/load-shedding-the-charts-once-again-4244141', 'The Daily Star · August 2026'],
  paCapacity: ['Capacity charge rises to Tk 420bn', 'https://en.prothomalo.com/bangladesh/00fsa9wn5e', 'Prothom Alo · January 2026'],
  ieefaNext: ['Bangladesh’s next government must prioritise power sector sustainability',
    'https://ieefa.org/resources/bangladeshs-next-government-must-prioritise-power-sector-sustainability', 'IEEFA · January 2026'],
  hcu: ['Energy Scenario of Bangladesh 2024-25',
    'https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-hcu/2026/4/7d98255c-151c-4464-bf01-23cb1c92d5d9.pdf',
    'Hydrocarbon Unit, Energy and Mineral Resources Division · 2026'],
  tbsAdani: ['Why Adani Power remains Bangladesh’s costliest electricity import',
    'https://www.tbsnews.net/bangladesh/energy/why-adani-power-remains-bangladeshs-costliest-electricity-import-1491866',
    'The Business Standard · July 2026'],

  wbGhorasal: ['Bangladesh: Ghorasal Repowering Unit 4 Project',
    'https://www.worldbank.org/en/news/loans-credits/2015/12/21/bangladesh-ghorasal-repowering-unit-4-project', 'World Bank · December 2015'],
  dsCoal: ['Coal overtakes gas in power generation',
    'https://www.thedailystar.net/news/environment/natural-resources/energy/news/coal-overtakes-gas-power-generation-4161546',
    'The Daily Star · April 2026'],
  tbsBleed: ['What makes Bangladesh’s power sector bleed billions',
    'https://www.tbsnews.net/bangladesh/energy/what-makes-bangladeshs-power-sector-bleed-billions-1362771', 'The Business Standard · February 2026'],
  ebRental: ['All quick rental power plants retired: Power Minister',
    'https://energybangla.com/all-quick-rental-power-plants-retired-power-minister/', 'Energy Bangla · June 2026'],
  tbsCoalTariff: ['Govt moves to revise Rampal, Payra power tariffs using Matarbari rate as benchmark',
    'https://www.tbsnews.net/bangladesh/energy/govt-moves-revise-rampal-payra-power-tariffs-using-matarbari-rate-benchmark',
    'The Business Standard · December 2025'],

  pvTender95: ['Bangladesh launches tender for 95 MW of solar',
    'https://www.pv-magazine.com/2026/06/30/bangladesh-launches-tender-for-95-mw-of-solar/', 'pv magazine · June 2026'],
  ieefaDer: ['Bangladesh’s distributed energy resource sector taking shape, driven by industrial rooftop',
    'https://ieefa.org/articles/bangladeshs-distributed-energy-resource-sector-taking-shape-driven-industrial-rooftop', 'IEEFA · August 2026'],
  dtTeesta: ['Bangladesh’s largest solar park in Gaibandha ready',
    'https://www.dhakatribune.com/bangladesh/nation/308620/bangladesh%E2%80%99s-largest-solar-park-in-gaibandha-ready', 'Dhaka Tribune · April 2023'],
  tbsMongla: ['Country’s largest solar project in Mongla set to begin operations on 25 December',
    'https://www.tbsnews.net/bangladesh/energy/countrys-largest-solar-project-mongla-set-begin-operations-25-december-347596',
    'The Business Standard · December 2021'],
  pvSonagazi: ['Bangladeshi utility completes 75 MW solar project',
    'https://www.pv-magazine.com/2024/03/05/bangladeshi-utility-completes-75-mw-solar-project/', 'pv magazine · March 2024'],
  pvSirajganj: ['Chinese venture commissions 68 MW solar plant in Bangladesh',
    'https://www.pv-magazine.com/2024/07/01/chinese-venture-commissions-68-mw-solar-plant-in-bangladesh/', 'pv magazine · July 2024'],
  powerchina: ['Pabna 64 MW solar power plant enters commercial operation', 'https://en.powerchina.cn/2025-09/02/c_828995.htm', 'POWERCHINA · September 2025'],
  etSutiakhali: ['Sutiakhali 50 MW HDFC solar power plant',
    'https://www.energytransitionbd.org/infrastructure/sutiakhali-50-mw-hdfc-solar-power-plant', 'Energy Transition Bangladesh'],
  context: ['In Bangladesh, solar power brings work but land shortage slows growth',
    'https://www.context.news/net-zero/in-bangladesh-solar-power-brings-work-but-land-shortage-slows-growth', 'Context · August 2022'],
  cpdProc: ['Renewable Energy Procurement under the Public Procurement Act and Rules',
    'https://cpd.org.bd/resources/2026/01/Renewable-Energy-Procurement-under-the-Public-Procurement-Act-and-Rule.pdf',
    'Centre for Policy Dialogue · December 2025'],
  pvNetMeter: ['Bangladesh revises net metering rules to expand solar',
    'https://www.pv-magazine.com/2025/09/10/bangladesh-revises-net-metering-rules-to-expand-solar/', 'pv magazine · September 2025'],

  aiib: ['Southern Chattogram and Kaliakoir Transmission Infrastructure Development Project: project document',
    'https://www.aiib.org/en/projects/details/2024/_download/Bangladesh/AIIB-Bangladesh-Southern-Chattogram-and-Kaliakoir-Transmission-Infrastructure-Development-Project-Approval-PD_P000308_Final_assurance-cleared.pdf',
    'Asian Infrastructure Investment Bank · July 2024'],
  dtPayra: ['Govt fails to take power from Payra plant, counts capacity charge',
    'https://www.dhakatribune.com/bangladesh/nation/253741/govt-fails-to-take-power-from-payra-plant-counts', 'Dhaka Tribune · July 2021'],
  paRampal: ['Power transmission from Payra, Rampal plants to wait for 7 to 8 months',
    'https://en.prothomalo.com/bangladesh/power-transmission-from-payra-rampal-plants-to-wait-for-7-to-8-months', 'Prothom Alo · February 2022'],
  dsRooppurGrid: ['Gridline woes delay Rooppur power plant launch',
    'https://www.thedailystar.net/environment/natural-resources/energy/news/gridline-woes-delay-rooppur-power-plant-launch-3873686',
    'The Daily Star · April 2025'],
  dtRePolicy: ['Renewable energy policy approved',
    'https://www.dhakatribune.com/bangladesh/government-affairs/380534/renewable-energy-policy-approved', 'Dhaka Tribune · May 2025'],
  dsBess: ['The case for mainstreaming battery energy storage in Bangladesh',
    'https://www.thedailystar.net/opinion/views/news/case-mainstreaming-battery-energy-storage-bangladesh-4184531', 'The Daily Star · May 2026'],

  dsIepmp: ['Govt working to generate 40% electricity from clean energy by 2041',
    'https://www.thedailystar.net/environment/natural-resources/energy/news/govt-working-generate-40-electricity-clean-energy-2041-3223656',
    'The Daily Star · January 2023'],
  ieefaIepmp: ['Bangladesh’s IEPMP raises more questions than it answers',
    'https://ieefa.org/resources/bangladeshs-iepmp-raises-more-questions-it-answers', 'IEEFA · October 2024'],
  dsEpsmp: ['Power, energy: Govt unveils new 25-year master plan',
    'https://www.thedailystar.net/news/bangladesh/news/power-energy-govt-unveils-new-25-year-master-plan-4075896', 'The Daily Star · January 2026'],
  cpdEpsmp: ['The interim government’s Energy and Power Sector Master Plan: a review',
    'https://cpd.org.bd/resources/2026/01/Presentation_Interim-Governments-EPSMP.pdf', 'Centre for Policy Dialogue · January 2026'],
  ieej: ['Country report: Bangladesh', 'https://eneken.ieej.or.jp/data/13424.pdf', 'Institute of Energy Economics, Japan · June 2026'],
  bssJun: ['Power Minister briefs parliament on power and energy', 'https://www.bssnews.net/js-session/400700', 'BSS · June 2026'],
  bssSolar10: ['Government targets 10,000 MW of solar power by 2030', 'https://www.bssnews.net/news/413805', 'BSS · August 2026'],
  ds100day: ['Govt plans 100-day energy push', 'https://www.thedailystar.net/news/bangladesh/news/govt-plans-100-day-energy-push-4111011', 'The Daily Star · February 2026'],
  wnnLicence: ['Operating licence issued for first Bangladesh nuclear power unit',
    'https://world-nuclear-news.org/articles/operating-licence-issued-for-first-bangladesh-nuclear-power-unit', 'World Nuclear News · April 2026'],
  wnnFuel: ['Nuclear fuel loading completed at Rooppur 1',
    'https://world-nuclear-news.org/articles/nuclear-fuel-loading-completed-at-rooppur-1', 'World Nuclear News · May 2026'],

  ifcGuide: ['Utility-Scale Solar Photovoltaic Power Plants: A Project Developer’s Guide', null, 'International Finance Corporation · 2015'],
  berc: ['Bangladesh Energy Regulatory Commission Act, 2003', 'https://policy.asiapacificenergy.org/node/212', 'Asia Pacific Energy Portal'],
  legalseba: ['Environment clearance in Bangladesh under the new 2023 rules',
    'https://legalseba.com/bd-services/environment-clearance-in-bangladesh-under-the-new-2023-rules/', 'LegalSeba · August 2025'],
  bidaLoan: ['Procedures to obtain prior permission from BIDA to avail a foreign loan',
    'https://bida.gov.bd/details/what-are-procedures-be-performed-obtain-prior-permission-bida-avail-foreign-loan',
    'Bangladesh Investment Development Authority'],
  dsBorrow: ['BB eases foreign borrowing rules for BIDA-registered firms',
    'https://www.thedailystar.net/business/news/bb-eases-foreign-borrowing-rules-bida-registered-firms-4272696', 'The Daily Star · September 2026'],
  dfdl: ['Bangladesh: update on income tax exemptions for the renewable energy sector',
    'https://www.dfdl.com/insights/legal-and-tax-updates/bangladesh-update-on-income-tax-exemptions-for-the-renewable-energy-sector/',
    'DFDL · December 2024'],
  dsFdi: ['Nine hurdles keeping FDI away', 'https://www.thedailystar.net/business/economy/news/nine-hurdles-keeping-fdi-away-4231061', 'The Daily Star · July 2026'],
  tbsDues: ['Private power producers under pressure as govt dues top Tk27,000cr',
    'https://www.tbsnews.net/bangladesh/energy/private-power-producers-under-pressure-govt-dues-top-tk27000cr-1295881',
    'The Business Standard · November 2025'],
  etMeghnaghat: ['Meghnaghat 583 MW Summit dual fuel power plant, Unit 2',
    'https://www.energytransitionbd.org/infrastructure/meghnaghat-583-mw-summit-dual-fuel-power-plant-unit-2', 'Energy Transition Bangladesh'],

  ieefaFix: ['Fixing Bangladesh’s Power Sector',
    'https://ieefa.org/sites/default/files/2024-12/Fixing%20Bangladesh%E2%80%99s%20Power%20Sector_Dec2024.pdf', 'IEEFA · December 2024'],
  wb2026: ['Powering Bangladesh’s future with renewable energy',
    'https://www.worldbank.org/en/news/feature/2026/07/22/powering-bangladesh-s-future-with-renewable-energy', 'World Bank · July 2026'],
  dsWind: ['Can wind power emerge as a pillar of the energy mix?',
    'https://www.thedailystar.net/business/news/can-wind-power-emerge-pillar-the-energy-mix-4153951', 'The Daily Star · 2026'],
  aniNepal: ['Trilateral energy boost as Nepal resumes hydropower supply to Bangladesh via India',
    'https://aninews.in/news/world/asia/trilateral-energy-boost-as-nepal-resumes-hydropower-supply-to-bangladesh-via-india20260615105428/',
    'ANI · June 2026'],

  dsDirect: ['Private firms can now sell renewable power directly to customers',
    'https://www.thedailystar.net/business/news/private-firms-can-now-sell-renewable-power-directly-customers-4009276',
    'The Daily Star · October 2025'],
  dsCharges: ['Merchant power risks losing price appeal under proposed charges',
    'https://www.thedailystar.net/business/economy/news/merchant-power-risks-losing-price-appeal-under-proposed-charges-4251941',
    'The Daily Star · August 2026'],
  feMppTariff: ['BERC panel proposes Tk 6.48 solar power tariff for MPPs',
    'https://thefinancialexpress.com.bd/trade/berc-panel-proposes-tk-648-solar-power-tariff-for-mpps',
    'The Financial Express · August 2026'],
  dsHearing: ['Uproar at BERC hearing: Merchant power buyers slam proposed surcharges',
    'https://www.thedailystar.net/news/bangladesh/news/uproar-berc-hearing-merchant-power-buyers-slam-proposed-surcharges-4255406',
    'The Daily Star · August 2026'],
  bgmeaHearing: ['BGMEA calls for renewable energy tariff reforms at BERC hearing',
    'https://bgmea.com.bd/page/BGMEA_Calls_for_Renewable_Energy_Tariff_Reforms_at_BERC_Hearing',
    'BGMEA · August 2026'],
  bdnMerchant: ['Bangladesh’s ‘merchant’ renewable growth hinges on grid charges',
    'https://bdnews24.com/business/3fc5903bccd2', 'bdnews24.com · May 2026'],
} as const satisfies Record<string, Src>

/** One numbered reference line: the title as a link, then the source. */
const ref = (s: Src) => (s[1] ? num(link(s[0], s[1]), `, ${s[2]}`) : num(`${s[0]} | ${s[2]}`))
const refs = (...list: Src[]) => [h1('References'), ...list.map(ref)]
const say = (line: string) => quote(`${line}\n- Abdullah Bin Hossain`)
const P = '/photos/insights/'

/**
 * Photos of Faisal. They belong on the site's own pages (home, about, author card) and are never
 * used inside articles. The setup page uses this list to find and replace them in Notion.
 */
export const PERSONAL_PHOTOS = ['/photos/portrait.jpg', '/photos/standing.jpg', '/photos/boardroom.jpg',
  '/photos/desk-wide.jpg', '/photos/desk-portrait.jpg', '/photos/window.jpg'] as const

/* ── 1 ─────────────────────────────────────────────────────── */

const proposals: SampleArticle = {
  slug: 'why-power-proposals-never-reach-construction',
  title: 'Why so many power proposals in Bangladesh never reach construction',
  subtitle: 'Proposals are easy to submit and hard to build. Where projects stall between the letter of intent and the first pile, and what a sponsor can do at each stage.',
  topic: 'Project development',
  tags: ['Solar PV', 'PPP', 'IPP', 'Land'],
  date: '2026-09-12',
  cover: `${P}solar-hillside.jpg`,
  coverCaption: 'A plant that reached construction: most proposals stall long before this point | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('Most proposals stall on land, grid and bankability, not on the technology or the capital.'),
      bullet('The route has changed: unsolicited deals have given way to competitive tenders, and government land is now open to solar under PPP.'),
      bullet('Sponsors who arrive with a verified site, a grid study and a financeable structure move fastest.'),
    ]),

    h1('The gap between a proposal and a project'),
    para('Bangladesh has no shortage of power proposals. Letters of intent, memoranda of understanding and unsolicited offers arrive every year. Far fewer reach financial close, and fewer still reach construction.'),
    para('The reasons are rarely technical. A solar plant is well-understood engineering. What stops projects is everything around it: land, the grid connection, approvals across several agencies, the terms of the power purchase agreement, and the time it takes to line all of them up at once.'),

    h1('Land and site: where projects stall first'),
    h2('Pre-feasibility and site selection'),
    image(`${P}solar-aerial.jpg`, 'Small: A utility-scale plant needs a large, contiguous site, and land is where most proposals stall first | Photo: Unsplash'),
    para('A utility-scale solar plant needs a large, contiguous site close to a substation with spare capacity. Land is one of the main constraints on utility-scale solar in Bangladesh, and assembling a site from many small holdings is where cost and time run away first.[5]'),
    para('That is why the work starts with pre-feasibility: screening candidate sites for grid access, flood risk, land classification and ownership before anyone commits money to a proposal.'),
    h2('Digital survey and land records'),
    para('A digital land survey, mapping plots, ownership and access, turns a promising site into a verifiable one. Lenders and reviewers ask for exactly this evidence, and most proposals arrive without it.'),

    h1('Grid, tariff and bankability'),
    para('A site without a realistic grid connection is not a project. Evacuation capacity, bay extensions and transmission timelines need to be settled with the grid company early, not studied after the proposal is accepted.'),
    image(`${P}power-station-pylon.jpg`, 'Wide: A site without a realistic grid connection is not a project | Photo: Unsplash'),
    para('Tariffs have fallen sharply since the market moved to open, competitive bidding. In BPDB’s recent solar tenders, bids averaged 8.27 US cents per kWh, against 13.29 cents under the earlier negotiated deals.[2] That is good for the buyer, but it leaves less margin for delay, which makes preparation more valuable, not less.'),
    para('Bankability now rests on the contract terms themselves: payment security, termination rights and compensation. Investors have raised concerns about those terms in recent tenders, and lenders read them closely.[1][5]'),
    para('Table 1 · Where proposals stall, and what moves them'),
    table([
      ['Stage', 'What stalls it', 'What moves it'],
      ['Pre-feasibility', 'Unverified sites', 'Screened sites, grid proximity, land status'],
      ['Land', 'Fragmented ownership', 'Digital survey, a clear acquisition path'],
      ['Feasibility', 'Optimistic assumptions', 'Full technical, financial and regulatory study'],
      ['Approvals', 'Many agencies, no owner', 'A stakeholder map and someone following every file'],
      ['Finance', 'An unclear structure', 'Banking, offshore accounts, tax and repatriation planned early'],
    ], { header: true, rowHeader: true }),

    h1('The route has changed: PPP and IPP'),
    para('Since the political transition of August 2024, the letters of intent for 37 renewable power projects have been cancelled and procurement has moved to open tenders.[1] Independent power producers now compete for capacity that BPDB puts out to tender. In May 2026 BPDB signed agreements with 12 of them for 918 MW of solar at an average of 7.80 US cents per kWh,[6] and the new government is looking again at renewable projects cancelled in 2024.[7]'),
    para('In April 2026 the Power Division issued guidelines that let private developers build renewable plants on government-owned land under the PPP model, with BPDB as the contracting authority and the PPP Authority coordinating between agencies.[3] They sit under the Renewable Energy Policy 2025, which targets 20 percent of electricity from renewables by 2030 and 30 percent by 2040.[4]'),
    say('The capital and the technology are the easy part.'),
    para('For a sponsor, the practical question is which route fits the project (a BPDB tender, a PPP on public land, or a private site) and what each one requires on the ground.'),
    columns(
      [image(`${P}solar-rows.jpg`, 'A tendered IPP plant and a PPP plant on public land look alike; the contracts behind them do not | Photo: Unsplash')],
      [image(`${P}solar-field.jpg`)],
    ),

    h1('Where a local partner fits'),
    para('Each of the stages above has a piece of work that decides whether the project moves. This is the work I do for sponsors and developers:'),
    num(bold('Pre-feasibility and site selection.'), ' Location, grid proximity and land status, screened before money is committed.'),
    num(bold('Land and digital survey.'), ' Ownership mapping and a realistic acquisition path a lender can check.'),
    num(bold('Full feasibility.'), ' The technical, financial and regulatory case in one document reviewers and lenders can read.'),
    num(bold('Government stakeholders and approvals.'), ' Introductions, meetings and follow-up with BPDB, the Power Division, SREDA, the grid company and every office that signs.'),
    num(bold('Project audit.'), ' An independent check of the whole file before it goes to a reviewer or a lender.'),
    num(bold('Law, banking, tax and finance.'), ' Bangladesh law, local and offshore banking, NBR and IRD requirements, and the finance structure behind the project.'),
    para('None of this replaces the sponsor’s own team. It gives them someone on the ground who knows which document each office will ask for, and follows it until it is signed.'),

    ...refs(SRC.tbsLoi, SRC.tbsTariff, SRC.dsPpp, SRC.tbsTargets, SRC.chambers, SRC.bss918, SRC.tbs31),
  ],
}

/* ── 2 ─────────────────────────────────────────────────────── */

const pppLand: SampleArticle = {
  slug: 'solar-on-government-land-2026-ppp-guideline',
  title: 'Solar on government land: what the 2026 PPP guideline changes',
  subtitle: 'Public land is now open to utility-scale solar under the PPP model. How the route works, who does what, and where the risks still sit.',
  topic: 'PPP',
  tags: ['Solar PV', 'Land', 'BPDB', 'SREDA'],
  date: '2026-08-28',
  cover: `${P}solar-panels.jpg`,
  coverCaption: 'Public land can now host utility-scale solar under the PPP model | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('Land held by government agencies, including railway, road, bridge and water board land, can now host renewable plants under PPP, with BPDB as the contracting authority.[1]'),
      bullet('Developers are chosen by international competitive bidding, and solar and wind projects must be at least 50 MW.[1]'),
      bullet('The guideline takes away the hardest part of land assembly. Grid, contract and finance risk remain, and they still decide whether a project is built.'),
    ]),

    h1('What the guideline is'),
    para('On 12 April 2026 the Power Division unveiled the ', ital('Guidelines for Development of Renewable Energy Projects using Land Owned by Government Agencies under PPP Modality, 2026'), '.[1] They let private developers build renewable plants on land that belongs to public bodies, instead of assembling private plots themselves.'),
    para('The land sits with agencies such as Bangladesh Railway, the Roads and Highways Division, the Bangladesh Bridge Authority and the Bangladesh Water Development Board.[1] Land held by these agencies often comes in long strips or scattered parcels (rights of way, embankments, reserve land), so site screening matters even more than on a single private plot.'),

    h1('Who does what'),
    para('The guideline spreads the work across several institutions. Knowing which one owns each decision saves months.'),
    para('Table 1 · Roles under the 2026 PPP guideline'),
    table([
      ['Role', 'Who', 'What they do'],
      ['Contracting authority', 'BPDB', 'Selects the private partner and oversees implementation'],
      ['Coordination', 'PPP Authority', 'Resolves issues between the agencies involved'],
      ['Regulation', 'SREDA', 'Nodal agency for regulatory and facilitation work through the project’s life'],
      ['Grid', 'Power Grid Bangladesh PLC', 'Transmission and grid connection'],
      ['Land', 'The land-owning agency', 'Signs a three-year MoU with BPDB; receives lease payments, a minority equity stake, or both'],
      ['Developer', 'The private sponsor, through an SPV', 'Wins the bid, then finances, builds and operates the plant'],
    ], { header: true, rowHeader: true }),

    h1('How a project is selected'),
    para('Developers are selected through international competitive bidding or another PPP-compliant method.[1] Solar and wind projects must be at least 50 MW; smaller tidal, wave and geothermal projects can go ahead with Power Division approval.[1] Each project is carried by a special purpose vehicle.'),
    para('In practice this looks more like a tender than a negotiation. The sponsors who do well are the ones who have already studied the site, the grid connection and the numbers before the bid documents come out.'),

    h1('What changes for a sponsor'),
    h2('Land'),
    image(`${P}solar-meadow.jpg`, 'Small: Public land often comes in long strips beside roads, railways and embankments | Photo: Unsplash'),
    para('Land is one of the main constraints on utility-scale solar in Bangladesh.[2] Under a normal BPDB tender, the developer has to find and secure it. Under the PPP route, a public agency identifies the land and makes it available through the MoU, which is the single largest change.'),
    h2('A return for the land-owning agency'),
    para('The agency is paid through lease payments, a minority equity stake, or a mix of the two, depending on the project.[1] A sponsor needs to price that into the model from the first pre-feasibility study, not after the bid.'),

    h1('What does not change'),
    para('The guideline solves access to land. It does not solve everything else.'),
    bullet(bold('Grid.'), ' The site still needs evacuation capacity at a nearby substation, and Power Grid Bangladesh has to agree the connection.[1]'),
    bullet(bold('Contract terms.'), ' Lenders will still read the power purchase agreement for payment security, termination and compensation, terms investors have questioned in recent tenders.[2][3]'),
    bullet(bold('Approvals.'), ' Environmental clearance and the permits and registrations every power project needs, across several offices.'),
    bullet(bold('Finance.'), ' Local and offshore banking, foreign-exchange and repatriation planning, and NBR tax treatment still have to be structured for the SPV.'),
    say('Free land is not a free project.'),

    h1('How to prepare for a PPP bid'),
    para('The work before the bid decides the bid. For government land, I would do it in this order:'),
    num(bold('Screen the candidate sites.'), ' Grid distance, flood risk, access and any existing use of the land.'),
    num(bold('Survey them digitally.'), ' Map boundaries and encroachments so the land schedule in the bid is accurate.'),
    num(bold('Study the grid connection.'), ' Talk to the grid company early about capacity at the nearest substation.'),
    num(bold('Build the full feasibility case.'), ' Technical, financial and regulatory, including the land agency’s share.'),
    num(bold('Map the stakeholders.'), ' BPDB, the PPP Authority, SREDA, the land-owning agency and the grid company each have a role. Know who signs what.'),
    num(bold('Structure the finance.'), ' Banking, offshore accounts, NBR and IRD requirements, and repatriation, planned before the bid.'),

    ...refs(SRC.dsPpp, SRC.chambers, SRC.tbsLoi),
  ],
}

/* ── 3 ─────────────────────────────────────────────────────── */

const routes: SampleArticle = {
  slug: 'ppp-ipp-or-private-site-choosing-a-solar-route',
  title: 'PPP, IPP tender or merchant plant: choosing the route for a solar project',
  subtitle: 'Three ways to build utility-scale solar in Bangladesh, what each one asks of a sponsor, and how to tell which fits your project.',
  topic: 'Regulatory',
  tags: ['Solar PV', 'PPP', 'IPP', 'MPP'],
  date: '2026-08-10',
  cover: `${P}pylons-dusk.jpg`,
  coverCaption: 'The route decides who buys the power and how it reaches them | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('There are three routes to utility-scale solar in Bangladesh today: a BPDB tender, a PPP on government land, and a merchant plant selling to large consumers.'),
      bullet('They differ most on who provides the land, who buys the power and how the price is set.'),
      bullet('Pick the route from the site and the buyer, not the other way round.'),
    ]),

    h1('Route 1: a BPDB tender (IPP)'),
    para('Since the move away from unsolicited deals, BPDB buys new solar capacity through open tenders.[1] Between December 2024 and March 2025 it tendered 55 grid-connected solar plants with a combined 5,238 MW, in four packages.[2]'),
    para('Competition has pushed prices down. Bids in those tenders averaged 8.27 US cents per kWh, against 13.29 cents under the earlier negotiated deals; the lowest was 7.49 cents.[2]'),
    para('The sponsor finds and secures the land, and signs a power purchase agreement with BPDB. The open questions for lenders are the contract terms: payment security, termination, and the absence of the government implementation agreements earlier projects had.[1][2]'),

    h1('Route 2: PPP on government land'),
    para('Since April 2026, land held by government agencies can be offered for renewable plants under the PPP model, with BPDB as the contracting authority and developers chosen by international competitive bidding.[3] Solar projects must be at least 50 MW.[3]'),
    para('The big difference is land: the agency provides it, in return for lease payments, a minority equity stake or both.[3] Grid, contract and finance risk stay with the project.'),

    h1('Route 3: a merchant plant selling to large consumers'),
    para('A policy gazetted in October 2025 lets private investors build renewable merchant power plants (MPPs) and sell the output directly to large and bulk consumers under negotiated contracts, wheeling it over the national grid on open access.[6][4]'),
    para('The rules are specific. Buyers qualify by connection voltage, from under 5 MW at 11 kV to more than 140 MW at 230 kV. A distribution utility may buy up to 20 percent of the plant’s output but is not obliged to, there is no government guarantee, and the system operator can limit output for system security without compensation. Each project needs Power Division approval and a BERC licence, and SREDA can issue renewable energy certificates that pass to the buyers.[6]'),
    para('This is the closest Bangladesh has to a corporate PPA. Export manufacturers, especially garment and textile factories whose buyers ask for green power, are the natural customers. The buyer’s credit matters as much as the plant’s, and the open-access charges set by BERC decide how much of the saving reaches the buyer. Rooftop systems are a separate case, covered by the Net Metering Guideline 2025.[4]'),
    image(`${P}power-station-substation.jpg`, 'Wide: A merchant plant’s power reaches its buyers over the national grid, on open access | Photo: Unsplash'),

    h1('The three routes side by side'),
    para('Table 1 · Three routes to utility-scale solar'),
    table([
      ['', 'BPDB tender (IPP)', 'PPP on government land', 'Merchant plant (MPP)'],
      ['Land', 'Sponsor secures it', 'Government agency provides it', 'Sponsor secures it'],
      ['Buyer', 'BPDB', 'BPDB', 'Large or bulk consumers'],
      ['Price', 'Competitive bid', 'Competitive bid', 'Negotiated with each buyer'],
      ['Selection', 'Open tender', 'International competitive bidding', 'Power Division approval and a BERC licence'],
      ['Main risk', 'Land and contract terms', 'Grid and contract terms', 'Buyer credit and open-access charges'],
    ], { header: true, rowHeader: true }),

    h1('How to choose'),
    para('Three questions settle most of it:'),
    num(bold('Do you already have land?'), ' A secured private site points to a BPDB tender or a merchant plant. No site points to PPP.'),
    num(bold('Who will buy the power?'), ' BPDB for the first two routes. For a merchant plant, factories with a balance sheet a lender will accept, and a daytime load that matches solar output.'),
    num(bold('How will the money move?'), ' Local and offshore accounts, NBR and IRD requirements, and the repatriation plan look different for each route. Settle them early.'),
    say('Choose the route from the site and the buyer. Everything else follows.'),
    para('Whichever route you take, the same groundwork comes first: pre-feasibility and site selection, land and digital survey, a full feasibility study, government approvals, an independent audit of the file, and a finance structure that works under Bangladesh law and banking rules. That is the work I help sponsors with.'),

    ...refs(SRC.tbsLoi, SRC.tbsTariff, SRC.dsPpp, SRC.chambers, SRC.tbsTargets, SRC.mppPolicy),
  ],
}

/* ── 4 · the power system ─────────────────────────────────── */

const system: SampleArticle = {
  slug: 'bangladesh-power-system-2026-capacity-fuel',
  title: 'Bangladesh’s power system in 2026: more capacity than it can fuel',
  subtitle: 'Installed capacity has outgrown demand, yet load-shedding is back. Where the gap comes from, and what it means for anyone planning a new plant.',
  topic: 'Power sector',
  tags: ['BPDB', 'Gas', 'LNG', 'Capacity charge'],
  date: '2026-09-05',
  cover: `${P}power-station-substation.jpg`,
  coverCaption: 'Thermal plants still make most of Bangladesh’s electricity | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('Grid capacity is close to 29 GW, but the most the grid has ever delivered is 17.2 GW, and load-shedding still happens.[1][2]'),
      bullet('The limit is fuel, above all gas. Power plants get far less gas than the fleet could burn, so many of them stand idle.[4]'),
      bullet('Idle plants still cost money: capacity charges reached Tk 42,000 crore in FY2024-25.[6]'),
    ]),

    h1('Capacity is not the problem'),
    para('On paper Bangladesh has plenty of power plants. The Power Minister told parliament in April 2026 that total generation capacity stood at 32,332 MW, of which 28,919 MW is connected to the national grid; the rest is captive and off-grid capacity.[1]'),
    para('Demand is well below that. The highest output ever delivered to the grid was 17,200 MW, reached on 20 May 2026, and even that evening about 400 MW of load had to be shed.[2] In FY2024-25 the reserve margin, the capacity kept above peak demand, was 61.3 percent.[7]'),
    para('Table 1 · The system in numbers'),
    table([
      ['Measure', 'Figure', 'When'],
      ['Installed capacity, all plants [1]', '32,332 MW', 'April 2026'],
      ['Of which on the grid [1]', '28,919 MW', 'April 2026'],
      ['Record output delivered [2]', '17,200 MW', '20 May 2026'],
      ['Reserve margin [7]', '61.3 percent', 'FY2024-25'],
      ['Capacity charges paid [6]', 'Tk 42,000 crore', 'FY2024-25'],
    ], { header: true, rowHeader: true }),

    h1('Fuel is the real constraint'),
    image(`${P}coal-stacks.jpg`, 'Small: Coal and imports now fill much of the gap left by gas | Photo: Unsplash'),
    para('The fleet leans heavily on gas. In May 2026 gas plants made up 12,472 MW of capacity, coal 7,769 MW and oil-fired plants 5,641 MW, with 1,160 MW of imports and less than 1,100 MW of solar, hydro and wind together.[3]'),
    para('Gas is also what is missing. Domestic fields are declining, and power plants receive only a fraction of the gas they could use: around 900 million cubic feet a day in the spring of 2026, against about 2,524 needed to run every gas plant. Some 60 percent of gas-fired capacity was expected to sit idle through the summer.[4]'),
    para('When imported LNG falters, the shortfall shows up at once. After a floating LNG terminal went out of service in July 2026, load-shedding reached about 3,000 MW in early August.[5]'),

    h1('What generation actually looks like'),
    para('In FY2024-25 the grid produced 101,187 GWh. Gas supplied 44 percent, coal 27 percent, imports 16 percent and furnace oil 11 percent, with solar, hydro and wind about 2 percent between them.[8]'),
    para('Imports are not cheap. Electricity from Adani’s Godda plant in India, the largest single import contract, cost Tk 14.86 per kWh in FY2024-25.[9]'),
    image(`${P}pylons-dusk.jpg`, 'Wide: A fleet built for 29 GW runs well below that for most of the year | Photo: Unsplash'),

    h1('Paying for plants that do not run'),
    para('Private plants are paid a capacity charge for being available, whether or not they are dispatched. As more plants sat idle for lack of fuel, those payments rose: Tk 25,000 crore in FY2022-23, Tk 32,000 crore in FY2023-24 and Tk 42,000 crore in FY2024-25.[6]'),
    para('That is the sector’s central tension. Adding capacity no longer solves load-shedding. Securing fuel, cutting the cost of each unit generated and moving electricity to where it is needed do.'),
    say('Bangladesh does not need more megawatts on paper. It needs megawatts it can fuel and pay for.'),

    h1('What this means for a new project'),
    para('A new proposal is judged against this background. The projects that move are the ones that lower the fuel bill or the cost per unit, rather than adding to the capacity charge:'),
    bullet(bold('Solar and other renewables.'), ' No fuel to import, and competitive bids have come in well below older tariffs.[10]'),
    bullet(bold('Efficient gas and storage.'), ' Plants and batteries that get more electricity out of scarce gas, or move solar into the evening peak.'),
    bullet(bold('Grid and fuel infrastructure.'), ' Transmission and supply projects that let existing plants run.'),
    para('For sponsors, that means building the case around cost per kWh, fuel security and grid access from the very first study.'),

    ...refs(SRC.bssCapacity, SRC.dsRecord, SRC.mongabay, SRC.dsSummer, SRC.dsAug, SRC.paCapacity, SRC.ieefaNext, SRC.hcu, SRC.tbsAdani, SRC.tbsTariff),
  ],
}

/* ── 5 · efficiency ───────────────────────────────────────── */

const efficiency: SampleArticle = {
  slug: 'power-plant-efficiency-bangladesh',
  title: 'Efficiency first: what Bangladesh’s power plants really deliver',
  subtitle: 'A plant’s nameplate says little about what it costs to run. Plant factor, efficiency and fuel cost decide which plants are worth keeping, and which new ones are worth building.',
  topic: 'Efficiency',
  tags: ['Gas', 'Coal', 'Plant factor', 'Tariff'],
  date: '2026-07-06',
  cover: `${P}power-station-river.jpg`,
  coverCaption: 'Older steam units burn far more fuel for each unit of electricity than modern plants | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('The fleet produced about 42 percent of what it could have in FY2024-25, by a simple calculation from official figures.[1]'),
      bullet('An old gas steam unit turns about 31 percent of its fuel into electricity; a modern combined cycle plant about 54 percent.[2]'),
      bullet('Oil-fired electricity cost almost four times as much as gas-fired electricity in FY2024-25.[3]'),
    ]),

    h1('Plant factor: how much of the capacity is used'),
    para('Plant factor compares what a plant actually produces with what it could produce running at full output all year. For the whole fleet, dividing FY2024-25 generation (101,187 GWh) by installed capacity (27,414 MW) gives about 42 percent.[1]'),
    para('Part of that is normal, because demand is lower at night and in winter. Most of it is not. Plants stand idle because there is no gas for them, and some were never needed: a review committee set up after August 2024 estimated that 7,700 to 9,500 MW of capacity is unnecessary or unusable.[4]'),

    h1('Efficiency: how much fuel each unit takes'),
    para('Efficiency is the share of the fuel’s energy that becomes electricity, and the difference between technologies is large. When the World Bank financed the repowering of Ghorasal Unit 4, the old gas steam unit was about 31 percent efficient. Converting it to combined cycle was expected to raise that to about 54 percent, from the same gas.[2]'),
    para('With gas this scarce, the gap matters more than ever. Every cubic foot burned in an old steam plant instead of a combined cycle plant produces far less electricity.'),
    image(`${P}power-station-pylon.jpg`, 'Wide: The same fuel can make much more electricity in a modern plant | Photo: Unsplash'),

    h1('Fuel cost: what each unit costs to make'),
    para('Table 1 · Average generation cost by fuel, FY2024-25 [3]'),
    table([
      ['Fuel', 'Cost per kWh'],
      ['Gas', 'Tk 7.09'],
      ['Coal', 'Tk 13.20'],
      ['Liquid fuel (oil)', 'Tk 27.39'],
    ], { header: true, rowHeader: true }),
    para('Gas remains the cheapest fuel when it is available, and oil the most expensive by far.[3] Even within one technology the spread is wide. Among the large coal plants, the tariff at Matarbari is about Tk 8.45 per unit, against Tk 13.57 at Rampal and Tk 12 at Payra, which is why the government has moved to review the latter two.[5]'),

    h1('Losses between the plant and the customer'),
    para('Efficiency does not end at the plant fence. Transmission and distribution losses were 10.13 percent in FY2024-25, slightly higher than the year before.[6] Every point saved is generation that no longer has to be built or fuelled.'),

    h1('What an efficiency-first plan looks like'),
    para('The practical steps follow from the numbers:'),
    num(bold('Retire the least efficient units.'), ' The quick rental plants have been retired, according to the Power Minister.[7] Old steam units and high-cost oil plants are next in line.'),
    num(bold('Repower rather than add.'), ' Converting old units to combined cycle gets more power from the same gas.'),
    num(bold('Pay for energy, not idle capacity.'), ' Contracts that pay for electricity delivered, rather than for availability, put the fuel risk where it can be managed.'),
    num(bold('Cut network losses.'), ' Metering, maintenance and grid upgrades are some of the cheapest megawatts there are.'),
    say('The cheapest megawatt is the one you get from fuel you already burn.'),
    para('For a sponsor, efficiency is also the strongest commercial argument. A project that lowers the cost per unit, or saves scarce gas, is easier to justify to reviewers and lenders than one that simply adds capacity.'),

    ...refs(SRC.hcu, SRC.wbGhorasal, SRC.dsCoal, SRC.tbsBleed, SRC.tbsCoalTariff, SRC.ieefaNext, SRC.ebRental),
  ],
}

/* ── 6 · solar ────────────────────────────────────────────── */

const solar: SampleArticle = {
  slug: 'utility-scale-solar-bangladesh-yield-land-bankability',
  title: 'Utility-scale solar in Bangladesh: yield, land and what makes a plant bankable',
  subtitle: 'The country’s largest solar plants show what works: a good site near the grid, enough non-farm land, and a tariff lenders believe in.',
  topic: 'Solar PV',
  tags: ['Land', 'Tariff', 'Rooftop', 'BPDB'],
  date: '2026-09-01',
  cover: `${P}solar-field.jpg`,
  coverCaption: 'Ground-mounted solar needs about three and a half acres per megawatt | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('Bangladesh has about 1.5 GW of solar, a small share of the grid, and industrial rooftops are growing fastest.[1][2]'),
      bullet('Well-run plants here produce around 20 to 22 percent of their rated output over a year.[8]'),
      bullet('Land, not sunshine, is the main constraint: about 3.5 acres per megawatt, in a country that protects its farmland.[9]'),
    ]),

    h1('Where solar stands'),
    para('Solar is still a small part of the system. Installed solar capacity was about 1,513 MW in mid-2026, out of roughly 1,805 MW of clean energy capacity.[1] Industrial rooftops are the fastest-growing segment: the official rooftop figure is 418 MW, while IEEFA counted 667 MW across 239 sites.[2]'),

    h1('The largest plants in operation'),
    para('Table 1 · Selected utility-scale solar plants'),
    table([
      ['Plant', 'Capacity', 'In operation'],
      ['Teesta, Sundarganj, Gaibandha [3]', '200 MWac', '2023'],
      ['Mongla, Bagerhat [4]', '100 MWac', 'December 2021'],
      ['Sonagazi, Feni [5]', '75 MW', '2024, trial run'],
      ['Sirajganj [6]', '68 MW', 'July 2024'],
      ['Pabna [7]', '64 MWac', 'September 2025'],
      ['Sutiakhali, Mymensingh [8]', '50 MWac', 'November 2020'],
    ], { header: true, rowHeader: true }),

    h1('Yield: what a megawatt produces'),
    image(`${P}solar-panels.jpg`, 'Small: Panel choice matters less than site, soiling and grid availability | Photo: Unsplash'),
    para('The best-documented Bangladeshi plants deliver a plant load factor of around 20 to 22 percent. The 50 MW Sutiakhali plant in Mymensingh produced about 96 GWh in FY2022-23, a plant factor of 21.9 percent.[8]'),
    para('Yield depends on more than sunshine. Flooding and soft soils raise civil costs, soiling and haze cut output, and a plant the grid cannot always take will produce less than its model says. A bankable yield study treats each of these as an uncertainty, not a footnote.'),

    h1('Land: the hardest part'),
    para('The Mymensingh plant used about 3.48 acres per megawatt, and buying its land took around two years, because the country’s land-use policy restricts converting fertile farmland.[9] In one of the most densely populated countries in the world, large flat plots close to a substation are scarce.'),
    para('This is why government land matters. The 2026 PPP guideline opens land held by public agencies to renewable projects of 50 MW and more.[10]'),
    columns(
      [image(`${P}solar-rows.jpg`, 'Plant layout follows the land: rows, access roads and drainage all take space | Photo: Unsplash')],
      [image(`${P}solar-hillside.jpg`)],
    ),

    h1('Tariffs and tenders'),
    para('Competitive bidding has changed the economics. In BPDB’s 2024-25 solar tenders, bids averaged 8.27 US cents per kWh, against 13.29 cents under earlier negotiated deals.[11] Interest was uneven: in the 2025 round, 23 packages drew a single bid and 13 drew none.[12]'),
    para('In May 2026 BPDB signed agreements with 12 IPPs for 918 MW at an average of 7.80 US cents per kWh, with commercial operation expected in 2028 and 2029.[13]'),
    para('Rooftop solar is moving faster. The Net Metering Guideline 2025 raised the limit to 100 percent of a customer’s sanctioned load and opened net metering to more customers.[14]'),

    h1('What makes a solar plant bankable'),
    num(bold('A site that is verified.'), ' Title, flood level, access and non-agricultural status confirmed by survey, not assumed.'),
    num(bold('A grid connection that is agreed.'), ' Evacuation capacity at the nearest substation confirmed with the grid company.'),
    num(bold('A yield that is defensible.'), ' P50 and P90 estimates from site data, with soiling, degradation and curtailment included.'),
    num(bold('A tariff that covers the risks.'), ' Priced for the land, the connection and the payment terms of the buyer.'),
    say('In Bangladesh the sun is the easy part of a solar project.'),

    ...refs(SRC.pvTender95, SRC.ieefaDer, SRC.dtTeesta, SRC.tbsMongla, SRC.pvSonagazi, SRC.pvSirajganj, SRC.powerchina,
      SRC.etSutiakhali, SRC.context, SRC.dsPpp, SRC.tbsTariff, SRC.cpdProc, SRC.bss918, SRC.pvNetMeter),
  ],
}

/* ── 7 · grid ─────────────────────────────────────────────── */

const grid: SampleArticle = {
  slug: 'grid-first-transmission-bangladesh-power-plants',
  title: 'Grid first: why transmission decides which power plants Bangladesh can use',
  subtitle: 'A plant is only as useful as the line that carries its power. How evacuation, substation capacity and grid rules shape a project, and what to settle before anything else.',
  topic: 'Transmission',
  tags: ['PGCB', 'Evacuation', 'BESS', 'Renewables'],
  date: '2026-08-05',
  cover: `${P}pylons-sunset.jpg`,
  coverCaption: 'Every large plant depends on the high-voltage network | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('Several large plants were finished before the lines to carry their power, and were paid for capacity they could not deliver.[2]'),
      bullet('Where a plant connects matters as much as how big it is: a congested substation limits what reaches customers.'),
      bullet('Renewables have priority dispatch in policy, but grid-scale storage still has no targets or payment route.[5][6]'),
    ]),

    h1('The network in brief'),
    para('Power Grid Bangladesh PLC (PGCB) runs the high-voltage network. In June 2023 it operated 14,717 circuit kilometres of lines with 61,525 MVA of substation capacity.[1] The network has grown fast, but not always at the same pace as the plants connected to it.'),

    h1('When the plant is ready and the line is not'),
    image(`${P}power-station-pylon.jpg`, 'Small: Evacuation lines are as much a part of the project as the plant | Photo: Unsplash'),
    para('The 1,320 MW Payra plant is the best-known example. For months after it was ready it could send only about half its output to the grid, because the 400 kV line across the Padma was late, while capacity payments of around Tk 130 crore a month continued.[2] Power from Rampal waited on the same line.[3]'),
    para('The Rooppur nuclear plant needs about 669 km of new transmission lines, and delays to them have pushed back its connection to the grid.[4]'),

    h1('The constraints a project runs into'),
    bullet(bold('Evacuation capacity.'), ' The nearest substation needs spare capacity, or an upgrade that someone has agreed to build and pay for.'),
    bullet(bold('Congested corridors.'), ' Where the network between regions is weak, a plant in the wrong place cannot sell all it can make.'),
    bullet(bold('Variable output.'), ' Solar and wind need a grid that can absorb their swings. Under the Renewable Energy Policy 2025, renewables have priority dispatch and must run except in unavoidable situations.[5]'),
    bullet(bold('Curtailment.'), ' Under the 2025 merchant power policy, the system operator may limit a plant’s output for system security without compensation.[7]'),
    image(`${P}pylons-dusk.jpg`, 'Wide: Transmission timelines belong on the project’s critical path | Photo: Unsplash'),

    h1('Storage: the missing piece'),
    para('Batteries can move midday solar into the evening peak and steady the grid. More than 150 MW of grid-scale storage has been initiated, but the policy framework sets no targets, procurement route or payment mechanism for it yet.[6]'),

    h1('What to settle with the grid company early'),
    num(bold('Point of connection.'), ' The substation, voltage level and route, confirmed with PGCB or the distribution utility.'),
    num(bold('Load flow study.'), ' Proof that the network can take the plant’s full output, including when a line is out of service.'),
    num(bold('Who builds what.'), ' The line and bay extension, their cost and their schedule, written into the project agreements.'),
    num(bold('Curtailment terms.'), ' How often output may be limited, and what happens when it is.'),
    say('Settle the grid first. The plant is the part you can control.'),

    ...refs(SRC.aiib, SRC.dtPayra, SRC.paRampal, SRC.dsRooppurGrid, SRC.dtRePolicy, SRC.dsBess, SRC.mppPolicy),
  ],
}

/* ── 8 · vision ───────────────────────────────────────────── */

const vision: SampleArticle = {
  slug: 'bangladesh-power-sector-vision-master-plan',
  title: 'Bangladesh’s power sector vision: from the 2023 master plan to the 2026 roadmap',
  subtitle: 'The targets have changed twice in three years. What the plans now say about demand, renewables, nuclear and gas, and what a sponsor should take from them.',
  topic: 'Policy',
  tags: ['Master plan', 'Renewables', 'Rooppur', 'Gas'],
  date: '2026-08-18',
  cover: `${P}solar-aerial.jpg`,
  coverCaption: 'Renewables targets are rising, from a small base | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('The 2023 master plan aimed for 40 percent clean electricity by 2041, counting nuclear, hydrogen, ammonia co-firing and carbon capture as clean.[1][2]'),
      bullet('A new 25-year plan in January 2026 lowered the long-term demand forecast.[3][4]'),
      bullet('The Renewable Energy Policy 2025 targets 20 percent of electricity from renewables by 2030 and 30 percent by 2040.[5]'),
    ]),

    h1('The 2023 master plan'),
    para('The Integrated Energy and Power Master Plan (IEPMP), adopted in 2023, set a goal of 40 percent of electricity from clean sources by 2041.[1] Critics pointed out that "clean" included nuclear power, hydrogen and ammonia co-firing and carbon capture, and that the plan still projected rising LNG imports.[2]'),
    para('It also assumed fast growth in demand, with peak demand of about 27 GW by 2030 and 50 GW by 2040.[6]'),

    h1('A new master plan in 2026'),
    para('In January 2026 the interim government published a new Energy and Power Sector Master Plan for 2026 to 2050, replacing the IEPMP. It projects demand of about 59,000 MW by 2050 and puts the investment needed at US$177 to 192 billion.[3]'),
    para('A review by the Centre for Policy Dialogue notes renewables targets of 20 percent by 2030, 30 percent by 2040 and 40 to 50 percent by 2050, but also that the plan still relies on hydrogen, ammonia and carbon capture, and that its demand forecast is, in CPD’s view, still too high.[4]'),
    image(`${P}solar-meadow.jpg`, 'Wide: Most of the new capacity in the plans is solar | Photo: Unsplash'),

    h1('Renewables policy and the new government’s targets'),
    para('The Renewable Energy Policy 2025, approved in May 2025, set targets of 20 percent of electricity from renewables by 2030 and 30 percent by 2040.[5] The government that took office in February 2026 has set a goal of 10,000 MW of solar by 2030,[8] and in June 2026 it withdrew customs duties on solar equipment and extended a tax holiday for renewable projects.[7]'),
    para('Gas remains central. The new government’s first 100-day energy programme focused on exploration and 46 wells meant to add 652 million cubic feet of gas a day by FY2026-27.[9]'),

    h1('Nuclear: Rooppur'),
    para('The first 1,200 MW unit at Rooppur received its operating licence in April 2026 and completed fuel loading in May 2026.[10][11] With both units running, it will be the largest power plant in the country.'),

    h1('What a sponsor should take from this'),
    bullet(bold('The direction is clear, the detail is not.'), ' Every plan points to more solar, more storage and less oil. The numbers keep moving.'),
    bullet(bold('Demand forecasts are contested.'), ' A project that depends on fast demand growth carries more risk than one that cuts costs.'),
    bullet(bold('Policy follows the fuel bill.'), ' Projects that reduce imported fuel are the ones policy is built to support.'),
    say('Plans change with governments. Fuel costs and physics do not.'),

    ...refs(SRC.dsIepmp, SRC.ieefaIepmp, SRC.dsEpsmp, SRC.cpdEpsmp, SRC.dtRePolicy, SRC.ieej, SRC.bssJun, SRC.bssSolar10,
      SRC.ds100day, SRC.wnnLicence, SRC.wnnFuel),
  ],
}

/* ── 9 · implementation ───────────────────────────────────── */

const implement: SampleArticle = {
  slug: 'how-to-build-a-power-project-in-bangladesh',
  title: 'From idea to COD: how a power project gets built in Bangladesh',
  subtitle: 'The stages, approvals and agencies between a site and a plant that sells power, how long they take, and where projects most often lose time.',
  topic: 'Project development',
  tags: ['Approvals', 'BERC', 'BIDA', 'Finance'],
  date: '2026-09-16',
  cover: `${P}solar-meadow.jpg`,
  coverCaption: 'Every stage before construction decides how fast construction goes | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('A private power plant needs, among other approvals, a BERC generation licence, environmental clearance and, for foreign money, BIDA registration.[2][3][4]'),
      bullet('Investors deal with many agencies, and approvals meant to take weeks often take six to twelve months.[7]'),
      bullet('Recent plants have taken about five years from agreement to commercial operation.[9]'),
    ]),

    h1('The stages'),
    para('Every developer’s guide, from the IFC’s guide to utility-scale solar onwards, describes the same sequence.[1] In Bangladesh each stage has its own offices and documents.'),
    para('Table 1 · From idea to commercial operation'),
    table([
      ['Stage', 'What it produces', 'Main counterparts'],
      ['Pre-feasibility', 'Screened sites, a route to market, first numbers', 'Grid company, land offices'],
      ['Site and land', 'Land control, survey, NOCs', 'Land offices, local administration'],
      ['Feasibility', 'The technical, financial and regulatory case', 'Consultants, lenders'],
      ['Approvals', 'Licences and clearances', 'Power Division, BPDB, BERC, DoE, BIDA'],
      ['Contracts', 'PPA or MPPA, grid agreements, EPC contract', 'BPDB or buyers, PGCB, EPC contractor'],
      ['Financing', 'Financial close', 'Banks, Bangladesh Bank, BIDA'],
      ['Construction', 'Commissioning and COD', 'EPC contractor, grid company'],
    ], { header: true, rowHeader: true }),

    h1('The approvals that matter'),
    h2('Generation licence'),
    para('Under the Bangladesh Energy Regulatory Commission Act 2003, generating electricity for sale needs a licence from BERC.[2]'),
    h2('Environmental clearance'),
    para('The Environment Conservation Rules 2023 classify projects by risk. Large power plants are in the Red category, which needs a site clearance, an environmental impact assessment and then an Environmental Clearance Certificate from the Department of Environment.[3]'),
    h2('Foreign investment and borrowing'),
    image(`${P}coal-stacks.jpg`, 'Small: Thermal or solar, every plant needs the same licence, clearance and financing approvals | Photo: Unsplash'),
    para('Foreign investors register with the Bangladesh Investment Development Authority (BIDA). Foreign loans have gone through a BIDA scrutiny committee chaired by the Bangladesh Bank governor.[4] Since September 2026, BIDA-registered companies no longer need a separate Bangladesh Bank approval for medium and long-term foreign borrowing.[5]'),
    h2('Tax incentives'),
    para('Renewable projects that reach commercial operation between July 2025 and June 2030 can claim a full income tax exemption for ten years, then 50 percent for three years and 25 percent for two, with a no-objection certificate from the Power Division.[6]'),

    h1('Where the time goes'),
    para('The official picture and the real one differ. According to a chamber of foreign investors, investors deal with 23 agencies; approvals officially meant to take 76 days often take six to twelve months, and a land title transfer can take 260 days.[7]'),
    para('Payment is the risk that remains after construction. Dues owed to private power producers passed Tk 27,000 crore in late 2025.[8]'),
    para('The timelines of recent plants show the pattern. Summit’s 583 MW Meghnaghat II plant signed its PPA in March 2019 and reached commercial operation in April 2024.[9]'),

    h1('How to shorten the path'),
    num(bold('Start with the site and the grid.'), ' Most delays trace back to land and the connection. Verify both before spending on anything else.'),
    num(bold('Build one complete file.'), ' A feasibility study, land records and grid studies that answer every office’s questions the first time.'),
    num(bold('Map every approval and its owner.'), ' Know which office signs what, in what order, and follow each file until it is signed.'),
    num(bold('Plan the money early.'), ' Local and offshore accounts, foreign loan approvals, tax exemptions and repatriation, set up before they are needed.'),
    num(bold('Audit before you submit.'), ' An independent check of the technical, legal and financial file catches the gaps a reviewer or lender would find.'),
    say('A project is built twice: first on paper, then on site. The paper takes longer.'),

    ...refs(SRC.ifcGuide, SRC.berc, SRC.legalseba, SRC.bidaLoan, SRC.dsBorrow, SRC.dfdl, SRC.dsFdi, SRC.tbsDues, SRC.etMeghnaghat),
  ],
}

/* ── 10 · the future mix ──────────────────────────────────── */

const future: SampleArticle = {
  slug: 'what-power-plants-bangladesh-needs-next',
  title: 'What kind of power plants Bangladesh needs next',
  subtitle: 'Demand forecasts are coming down, fuel imports are going up and solar keeps getting cheaper. The case for the next wave of capacity, technology by technology.',
  topic: 'Energy mix',
  tags: ['Solar PV', 'BESS', 'Wind', 'Nuclear', 'Gas'],
  date: '2026-08-26',
  cover: `${P}solar-rows.jpg`,
  coverCaption: 'Solar is the fastest new capacity Bangladesh can add | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('Forecasts for 2040 now range from about 30 GW to 50 GW of peak demand, which changes how much new capacity is needed.[1][2]'),
      bullet('Independent analysts agree on the direction: more solar and storage, less oil, and no new fossil capacity beyond what is already committed.[3][4]'),
      bullet('Wind, regional hydro and nuclear can each play a part, at very different costs and timescales.[6][7][8]'),
    ]),

    h1('How much capacity, really'),
    para('The 2023 master plan expected peak demand of about 50 GW by 2040.[1] The 2026 plan’s business-as-usual case is about 41 GW, and the Centre for Policy Dialogue argues that 2040 demand should be planned at 30 GW or less.[2] With a reserve margin above 60 percent in FY2024-25,[3] the next decade is less about adding megawatts than about replacing expensive ones.'),

    h1('Solar, with storage'),
    image(`${P}solar-hillside.jpg`, 'Small: Storage decides how much solar the evening peak can use | Photo: Unsplash'),
    para('Solar is the quickest capacity to build and needs no imported fuel. IEEFA’s roadmap calls for 5,500 MW of renewables and 500 MW of three-hour battery storage by 2030, alongside phasing out 1,000 MW of old gas plants.[4] The World Bank makes the same case for utility-scale and rooftop solar, backed by investment in the grid.[5]'),
    para('Storage is what turns midday solar into evening power, when demand peaks. Without it, more solar mainly displaces daytime gas.'),

    h1('Efficient gas, not more oil'),
    para('Gas will remain the backbone for years, but the fleet can use it better. IEEFA recommends cutting oil-fired generation from about 11 percent of the total to 5 percent, and adding no new fossil capacity.[3] Repowering old gas units to combined cycle gets more electricity from the same fuel.'),

    h1('Wind'),
    para('Bangladesh has real wind potential: a 2018 NREL study found more than 30 GW of gross potential. The first large wind farm, 60 MW at Cox’s Bazar, has so far run at a capacity factor of about 17 percent, below the 23 percent expected.[6] Wind needs better resource data and a clear procurement route before it can grow.'),

    h1('Regional hydro and nuclear'),
    para('Hydropower from Nepal already reaches Bangladesh through India: 40 MW during the wet season, with a further 20 MW agreed but awaiting approval.[7] Regional trade can add clean power without using land at home, if the transmission and agreements follow.'),
    para('The first 1,200 MW unit at the Rooppur nuclear plant completed fuel loading in May 2026.[8] Nuclear adds large, steady capacity, but it is expensive and takes many years to plan and build.'),

    h1('A sensible order'),
    para('Table 1 · What to build, in what order'),
    table([
      ['Priority', 'What', 'Why'],
      ['1', 'Solar with storage', 'No fuel imports, fastest to build'],
      ['2', 'Grid and interconnection', 'Lets existing and new plants deliver'],
      ['3', 'Efficient gas and repowering', 'More power from scarce gas'],
      ['4', 'Wind and regional hydro', 'Spreads supply beyond solar'],
      ['5', 'Retire oil and old steam units', 'Removes the most expensive units first'],
    ], { header: true, rowHeader: true }),
    say('The next plant Bangladesh builds should lower the average cost of a unit, not raise it.'),
    para('For sponsors, that is the test to apply before any feasibility study: will this plant make electricity cheaper, more secure or cleaner than what it replaces?'),

    ...refs(SRC.ieej, SRC.cpdEpsmp, SRC.ieefaNext, SRC.ieefaFix, SRC.wb2026, SRC.dsWind, SRC.aniNepal, SRC.wnnFuel),
  ],
}

/* ── 11 · merchant power ──────────────────────────────────── */

const merchant: SampleArticle = {
  slug: 'merchant-power-plants-bangladesh-how-the-policy-works',
  title: 'Selling solar straight to factories: how Bangladesh’s merchant power policy works',
  subtitle: 'Since October 2025, private renewable plants may sell power directly to large consumers over the national grid. Who can build one, who can buy, the approvals it needs, and what the 2026 tariff hearing means for the numbers.',
  topic: 'Regulatory',
  tags: ['MPP', 'Solar PV', 'Open access', 'Policy'],
  date: '2026-10-06',
  cover: `${P}solar-aerial.jpg`,
  coverCaption: 'A merchant plant sells to factories, not to the state, but its power still travels on the national grid | Photo: Unsplash',
  published: true,
  blocks: [
    callout('Key takeaways', [
      bullet('A merchant power plant (MPP) is a private renewable plant that sells its output directly to large and bulk consumers, under a contract and at a price the two sides negotiate.[1][2]'),
      bullet('The power travels over the national grid on open access. BERC sets what that costs, and those charges decide how much of the saving reaches the buyer.[1][3]'),
      bullet('There is no government guarantee. A distribution utility may buy up to 20 percent of the output, but does not have to.[1]'),
      bullet('Tariffs and open-access charges were argued at a BERC hearing in August 2026. Price them as a range until the final order is out.[4][5]'),
    ]),

    h1('What the policy is'),
    para('The Power Division’s ', ital('Policy for Enhancement of Private Participation in the Renewable Energy-based Power Generation, 2025'), ' was published in the Bangladesh Gazette on 6 October 2025 and took effect the same day. The press usually calls it the merchant power policy.[1][2]'),
    para('It ends BPDB’s role as the only buyer of new private power. A private company can build a renewable plant, find its own customers and sell to them directly, as long as those customers are large or bulk consumers.[2] Solar, wind, geothermal, biomass and municipal waste all qualify. Storage is optional, and its terms can be written into the plant’s service agreement with the grid.[1]'),

    h1('Who can build a merchant plant'),
    para('Private investors with the financial capacity and experience in building or running power plants, or in EPC work, may apply. Loan defaulters, companies that owe money to the government and anyone barred by a government body are excluded. Companies under the Power Division that already generate or distribute power may not develop MPPs, to avoid a conflict of interest.[1]'),
    para('The policy sets no minimum or maximum size. Capacity depends on a grid study of the connection point, and each plant must connect through its own Electrical Interconnection Facility (EIF).[1] In practice the grid study and the EIF route decide the project before the contract does.'),

    h1('Who can buy'),
    para('Buyers are large consumers in economic zones, EPZs, special economic zones, industrial parks and estates, hi-tech parks and large real estate projects, plus bulk power consumers as defined in BERC’s Grid Code Regulations 2023.[1] The policy groups them by the size of their load and the voltage that serves it:'),
    para('Table 1 · Large-consumer load bands in the policy'),
    table([
      ['Connection voltage', 'Consumer load'],
      ['230 kV', 'Above 140 MW'],
      ['132 kV', '30 to 140 MW'],
      ['33 kV', '5 to 30 MW'],
      ['11 kV', 'Below 5 MW'],
    ], { header: true, rowHeader: true }),
    para('Export manufacturers are the obvious customers. Their own buyers increasingly ask for green power, and a rooftop system rarely covers enough. One garment supplier puts it at 10 to 15 percent of a mid-sized factory’s demand from its roof, against 50 to 70 percent or more from an off-site plant.[6]'),

    h1('How the power and the money move'),
    image(`${P}mpp-structure.png`, 'Wide: How a merchant power project fits together: the plant sells to its buyers under an MPPA, and the national grid carries the power on open access'),
    para('Four agreements hold a merchant project together:'),
    num(bold('The MPPA.'), ' A bilateral merchant power purchase agreement between the plant and each buyer, at a negotiated price.[1][2] A plant may sell to several buyers.'),
    num(bold('Open access.'), ' Power Grid and every distribution licensee must give the plant non-discriminatory access to their networks, for an open-access tariff that BERC sets. BERC also sets the transmission and distribution losses the plant bears.[1]'),
    num(bold('The service level agreement (SLA).'), ' Signed between the plant, Power Grid and BPDB. NLDC, the national load dispatch centre, operates the system and can tell the plant to reduce, hold or raise output. Nobody is compensated for those instructions.[1]'),
    num(bold('An optional utility sale.'), ' A distribution utility may buy up to 20 percent of the plant’s declared monthly output at a tariff BERC sets, with payment secured by a bank guarantee or letter of credit. It is a right, not an obligation.[1][2]'),
    para('Two more pieces matter to buyers. SREDA issues renewable energy certificates to international standards, and the plant can pass them to its customers with the power. Disputes go first to the parties, then to BERC, then to arbitration under the MPPA.[1]'),
    para('Table 2 · Who does what'),
    table([
      ['Party', 'Role in a merchant project'],
      ['Power Division', 'Approves the MPP application'],
      ['BERC', 'Generation licence, open-access tariff, T&D losses, tariff for utility purchases, disputes'],
      ['DoE', 'Environmental impact assessment and clearance'],
      ['SREDA', 'Renewable energy certificates, transferable to buyers'],
      ['IDRA', 'Approves the project insurance'],
      ['Power Grid, BPDB, distribution utility', 'Carry the power on open access; sign the SLA'],
      ['NLDC', 'Operates the system and dispatches the plant'],
      ['Large and bulk consumers', 'Buy the power under MPPAs'],
      ['Lenders', 'Project finance from local and international banks'],
      ['EPC and O&M contractors', 'Build and run the plant'],
      ['Owner’s engineer and adviser', 'Development, commercial and technical advice, then site supervision'],
    ], { header: true, rowHeader: true }),

    h1('Approvals, in order'),
    num(bold('Power Division approval'), ' of the MPP application, which needs the grid study and a clear EIF route.[1]'),
    num(bold('Environmental clearance.'), ' The EIA goes to the Department of Environment.[1]'),
    num(bold('BERC generation licence.'), '[1]'),
    num(bold('The SLA'), ' with Power Grid and BPDB, and an MPPA with each buyer.[1]'),
    num(bold('Insurance approved by IDRA'), ' and finance from local or international lenders.[1]'),
    para('None of these is new to anyone who has developed an IPP. What is new is that the buyer’s signature, not BPDB’s, is what the lender will look at.'),

    h1('The 2026 tariff hearing'),
    para('BERC held a public hearing on merchant power charges on 23 August 2026. Its technical committee proposed Tk 6.48 per unit as the solar tariff, worked out for a 50 MW plant, as the price for the share of output a state utility may buy. It also suggested fitting battery storage of 10 to 20 percent of a plant’s capacity.[4][5]'),
    para('Before the hearing, the proposed open-access charges were published. On a Tk 9 to 10 per unit factory deal, the charges could add Tk 2 to 4 or more per unit, which is most of the saving against grid power.[3]'),
    para('Table 3 · Open-access charges proposed before the hearing (Tk per unit)'),
    table([
      ['Charge', 'Proposed'],
      ['Power Grid wheeling, 230 kV', '0.4657'],
      ['Power Grid wheeling, 132 kV', '0.4901'],
      ['Power Grid wheeling, 33 kV', '0.7891'],
      ['Wheeling charge in use today', '0.37 to 0.38'],
      ['Receiving charge, including the cross-subsidy surcharge', '1.14 to 2.90'],
      ['DPDC injection charge', '0.97 to 1.58'],
    ], { header: true, rowHeader: true }),
    para('The response was sharp. The Consumers Association of Bangladesh questioned why private producers should carry the utilities’ subsidies, and critics compared the Tk 6.48 tariff with about Tk 3.80 in India and Tk 3.90 in Pakistan. The renewable energy association asked for an open-access tariff of Tk 0.50 for the first five years, and merchant power buyers objected to the cross-subsidy surcharge.[4][5] BGMEA asked for ten years’ relief from the surcharge and the receiving charge, a VAT exemption at plant level and a green export electricity tariff.[7]'),
    para('As of early October 2026, BERC has not published a final order. Any financial model built today should test the full proposed charges and the lower figures the industry asked for.'),

    h1('Why it matters'),
    para('Bangladesh wants 20 percent of its power from renewables by 2030 and 30 percent by 2040.[2][8] In October 2025 grid-connected solar and wind came to about 829 MW, roughly 3 percent of capacity.[2] Tenders and PPP land alone will not close that gap at the speed the targets need. Merchant plants bring private buyers, and private balance sheets, into the market for the first time.'),
    say('A merchant plant is only as bankable as its buyers and its open-access bill. Settle both before anything else.'),

    h1('What to settle first'),
    bullet(bold('The grid study and the EIF route.'), ' They fix the capacity and much of the cost.'),
    bullet(bold('The buyers.'), ' Their credit, their daytime load, and whether they sit inside a zone the policy names.'),
    bullet(bold('The charges.'), ' Model wheeling, receiving and loss charges at the proposed levels until BERC’s order is final.'),
    bullet(bold('The MPPA terms.'), ' Term, price indexation, take-or-pay, and who carries the curtailment risk the SLA leaves uncompensated.'),
    bullet(bold('Storage.'), ' Optional in the policy, but BERC’s committee has signalled it wants it.'),
    para('That groundwork, from site and grid to the agreements and the approvals, is the work I do for sponsors.'),

    ...refs(SRC.mppPolicy, SRC.dsDirect, SRC.dsCharges, SRC.feMppTariff, SRC.dsHearing, SRC.bdnMerchant, SRC.bgmeaHearing, SRC.tbsTargets),
  ],
}

export const SAMPLE_ARTICLES: SampleArticle[] = [merchant, implement, proposals, system, solar, pppLand, future, vision, routes, grid, efficiency]

/* ── the writing guide (Notion only, never published) ──────── */

export const WRITING_GUIDE: SampleArticle = {
  slug: 'writing-guide',
  title: '✍️ Writing guide: duplicate this page to start an article',
  subtitle: 'How to write an article in Notion so it looks right on the website. This page is not published.',
  topic: 'Services',
  tags: [],
  date: '2026-09-26',
  cover: `${P}solar-field.jpg`,
  coverCaption: 'The cover photo | Photo: add a credit after a bar like this',
  published: false,
  blocks: [
    callout('How to publish an article', [
      num('Duplicate this page (••• then Duplicate), or click New in the Insights table.'),
      num('Write the headline as the page title, and one or two sentences in Subtitle.'),
      num('Add a cover photo: hover over the top of the page, then Add cover, then Upload.'),
      num('Pick a Topic. Add Tags if you like.'),
      num('When it is ready, tick Published. The website updates within about five minutes.'),
      num('Optional: Share, then Publish, then Publish to web. That shows a “Read on Notion” button on the article.'),
    ], '✍️'),
    para('To hide an article again, untick Published. To change it, just edit it here. The site follows.'),

    h1('Sections'),
    para('Every Heading 1 becomes a numbered section (01, 02, 03) and appears in “On this page” beside the article. Use Heading 2 for sub-headings.'),
    h2('This is a Heading 2'),
    para('Normal text is the body. ', bold('Bold'), ', ', ital('italic'), ' and ', link('links', 'https://afnewenergy.com'), ' all work.'),

    h1('Photos'),
    para('Type /image and upload a photo, then write a caption under it. The first word of the caption sets the size:'),
    bullet(bold('No prefix:'), ' the photo is the width of the text.'),
    bullet(bold('Wide:'), ' the photo runs past the text into the margin.'),
    bullet(bold('Small:'), ' a small photo, with the text wrapping round it.'),
    bullet('Add a credit after a bar, for example ', ital('Wide: The substation at night | Photo: AF New Energy'), '.'),
    image(`${P}pylons-sunset.jpg`, 'Wide: A wide photo. This caption starts with “Wide:” | Photo: credit goes here'),
    para('To put photos side by side, drag one image next to another until Notion shows a blue line down the side. The site shows them as a gallery.'),
    columns([image(`${P}solar-rows.jpg`, 'Two photos side by side become a gallery')], [image(`${P}solar-panels.jpg`)]),

    h1('Key takeaways'),
    para('A callout with a list inside becomes a boxed summary. The callout’s own text is the label.'),
    callout('Key takeaways', [bullet('First point.'), bullet('Second point.'), bullet('Third point.')]),

    h1('Quotes and tables'),
    para('A Quote block becomes a large pull quote. Put the name on the last line, starting with a hyphen (Shift+Enter for a new line). The site shows the name without the hyphen.'),
    say('A short line worth repeating.'),
    para('Tables show as real tables. Turn on “Header row” in the table menu. A line starting with “Table 1 ·” just above the table becomes its title.'),
    para('Table 1 · An example'),
    table([['Stage', 'What stalls it', 'What moves it'], ['Land', 'Fragmented ownership', 'Digital survey']], { header: true }),

    h1('Sources and references'),
    para('End the article with a Heading 1 called References, with one numbered line per source and the title as a link. Anywhere in the text, [1], [2] and so on then link to those lines automatically, like this.[1]'),
    para('Videos: set Type to Video and paste the YouTube link in Video URL. To put a video inside the text, type /video and paste the link.'),
    para('House style: avoid long dashes. Use a comma, a colon or a full stop instead.'),

    h1('References'),
    num(link('Example source title', 'https://www.example.com'), ', Publisher · Month Year'),
  ],
}
