import { useState } from 'react';
import { Modal } from '@mantine/core';
import type { EventItem, Weekday } from '../types';
import { DAYS, overlaps, validateEvent } from '../utils/scheduling';

const COLORS = [
  { name: 'Indigo', value: '#4f46e5' }, { name: 'Teal', value: '#087f75' },
  { name: 'Rose', value: '#be185d' }, { name: 'Amber', value: '#92400e' }, { name: 'Blue', value: '#1d4ed8' },
];
export default function EventModal({ initial, events, onClose, onSave, onDelete }: {
  initial: EventItem; events: EventItem[]; onClose: () => void; onSave: (e: EventItem) => void; onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const editing = events.some(e => e.id === initial.id);
  const conflict = events.some(e => e.id !== draft.id && overlaps(e, draft));
  const toggleDay = (day: Weekday) => setDraft({ ...draft, days: draft.days.includes(day) ? draft.days.filter(d => d !== day) : [...draft.days, day] });
  return <Modal opened onClose={onClose} title={editing ? 'Edit commitment' : 'Add commitment'} centered size="md" radius="lg" returnFocus closeButtonProps={{ 'aria-label': 'Close commitment editor' }}>
    <form noValidate onSubmit={e => { e.preventDefault(); const message = validateEvent(draft); setError(message); if (!message) onSave({ ...draft, label: draft.label.trim() }); }}>
      <p className="muted">A little structure. A lot more breathing room.</p>
      <label className="field">Name<input data-autofocus maxLength={80} value={draft.label} placeholder="e.g. Class" onChange={e => setDraft({ ...draft, label: e.target.value })} aria-describedby={error ? 'event-error' : undefined} /></label>
      <fieldset><legend>Repeats on</legend><div className="day-checks">{DAYS.map(day => <label key={day}><input type="checkbox" aria-label={day} checked={draft.days.includes(day)} onChange={() => toggleDay(day)} /><span aria-hidden="true">{day.slice(0, 3)}</span></label>)}</div></fieldset>
      <div className="form-row"><label className="field">Start<input type="time" value={draft.start} onChange={e => setDraft({ ...draft, start: e.target.value })} /></label><label className="field">End<input type="time" value={draft.end} onChange={e => setDraft({ ...draft, end: e.target.value })} /></label></div>
      <fieldset><legend>Event color</legend><div className="swatches">{COLORS.map(color => <label key={color.value} style={{ color: color.value }}><input type="radio" name="color" value={color.value} checked={draft.color === color.value} onChange={() => setDraft({ ...draft, color: color.value })} /><span>{color.name}</span></label>)}</div></fieldset>
      {conflict && <p className="notice">This overlaps another commitment. Both stay visible; availability counts the shared time once.</p>}
      {error && <p className="error" id="event-error" role="alert">{error}</p>}
      <div className="modal-actions">{editing && <button type="button" className="danger" onClick={() => onDelete(draft.id)}>Delete</button>}<button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary" type="submit">{editing ? 'Save changes' : 'Add to schedule'}</button></div>
    </form>
  </Modal>;
}
