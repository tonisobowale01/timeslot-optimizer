import type { EventItem, Weekday } from '../types';

export const DAYS: Weekday[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export interface Interval { start: number; end: number }
export interface Slot extends Interval { day: Weekday }

export function parseTime(value: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
export function toTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  return `${hours % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60), remainder = minutes % 60;
  return [hours ? `${hours}h` : '', remainder || !hours ? `${remainder}m` : ''].filter(Boolean).join(' ');
}
export function mergeIntervals(intervals: readonly Interval[]): Interval[] {
  const sorted = intervals.filter(i => Number.isFinite(i.start) && Number.isFinite(i.end) && i.end > i.start)
    .map(i => ({ ...i })).sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Interval[] = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end);
    else merged.push(interval);
  }
  return merged;
}
export function calculateFreeTime(busy: readonly Interval[], window: Interval): Interval[] {
  if (!Number.isFinite(window.start) || !Number.isFinite(window.end) || window.start < 0 || window.end > 1440 || window.end <= window.start) return [];
  const clipped = busy.map(i => ({ start: Math.max(window.start, i.start), end: Math.min(window.end, i.end) }));
  const free: Interval[] = [];
  let cursor = window.start;
  for (const interval of mergeIntervals(clipped)) {
    if (interval.start > cursor) free.push({ start: cursor, end: interval.start });
    cursor = interval.end;
  }
  if (cursor < window.end) free.push({ start: cursor, end: window.end });
  return free;
}
export function dayIntervals(events: readonly EventItem[], day: Weekday): Interval[] {
  return events.filter(e => e.days.includes(day)).map(e => ({ start: parseTime(e.start), end: parseTime(e.end) }));
}
// One earliest exact-duration suggestion per qualifying gap, ordered by weekday/time.
export function findAvailableSlots(events: readonly EventItem[], days: readonly Weekday[], duration: number, window: Interval): Slot[] {
  if (!Number.isInteger(duration) || duration <= 0) return [];
  return DAYS.filter(d => days.includes(d)).flatMap(day => calculateFreeTime(dayIntervals(events, day), window)
    .filter(i => i.end - i.start >= duration).map(i => ({ day, start: i.start, end: i.start + duration })));
}
export function validateEvent(event: EventItem): string | null {
  if (!event.label.trim()) return 'Give this commitment a name.';
  if (!event.days.length || event.days.some(day => !DAYS.includes(day))) return 'Choose at least one day.';
  const start = parseTime(event.start), end = parseTime(event.end);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Enter valid start and end times.';
  if (end <= start) return 'End time must be later than start time. Split overnight commitments into two events.';
  return null;
}
export function overlaps(a: EventItem, b: EventItem): boolean {
  return a.days.some(day => b.days.includes(day)) && parseTime(a.start) < parseTime(b.end) && parseTime(b.start) < parseTime(a.end);
}
// Partition connected overlap groups, then assign reusable lanes within each group.
export function positionEvents(events: readonly EventItem[]) {
  const sorted = [...events].sort((a, b) => parseTime(a.start) - parseTime(b.start) || a.id - b.id);
  const groups: EventItem[][] = [];
  let groupEnd = -1;
  for (const event of sorted) {
    if (parseTime(event.start) >= groupEnd) { groups.push([]); groupEnd = -1; }
    groups[groups.length - 1].push(event);
    groupEnd = Math.max(parseTime(event.end), groupEnd);
  }
  return groups.flatMap(group => {
    const laneEnds: number[] = [];
    const positioned = group.map(event => {
      let lane = laneEnds.findIndex(end => end <= parseTime(event.start));
      if (lane < 0) lane = laneEnds.length;
      laneEnds[lane] = parseTime(event.end);
      return { event, lane };
    });
    return positioned.map(item => ({ ...item, lanes: laneEnds.length }));
  });
}
