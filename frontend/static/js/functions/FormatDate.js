export default function FormatDate(dateString) {
  const date = new Date(dateString);
  const dateOptions = { weekday: undefined, year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, dateOptions);
}