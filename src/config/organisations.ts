/**
 * Organisations shown in the home-page logo ribbons, from Faisal's CV.
 *
 * Each logo lives in `public/logos/` as two cut-out WebP files:
 *   <id>-c.webp   full colour — shown in the light theme
 *   <id>-m.webp   white monochrome — shown in the dark theme, where many of
 *                 the navy and black marks would otherwise disappear
 *
 * `ratio` is the logo's width ÷ height; the ribbon uses it to give wide
 * wordmarks and square badges a similar visual weight.
 *
 * A logo wall implies a relationship the organisation can see. Confirm with
 * Faisal that every entry may be shown publicly, and delete any under NDA.
 * To add one: drop both WebP files into `public/logos/` and add a row here.
 */
export type OrgGroup = 'gov' | 'pvt' | 'audit'

export type Organisation = {
  id: string
  name: string
  group: OrgGroup
  ratio: number
}

/** Ribbon order, top to bottom. */
export const ORG_GROUPS: readonly OrgGroup[] = ['gov', 'pvt', 'audit']

export const ORGANISATIONS: readonly Organisation[] = [
  // Government & state-owned — Bangladesh, plus state-owned counterparts abroad
  { id: 'power-division', name: 'Power Division, MoPEMR', group: 'gov', ratio: 1.888 },
  { id: 'powerchina', name: 'POWERCHINA', group: 'gov', ratio: 3.636 },
  { id: 'bpdb', name: 'Bangladesh Power Development Board', group: 'gov', ratio: 0.965 },
  { id: 'petrobangla', name: 'Petrobangla', group: 'gov', ratio: 3.133 },
  { id: 'pgcb', name: 'Power Grid Company of Bangladesh', group: 'gov', ratio: 1.0 },
  { id: 'state-grid', name: 'State Grid Corporation of China', group: 'gov', ratio: 2.861 },
  { id: 'egcb', name: 'Electricity Generation Company of Bangladesh', group: 'gov', ratio: 1.235 },
  { id: 'sonatrach', name: 'Sonatrach', group: 'gov', ratio: 0.671 },
  { id: 'nwpgcl', name: 'North-West Power Generation Company', group: 'gov', ratio: 0.959 },
  { id: 'giz', name: 'GIZ', group: 'gov', ratio: 3.824 },
  { id: 'rpcl', name: 'Rural Power Company Limited', group: 'gov', ratio: 1.541 },
  { id: 'rpgcl', name: 'Rupantarita Prakritik Gas Company', group: 'gov', ratio: 2.288 },
  { id: 'titas', name: 'Titas Gas T&D Company', group: 'gov', ratio: 0.994 },
  { id: 'gtcl', name: 'Gas Transmission Company Limited', group: 'gov', ratio: 0.976 },

  // Private & international (wide wordmarks alternate with square marks)
  { id: 'sumitomo', name: 'Sumitomo Corporation', group: 'pvt', ratio: 10.059 },
  { id: 'ge', name: 'General Electric', group: 'pvt', ratio: 1.0 },
  { id: 'nepcs', name: 'China Northeast Electric Power Engineering & Services (NEPCS)', group: 'pvt', ratio: 1.74 },
  { id: 'reliance', name: 'Reliance Power', group: 'pvt', ratio: 6.02 },
  { id: 'mz', name: 'MZ Consulting Services', group: 'pvt', ratio: 0.991 },
  { id: 'intraco', name: 'Intraco Group', group: 'pvt', ratio: 1.382 },
  { id: 'east-coast', name: 'East Coast Group', group: 'pvt', ratio: 5.528 },
  { id: 'posco', name: 'POSCO E&C', group: 'pvt', ratio: 2.571 },
  { id: 'oms', name: 'O&M Solutions', group: 'pvt', ratio: 1.594 },
  { id: 'jinko', name: 'JinkoSolar', group: 'pvt', ratio: 2.94 },
  { id: 'metito', name: 'Metito Utilities', group: 'pvt', ratio: 2.312 },
  { id: 'symbior', name: 'Symbior Solar', group: 'pvt', ratio: 3.333 },
  { id: 'kerui', name: 'Shandong Kerui', group: 'pvt', ratio: 3.091 },
  { id: 'aljomaih', name: 'Aljomaih Energy & Water', group: 'pvt', ratio: 5.279 },
  { id: 'otobi', name: 'OTOBI', group: 'pvt', ratio: 2.223 },
  { id: 'eclectic', name: 'Eclectic Limited', group: 'pvt', ratio: 4.737 },

  // Factory audits — electrical safety and energy audits in RMG factories (GIZ programme)
  { id: 'epyllion', name: 'Epyllion Group', group: 'audit', ratio: 1.994 },
  { id: 'niagara', name: 'Niagara Textiles', group: 'audit', ratio: 0.994 },
  { id: 'square', name: 'Square Textiles', group: 'audit', ratio: 4.37 },
  { id: 'metro', name: 'Metro Knitting & Dyeing Mills', group: 'audit', ratio: 2.992 },
  { id: 'fakir', name: 'Fakir Fashion', group: 'audit', ratio: 1.471 },
  { id: 'mega-yarn', name: 'Mega Yarn Dyeing Mills', group: 'audit', ratio: 1.0 },
  { id: 'purbani', name: 'Purbani Group', group: 'audit', ratio: 4.124 },
  { id: 'libas', name: 'Libas Textiles', group: 'audit', ratio: 1.588 },
  { id: 'karim', name: 'Karim Group', group: 'audit', ratio: 1.088 },
  { id: 'divine', name: 'Divine Group', group: 'audit', ratio: 1.518 },
]
