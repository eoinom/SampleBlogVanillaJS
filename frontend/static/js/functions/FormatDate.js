export default function FormatDate(dateString, locale, options) {
  const date = new Date(dateString);
  const dateOptions = options || { weekday: undefined, year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale || undefined, dateOptions);
}