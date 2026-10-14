import { useState } from 'react';
import { Modal } from '@mantine/core';
import type { EventItem, Weekday } from '../types';
import { DAYS, findAvailableSlots, formatTime, parseTime, type Slot } from '../utils/scheduling';

export default function FindTimeModal({ events, onClose, onChoose }: { events: EventItem[]; onClose: () => void; onChoose: (slot: Slot) => void }) {
  const [duration, setDuration] = useState('60');
  const [start, setStart] = useState('08:00'), [end, setEnd] = useState('20:00');
  const [days, setDays] = useState<Weekday[]>(DAYS.slice(0, 5));
  const [results, setResults] = useState<Slot[] | null>(null), [error, setError] = useState('');
  const reset = () => { setResults(null); setError(''); };
  return <Modal opened centered onClose={onClose} title="Find a time slot" radius="lg" size="md" closeButtonProps={{ 'aria-label': 'Close time finder' }}>
    <p className="muted">Make room for what matters. We’ll check your commitments.</p>
    <form noValidate onSubmit={e => {
      e.preventDefault();
      const minutes = Number(duration), from = parseTime(start), to = parseTime(end);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) { setError('Choose a duration from 1 to 1,440 minutes.'); return; }
      if (!days.length) { setError('Choose at least one day.'); return; }
      if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) { setError('End time must be later than start time.'); return; }
      setError(''); setResults(findAvailableSlots(events, days, minutes, { start: from, end: to }));
    }}>
      <label className="field">I need (minutes)<input data-autofocus type="number" min="1" max="1440" value={duration} onChange={e => { setDuration(e.target.value); reset(); }} /></label>
      <div className="form-row"><label className="field">Between<input type="time" value={start} onChange={e => { setStart(e.target.value); reset(); }} /></label><label className="field">And<input type="time" value={end} onChange={e => { setEnd(e.target.value); reset(); }} /></label></div>
      <fieldset><legend>Days to check</legend><div className="day-checks">{DAYS.map(day => <label key={day}><input type="checkbox" aria-label={day} checked={days.includes(day)} onChange={() => { setDays(days.includes(day) ? days.filter(d => d !== day) : [...days, day]); reset(); }} /><span aria-hidden="true">{day.slice(0, 3)}</span></label>)}</div></fieldset>
      {error && <p role="alert" className="error">{error}</p>}
      <button className="primary full" type="submit">Find openings</button>
    </form>
    {results && <section className="matches" aria-live="polite"><h3>{results.length ? `${results.length} matching opening${results.length === 1 ? '' : 's'}` : 'No openings this time'}</h3><p className="muted">{results.length ? 'The earliest start in each free interval. Select one to add a commitment.' : 'Try a shorter duration, a wider time range, or more days.'}</p>{results.map(slot => <button key={`${slot.day}-${slot.start}`} className="match" onClick={() => onChoose(slot)}><span><strong>{slot.day}</strong><small>{formatTime(slot.start)} – {formatTime(slot.end)}</small></span><span aria-hidden="true">＋</span></button>)}</section>}
  </Modal>;
}
