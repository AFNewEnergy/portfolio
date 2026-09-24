/**
 * The handful of token values that non-CSS code needs — currently only the
 * edge-rendered OG image, which cannot read CSS custom properties.
 *
 * Keep in sync with src/styles/tokens.css. That file remains the source of
 * truth for everything the browser renders.
 */
export const themeColors = {
  light: { canvas: '#FAF8F4', surface: '#F2EFE8', line: '#DFDACE', ink: '#14171A', ink2: '#4A4F55', ink3: '#767C84', accent: '#0B6C63' },
  dark:  { canvas: '#0C1013', surface: '#141A1F', line: '#232C34', ink: '#EDF0F2', ink2: '#A3ADB6', ink3: '#7B858E', accent: '#4CC9B8' },
} as const

/** OG images render on the dark plane — it photographs better in link previews. */
export const og = themeColors.dark
