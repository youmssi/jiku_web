/**
 * Capitalises the first letter only, the way a sentence starts. CSS
 * `capitalize` upper-cases every word, which French reads as an error on a
 * date ("Jeudi 15 Octobre" instead of "Jeudi 15 octobre").
 */
export function upperFirst(text: string, locale: string): string {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
