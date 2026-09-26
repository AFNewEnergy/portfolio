/**
 * The Insights database, as the site expects it.
 *
 * One definition feeds three things, so they can never disagree:
 *   · the setup route, which creates the database in Notion
 *   · the mapper, which reads each row (property names below)
 *   · the writing guide in NOTION-SETUP.md
 *
 * Only Title and Published are required. Everything else is optional and has
 * a sensible fallback, so a half-filled row still renders.
 */
export const INSIGHTS_DB_TITLE = 'Insights'

export const P = {
  title: 'Title',
  subtitle: 'Subtitle',
  published: 'Published',
  date: 'Date',
  topic: 'Topic',
  tags: 'Tags',
  type: 'Type',
  videoUrl: 'Video URL',
  videoMinutes: 'Video minutes',
  coverCaption: 'Cover caption',
  slug: 'Slug',
  language: 'Language',
} as const

export const TOPICS = [
  'Project development', 'Power sector', 'Policy', 'Energy mix', 'Efficiency',
  'PPP', 'IPP', 'Regulatory', 'Solar PV', 'BESS', 'Land', 'Finance', 'Audit', 'Transmission', 'Services',
] as const

const LANGUAGES = ['en', 'fr', 'de', 'tr', 'zh', 'ar'] as const

/** Property configuration for `databases.create` → `initial_data_source.properties`. */
export function insightsProperties() {
  return {
    [P.title]: { title: {}, description: 'The headline.' },
    [P.subtitle]: {
      rich_text: {},
      description: 'One or two sentences under the headline. Also used on the cards and in Google results.',
    },
    [P.published]: {
      checkbox: {},
      description: 'Tick to show the article on the website. Untick to hide it again.',
    },
    [P.date]: { date: {}, description: 'Publish date. Sorts the list, newest first. Blank = the day the page was created.' },
    [P.topic]: {
      select: { options: TOPICS.map((name, i) => ({ name, color: i === 0 ? 'green' as const : 'default' as const })) },
      description: 'The small coloured label above the headline. Pick one, or type a new one.',
    },
    [P.tags]: { multi_select: { options: [] }, description: 'Keywords shown at the end of the article.' },
    [P.type]: {
      select: { options: [{ name: 'Article', color: 'blue' as const }, { name: 'Video', color: 'purple' as const }] },
      description: 'Article, or Video when the main thing is a video. Blank = Article.',
    },
    [P.videoUrl]: { url: {}, description: 'YouTube or Vimeo link. Only for Type = Video.' },
    [P.videoMinutes]: { number: { format: 'number' as const }, description: 'Video length in minutes. Only for Type = Video.' },
    [P.coverCaption]: {
      rich_text: {},
      description: 'Caption under the cover photo. Add a credit after a |, for example "Site visit, Rangunia | Photo: AF New Energy".',
    },
    [P.slug]: {
      rich_text: {},
      description: 'Optional web address ending, e.g. solar-ppp-guide. Blank = made from the headline automatically.',
    },
    [P.language]: {
      select: { options: LANGUAGES.map(name => ({ name })) },
      description: 'Blank = English. Only set this for a translated copy of an article.',
    },
  }
}
