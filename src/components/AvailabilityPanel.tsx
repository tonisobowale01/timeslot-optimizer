import type { EventItem, Weekday } from '../types';
import { DAYS, calculateFreeTime, dayIntervals, formatDuration, formatTime, type Interval, type Slot } from '../utils/scheduling';

export default function AvailabilityPanel({ events, window, selected, onChoose, onFind }: { events: EventItem[]; window: Interval; selected: Weekday; onChoose: (slot: Slot) => void; onFind: () => void }) {
  const slots = DAYS.flatMap(day => calculateFreeTime(dayIntervals(events, day), window).map(slot => ({ ...slot, day })));
  const best = [...slots].sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
  const total = slots.reduce((sum, slot) => sum + slot.end - slot.start, 0);
  return <aside className="availability" aria-label="Calculated availability"><div className="panel-heading"><h2>Your availability</h2><p><strong>{formatDuration(total)}</strong> free across your week</p></div>
    {best ? <button className="best-opening" onClick={() => onChoose(best)}><span className="eyebrow">✧ BEST OPENING</span><strong>{best.day}</strong><span>{formatTime(best.start)} – {formatTime(best.end)}</span><b>{formatDuration(best.end - best.start)} free <span aria-hidden="true">↗</span></b></button> : <div className="notice">Your week is fully booked in this time range. Try widening your availability hours.</div>}
    <button className="secondary full" onClick={onFind}>Find me time <span aria-hidden="true">↗</span></button>
    <p className="availability-note">{formatTime(window.start)} – {formatTime(window.end)}</p>
    <details className="openings-details"><summary>View free intervals</summary><div className="availability-list">{DAYS.map(day => <section key={day} className={`availability-day ${day === selected ? 'selected-day' : ''}`}><h3>{day}<small>{slots.filter(slot => slot.day === day).length} openings</small></h3>{slots.filter(slot => slot.day === day).map(slot => <button key={slot.start} onClick={() => onChoose(slot)}><span>{formatTime(slot.start)} – {formatTime(slot.end)}</span><strong>{formatDuration(slot.end - slot.start)}</strong></button>)}{!slots.some(slot => slot.day === day) && <p className="muted">No free intervals</p>}</section>)}</div>
    </details>
  </aside>;
}
