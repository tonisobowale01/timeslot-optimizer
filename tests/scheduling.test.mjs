import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({ entryPoints: ['src/utils/scheduling.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { mergeIntervals, calculateFreeTime, findAvailableSlots, validateEvent, positionEvents, overlaps, parseTime, formatTime, formatDuration } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const event = (id, start, end, days = ['Monday']) => ({ id, label: 'Class', color: '#4f46e5', start, end, days });

test('merges unsorted, nested, touching and chained intervals without mutating inputs', () => {
  const busy = [{ start: 100, end: 200 }, { start: 50, end: 150 }, { start: 60, end: 70 }, { start: 200, end: 240 }, { start: 300, end: 350 }];
  const snapshot = structuredClone(busy);
  assert.deepEqual(mergeIntervals(busy), [{ start: 50, end: 240 }, { start: 300, end: 350 }]);
  assert.deepEqual(busy, snapshot);
});
test('clips busy time to the search window and preserves boundary gaps', () => {
  assert.deepEqual(calculateFreeTime([{ start: 400, end: 540 }, { start: 600, end: 660 }, { start: 650, end: 720 }, { start: 1200, end: 1400 }], { start: 480, end: 1200 }), [{ start: 540, end: 600 }, { start: 720, end: 1200 }]);
  assert.deepEqual(calculateFreeTime([], { start: 0, end: 1440 }), [{ start: 0, end: 1440 }]);
  assert.deepEqual(calculateFreeTime([{ start: 0, end: 1440 }], { start: 480, end: 1200 }), []);
  assert.deepEqual(calculateFreeTime([], { start: 600, end: 500 }), []);
});
test('free and busy time partition the window for many deterministic overlap patterns', () => {
  let seed = 17;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let trial = 0; trial < 100; trial++) {
    const busy = Array.from({ length: 15 }, () => { const start = Math.floor(random() * 1440); return { start, end: Math.min(1440, start + Math.floor(random() * 240) + 1) }; });
    const window = { start: 480, end: 1200 };
    const free = calculateFreeTime(busy, window);
    for (let minute = window.start; minute < window.end; minute++) {
      const occupied = busy.some(i => i.start <= minute && minute < i.end);
      assert.equal(free.some(i => i.start <= minute && minute < i.end), !occupied);
    }
    assert.ok(free.every(i => i.start >= window.start && i.end <= window.end && i.start < i.end));
  }
});
test('slot finder respects selected days, requested duration, overlaps and exact fits', () => {
  const events = [event(1, '09:00', '11:00', ['Monday', 'Tuesday']), event(2, '10:00', '12:00')];
  assert.deepEqual(findAvailableSlots(events, ['Monday'], 60, { start: 480, end: 780 }), [{ day: 'Monday', start: 480, end: 540 }, { day: 'Monday', start: 720, end: 780 }]);
  assert.deepEqual(findAvailableSlots(events, ['Tuesday'], 120, { start: 480, end: 780 }), [{ day: 'Tuesday', start: 660, end: 780 }]);
  assert.deepEqual(findAvailableSlots(events, [], 60, { start: 480, end: 780 }), []);
  assert.deepEqual(findAvailableSlots(events, ['Monday'], 0, { start: 480, end: 780 }), []);
  assert.deepEqual(findAvailableSlots(events, ['Monday'], 121, { start: 480, end: 780 }), []);
});
test('rejects blank names, missing days, invalid times and overnight/reversed intervals', () => {
  assert.ok(validateEvent({ ...event(1, '09:00', '10:00'), label: '  ' }));
  assert.ok(validateEvent(event(1, '09:00', '10:00', [])));
  for (const [start, end] of [['09:00', '09:00'], ['22:00', '02:00'], ['24:00', '23:59'], ['', '10:00']]) assert.ok(validateEvent(event(1, start, end)));
  assert.equal(validateEvent(event(1, '00:00', '23:59')), null);
});
test('overlapping event groups use separate lanes; disjoint groups reclaim full width', () => {
  const positioned = positionEvents([event(1, '09:00', '11:00'), event(2, '10:00', '12:00'), event(3, '11:00', '13:00'), event(4, '14:00', '15:00')]);
  assert.deepEqual(positioned.map(i => [i.lane, i.lanes]), [[0, 2], [1, 2], [0, 2], [0, 1]]);
  assert.deepEqual(positionEvents([event(1, '09:00', '10:00'), event(2, '10:00', '11:00')]).map(i => i.lanes), [1, 1]);
});
test('formatting handles noon, midnight and sub-hour durations', () => {
  assert.equal(parseTime('09:15'), 555); assert.ok(Number.isNaN(parseTime('9:15')));
  assert.equal(formatTime(0), '12:00 AM'); assert.equal(formatTime(720), '12:00 PM'); assert.equal(formatTime(1440), '12:00 AM');
  assert.equal(formatDuration(150), '2h 30m'); assert.equal(formatDuration(60), '1h'); assert.equal(formatDuration(15), '15m');
});

test('conflicts require shared days and intersecting times; touching events are allowed', () => {
  assert.equal(overlaps(event(1, '09:00', '10:00'), event(2, '09:30', '10:30')), true);
  assert.equal(overlaps(event(1, '09:00', '10:00'), event(2, '10:00', '11:00')), false);
  assert.equal(overlaps(event(1, '09:00', '10:00'), event(2, '09:30', '10:30', ['Tuesday'])), false);
});
