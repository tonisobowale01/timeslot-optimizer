import { useEffect, useRef, useState } from 'react';
import { Modal } from '@mantine/core';
import { IconClock, IconLock, IconPlus, IconArrowUpRight, IconCalendarWeek } from '@tabler/icons-react';
import type { EventItem, Weekday } from './types';
import EventModal from './components/EventModal';
import FindTimeModal from './components/FindTimeModal';
import ScheduleCalendar from './components/ScheduleCalendar';
import AvailabilityPanel from './components/AvailabilityPanel';
import { DAYS, parseTime, toTime, type Slot } from './utils/scheduling';
import './App.css';

const defaultHours = { start: '08:00', end: '20:00' };
function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [history, setHistory] = useState<EventItem[][]>([]);
  const [draft, setDraft] = useState<EventItem | null>(null);
  const [findOpen, setFindOpen] = useState(false), [clearOpen, setClearOpen] = useState(false);
  const [selected, setSelected] = useState<Weekday>(DAYS[(new Date().getDay() + 6) % 7]);
  const [hours, setHours] = useState(defaultHours), [hoursDraft, setHoursDraft] = useState(defaultHours);
  const [hoursOpen, setHoursOpen] = useState(false), [hoursError, setHoursError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const modalTrigger = useRef<HTMLElement | null>(null);
  function rememberTrigger() {
    if (document.activeElement instanceof HTMLElement && !document.activeElement.closest('[role="dialog"]')) modalTrigger.current = document.activeElement;
  }
  function restoreFocus() {
    requestAnimationFrame(() => {
      const trigger = modalTrigger.current;
      if (trigger?.isConnected && !trigger.hasAttribute('disabled')) trigger.focus();
      else document.getElementById('schedule')?.focus();
    });
  }
  function closeEvent() { setDraft(null); restoreFocus(); }
  function openFind() { rememberTrigger(); setFindOpen(true); }
  function closeFind() { setFindOpen(false); restoreFocus(); }
  function edit(event: EventItem) { rememberTrigger(); setDraft(event); }
  // Migrate the previous version away from persistent schedule storage. No new data is stored.
  useEffect(() => {
    try { localStorage.removeItem('events'); localStorage.removeItem('lastEvents'); sessionStorage.removeItem('hasLoaded'); } catch { /* Storage can be disabled; the app still works in memory. */ }
  }, []);
  const window = { start: parseTime(hours.start), end: parseTime(hours.end) };
  function commit(next: EventItem[], message: string) {
    setHistory(previous => [...previous.slice(-19), events]); setEvents(next); setAnnouncement(message);
  }
  function add(day: Weekday = selected, start = Math.min(window.start + 60, window.end - 1, 1438), end = Math.min(start + 60, 1439), label = '') {
    rememberTrigger();
    setDraft({ id: Date.now(), label, color: '#4f46e5', days: [day], start: toTime(start), end: toTime(end) });
  }
  function choose(slot: Slot) { setFindOpen(false); add(slot.day, slot.start, slot.end); }
  return <div className="app-shell">
    <a className="skip-link" href="#schedule">Skip to schedule</a>
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><IconClock size={22} stroke={1.8} /></span>TimeOptima<span className="brand-dot">.</span></a><nav aria-label="Main navigation"><button className="text-button" onClick={() => setHelpOpen(true)}>How it works</button><a href="https://github.com/tonisobowale01/timeslot-optimizer" target="_blank" rel="noreferrer">GitHub <IconArrowUpRight size={14} /></a></nav></header>
    <main>
      <section className="hero"><div><h1>Make room for what matters.</h1><p className="hero-description">Add your commitments. We’ll find the free time.</p></div><button className="primary" onClick={() => add()}><IconPlus size={18} /> Add commitment</button></section>
      <section className="workspace" id="schedule" aria-labelledby="schedule-title" tabIndex={-1}>
        <div className="workspace-toolbar"><div><h2 id="schedule-title">Your week <span>Recurring weekly schedule</span></h2></div><div className="toolbar-actions"><button className="secondary" onClick={() => { setHoursDraft(hours); setHoursError(''); setHoursOpen(true); }}>Availability hours</button><button className="text-button" disabled={!history.length} onClick={() => { const previous = history[history.length - 1]; setEvents(previous); setHistory(history.slice(0, -1)); setAnnouncement('Last schedule change undone.'); }}>Undo</button><button className="text-button" disabled={!events.length} onClick={() => setClearOpen(true)}>Clear</button></div></div>
        <div className="workspace-body"><div className="schedule-panel">{!events.length && <div className="empty-state"><span className="empty-icon"><IconCalendarWeek size={28} stroke={1.5} /></span><div><h3>Your week is wide open.</h3><p>Add a commitment to get started.</p></div><button className="primary" onClick={() => add()}>Add your first commitment</button></div>}
          <ScheduleCalendar events={events} window={window} selected={selected} onSelect={setSelected} onAdd={add} onEdit={edit} />
          <div className="calendar-legend"><span><i className="busy-key" /> Commitment</span><span><i className="free-key" /> Free time</span><small>Click a gap to plan. Click a commitment to edit.</small></div>
        </div><AvailabilityPanel events={events} window={window} selected={selected} onChoose={choose} onFind={openFind} /></div>
      </section>
      
    </main>
    <footer><p className="footer-privacy"><IconLock size={14} /> Private by design. Your schedule stays in this browser and clears on refresh.</p></footer>
    <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    <Modal opened={helpOpen} onClose={() => setHelpOpen(false)} title="How it works" centered radius="lg" closeButtonProps={{ 'aria-label': 'Close help' }}><ol className="help-steps"><li><strong>Add commitments.</strong> Choose times and repeat days.</li><li><strong>See the gaps.</strong> Free time appears automatically; overlaps count once.</li><li><strong>Find a slot.</strong> Use Find me time to search by duration and day.</li></ol><p className="muted">Select a commitment to edit it or a gap to add one. This is a recurring weekly planner. No account or calendar access is needed.</p></Modal>
    {draft && <EventModal key={draft.id} initial={draft} events={events} onClose={closeEvent} onSave={event => { commit(events.some(e => e.id === event.id) ? events.map(e => e.id === event.id ? event : e) : [...events, event], `${event.label} saved.`); closeEvent(); }} onDelete={id => { commit(events.filter(e => e.id !== id), 'Commitment deleted. Use Undo to restore it.'); closeEvent(); }} />}
    {findOpen && <FindTimeModal events={events} onClose={closeFind} onChoose={choose} />}
    <Modal opened={clearOpen} onClose={() => setClearOpen(false)} title="Clear your schedule?" centered radius="lg"><p>This removes all commitments from this week. You can restore them with Undo.</p><div className="modal-actions"><button className="secondary" onClick={() => setClearOpen(false)}>Keep schedule</button><button className="primary" onClick={() => { commit([], 'Schedule cleared. Use Undo to restore it.'); setClearOpen(false); }}>Clear schedule</button></div></Modal>
    <Modal opened={hoursOpen} onClose={() => setHoursOpen(false)} title="Your availability hours" centered radius="lg"><p className="muted">We look for openings within these hours each day. Commitments outside this range stay on your calendar.</p><form noValidate onSubmit={e => { e.preventDefault(); if (!Number.isFinite(parseTime(hoursDraft.start)) || !Number.isFinite(parseTime(hoursDraft.end)) || parseTime(hoursDraft.end) <= parseTime(hoursDraft.start)) { setHoursError('End time must be later than start time.'); return; } setHours(hoursDraft); setHoursOpen(false); }}><div className="form-row"><label className="field">Day starts<input type="time" value={hoursDraft.start} onChange={e => setHoursDraft({ ...hoursDraft, start: e.target.value })} /></label><label className="field">Day ends<input type="time" value={hoursDraft.end} onChange={e => setHoursDraft({ ...hoursDraft, end: e.target.value })} /></label></div>{hoursError && <p className="error" role="alert">{hoursError}</p>}<button className="primary full" type="submit">Update hours</button></form></Modal>
  </div>;
}
export default App;
