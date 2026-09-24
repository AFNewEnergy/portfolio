/**
 * Emits a JSON-LD block. Content is serialised server-side and never contains
 * user input, so the injection surface is nil; `<` is still escaped as a
 * defence against a future refactor that passes CMS text through.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
