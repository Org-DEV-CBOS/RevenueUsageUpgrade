/** `yyyy-MM-dd` in local time, which is what `<input type="date">` expects. */
export function toDateInput(value: Date): string {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

export function today(): string {
  return toDateInput(new Date());
}

export function monthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return toDateInput(date);
}
