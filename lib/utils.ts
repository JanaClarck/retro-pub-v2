export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(timeStr: string) {
  return timeStr.replace(':00', '');
}

export function classNames(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
} 