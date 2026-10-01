export function personName(person, locale) {
  if (!person) return ''
  const ar = String(person.name_ar || '').trim()
  const en = String(person.name_en || '').trim()
  const fallback = String(person.name || '').trim()
  if (locale === 'ar') {
    return ar || en || fallback
  }
  return en || ar || fallback
}
