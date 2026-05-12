/** Calendar day descending (newer days first), then time ascending within a day. */
export function sortMeetingsCalendarDayDescTimeAsc<
  T extends { scheduledAt: Date },
>(meetings: T[]): T[] {
  const dayKey = (d: Date) => {
    const x = new Date(d);
    return (
      x.getFullYear() * 10_000 +
      (x.getMonth() + 1) * 100 +
      x.getDate()
    );
  };
  return [...meetings].sort((a, b) => {
    const ka = dayKey(a.scheduledAt);
    const kb = dayKey(b.scheduledAt);
    if (kb !== ka) return kb - ka;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });
}
