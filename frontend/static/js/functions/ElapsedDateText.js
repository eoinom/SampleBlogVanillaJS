export default function ElapsedDateText(date) {
  if (!date instanceof Date)
    return '';

  const ms = (new Date()).getTime() - date.getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (seconds < 10) {
    return 'Just now';
  } if (seconds < 60) {
    return seconds + ' seconds ago';
  } if (minutes == 1) {
    return 'a minute ago';
  } if (minutes < 60) {
    return minutes + ' minutes ago';
  } if (hours == 1) {
    return 'an hour ago';
  } if (hours < 24) {
    return hours + ' hours ago';
  } if (days == 1) {
    return 'a day ago';
  } if (days < 30) {
    return days + ' days ago';
  } if (months == 1) {
    return 'a month ago';
  } if (months < 12) {
    return months + ' months ago';
  } if (years == 1) {
    return 'a year ago';
  } if (years > 1) {
    return years + ' years ago';
  } else {
    return ''
  }
}