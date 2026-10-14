import type { CSSProperties } from 'react';
import type { EventItem, Weekday } from '../types';
import { DAYS, calculateFreeTime, dayIntervals, formatDuration, formatTime, parseTime, positionEvents, overlaps, type Interval } from '../utils/scheduling';

interface Props { events: EventItem[]; window: Interval; selected: Weekday; onSelect: (day: Weekday) => void; onAdd: (day: Weekday, start?: number, end?: number) => void; onEdit: (e: EventItem) => void }
export default function ScheduleCalendar({ events, window, selected, onSelect, onAdd, onEdit }: Props) {
  const from = Math.floor(Math.min(window.start, ...events.map(e => parseTime(e.start))) / 60) * 60;
  const to = Math.ceil(Math.max(window.end, ...events.map(e => parseTime(e.end))) / 60) * 60;
  const hours = Array.from({ length: (to - from) / 60 }, (_, i) => from + i * 60);
  const today = DAYS[(new Date().getDay() + 6) % 7];
  const dayEvents = events.filter(e => e.days.includes(selected));
  const hasConflict = (event: EventItem, day: Weekday) => events.some(other => other.id !== event.id && other.days.includes(day) && overlaps(event, other));
  const agenda = [
    ...dayEvents.map(event => ({ start: parseTime(event.start), end: parseTime(event.end), event })),
    ...calculateFreeTime(dayIntervals(events, selected), window).map(slot => ({ ...slot, event: null })),
  ].sort((a, b) => a.start - b.start);
  return <>
    <div className="mobile-days" role="group" aria-label="Choose day">{DAYS.map(day => <button key={day} aria-pressed={selected === day} onClick={() => onSelect(day)}>{day.slice(0, 3)}</button>)}</div>
    <div className="desktop-calendar" aria-label="Weekly schedule">
      <div className="calendar-head"><span className="timezone">LOCAL<br />TIME</span>{DAYS.map(day => <div key={day} className={today === day ? 'today' : ''}><span>{day.slice(0, 3)}</span><small>{day === today ? 'Today' : `${events.filter(e => e.days.includes(day)).length} planned`}</small></div>)}</div>
      <div className="calendar-scroll"><div className="calendar-grid" style={{ height: hours.length * 64 }}>
        <div className="time-axis">{hours.map(hour => <span key={hour} style={{ top: (hour - from) / 60 * 64 }}>{formatTime(hour)}</span>)}</div>
        {DAYS.map(day => <div className={`calendar-day ${day === today ? 'current-day' : ''}`} key={day}>
          {hours.map(hour => <button key={hour} className="hour-cell" style={{ top: (hour - from) / 60 * 64 }} aria-label={`Add commitment on ${day} at ${formatTime(hour)}`} onClick={() => onAdd(day, hour, Math.min(hour + 60, 1439))} />)}
          {calculateFreeTime(dayIntervals(events, day), window).map(slot => <button className="free-block" key={slot.start} style={{ top: (slot.start - from) / 60 * 64, height: (slot.end - slot.start) / 60 * 64 }} aria-label={`Add commitment in free time on ${day}, ${formatTime(slot.start)} to ${formatTime(slot.end)}`} onClick={e => {
            const offset = e.detail ? (e.clientY - e.currentTarget.getBoundingClientRect().top) / 64 * 60 : 0;
            const start = Math.min(slot.end - 1, Math.max(slot.start, Math.floor((slot.start + offset) / 15) * 15));
            onAdd(day, start, Math.min(start + 60, slot.end));
          }}>{slot.end - slot.start >= 45 && <span>✓ Free <b>· {formatDuration(slot.end - slot.start)}</b></span>}</button>)}
          {positionEvents(events.filter(e => e.days.includes(day))).map(({ event, lane, lanes }) => {
            const minutes = parseTime(event.end) - parseTime(event.start);
            const compact = minutes < 60;
            const conflict = hasConflict(event, day);
            const details = event.label + ' · ' + formatTime(parseTime(event.start)) + ' – ' + formatTime(parseTime(event.end)) + (conflict ? ' · Overlaps another commitment' : '');
            return <button key={event.id}
              className={`event-block ${compact ? 'event-compact' : ''}`}
              style={{ '--event-color': event.color, top: (parseTime(event.start) - from) / 60 * 64,
                height: Math.max(18, minutes / 60 * 64), left: `calc(${lane / lanes * 100}% + 3px)`,
                width: `calc(${100 / lanes}% - 6px)` } as CSSProperties}
              title={details} aria-label={'Edit ' + details + ', ' + day} onClick={() => onEdit(event)}>
              <strong>{conflict && <span className="overlap-mark" aria-hidden="true">!</span>}{event.label}</strong>
              {!compact && <small>{formatTime(parseTime(event.start))}<br />{formatTime(parseTime(event.end))}</small>}
            </button>;
          })}
        </div>)}
      </div></div>
    </div>
    <section className="mobile-agenda" aria-label={`${selected} schedule`}><div className="agenda-title"><h3>{selected}</h3><button className="secondary" onClick={() => onAdd(selected)}>＋ Add</button></div>{agenda.map((item, index) => <button key={index} className={`agenda-item ${item.event ? '' : 'agenda-free'}`} style={item.event ? { '--event-color': item.event.color } as CSSProperties : undefined} onClick={() => item.event ? onEdit(item.event) : onAdd(selected, item.start, Math.min(item.start + 60, item.end))}><span>{formatTime(item.start)}<small>{formatTime(item.end)}</small></span><span><strong>{item.event ? item.event.label : '✓ Free time'}</strong>{item.event && hasConflict(item.event, selected) && <span className="overlap-note">! Overlaps another commitment</span>}<small>{formatDuration(item.end - item.start)}{item.event ? ' · Tap to edit' : ' · Make it yours'}</small></span></button>)}</section>
  </>;
}
