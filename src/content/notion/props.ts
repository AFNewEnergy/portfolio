/**
 * Notion property readers.
 *
 * Every reader returns a safe default rather than throwing, so renaming a
 * property in Notion degrades one field instead of taking the site down.
 */
type Props = Record<string, any>

export const pTitle = (p: Props, k: string): string =>
  p[k]?.title?.map((t: any) => t.plain_text).join('') ?? ''

export const pText = (p: Props, k: string): string =>
  p[k]?.rich_text?.map((t: any) => t.plain_text).join('') ?? ''

export const pSelect = (p: Props, k: string): string => p[k]?.select?.name ?? ''
export const pMulti = (p: Props, k: string): string[] => p[k]?.multi_select?.map((s: any) => s.name) ?? []
export const pNumber = (p: Props, k: string): number | null => p[k]?.number ?? null
export const pCheck = (p: Props, k: string): boolean => p[k]?.checkbox ?? false
export const pUrl = (p: Props, k: string): string | null => p[k]?.url || null
export const pDate = (p: Props, k: string): string | null => p[k]?.date?.start ?? null
