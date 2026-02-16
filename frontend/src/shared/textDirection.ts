export type TextDirection = 'ltr' | 'rtl'

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/

export function detectTextDirection(text: string | null | undefined): TextDirection {
  if (!text) return 'ltr'
  return ARABIC_CHAR_REGEX.test(text) ? 'rtl' : 'ltr'
}

export function detectTextLang(text: string | null | undefined): string | undefined {
  if (!text) return undefined
  return ARABIC_CHAR_REGEX.test(text) ? 'ar' : undefined
}

export function wrapWithAutoDirSpan(text: string | null | undefined): string {
  const safeText = text ?? ''
  const dir = detectTextDirection(safeText)
  const lang = detectTextLang(safeText)

  if (dir !== 'rtl') return safeText

  return `<span dir="rtl"${lang ? ` lang=\"${lang}\"` : ''}>${safeText}</span>`
}
