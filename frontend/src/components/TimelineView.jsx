import { useMemo, useState } from 'react';
import { toDateKey } from '../utils/dateHelpers';
import './TimelineView.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const VISIBLE_DAYS = 42;

function startOfDay(value) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(value, amount) {
  const date = startOfDay(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function dayDifference(start, end) {
  return Math.round((startOfDay(end) - startOfDay(start)) / DAY_MS);
}

function TimelineView({ tasks, onTaskClick, onTaskMove }) {
  const [rangeStart, setRangeStart] = useState(() => addDays(new Date(), -7));
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const days = useMemo(
    () => Array.from({ length: VISIBLE_DAYS }, (_, index) => addDays(rangeStart, index)),
    [rangeStart]
  );

  const scheduled = tasks.filter((task) => task.startDate && task.dueDate);
  const unscheduled = tasks.filter((task) => !task.startDate || !task.dueDate);
  const todayIndex = dayDifference(rangeStart, new Date());

  const moveRange = (daysToMove) => setRangeStart((current) => addDays(current, daysToMove));
  const goToday = () => setRangeStart(addDays(new Date(), -7));

  const handleDrop = (event, targetDate) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/task-id') || draggingTaskId;
    const task = tasks.find((item) => item._id === taskId);
    setDraggingTaskId(null);
    if (!task) return;

    const duration = task.startDate && task.dueDate
      ? Math.max(0, dayDifference(task.startDate, task.dueDate))
      : 0;
    onTaskMove(taskId, startOfDay(targetDate), addDays(targetDate, duration));
  };

  return (
    <div className="timeline-view">
      <div className="timeline-toolbar">
        <div>
          <h3>Project Timeline</h3>
          <p>Drag a bar to move its schedule while preserving its duration.</p>
        </div>
        <div className="timeline-controls">
          <button type="button" onClick={() => moveRange(-28)}>‹ Previous</button>
          <button type="button" onClick={goToday}>Today</button>
          <button type="button" onClick={() => moveRange(28)}>Next ›</button>
        </div>
      </div>

      <div className="timeline-shell">
        <div className="timeline-header-row">
          <div className="timeline-task-heading">Task</div>
          <div className="timeline-calendar-heading">
            <div className="timeline-week-row">
              {days.filter((_, index) => index % 7 === 0).map((date) => (
                <div key={toDateKey(date)} className="timeline-week">
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
            <div className="timeline-day-row">
              {days.map((date) => (
                <div
                  key={toDateKey(date)}
                  className={`timeline-day-label ${toDateKey(date) === toDateKey(new Date()) ? 'is-today' : ''}`}
                >
                  <span>{date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
                  <strong>{date.getDate()}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {scheduled.length === 0 ? (
          <div className="timeline-empty">Add start and due dates to display tasks on the timeline.</div>
        ) : (
          <div className="timeline-rows">
            {scheduled.map((task) => {
              const rawStart = dayDifference(rangeStart, task.startDate);
              const rawEnd = dayDifference(rangeStart, task.dueDate);
              const leftIndex = Math.max(0, rawStart);
              const rightIndex = Math.min(VISIBLE_DAYS - 1, rawEnd);
              const visible = rightIndex >= 0 && leftIndex < VISIBLE_DAYS && rightIndex >= leftIndex;
              const left = `${(leftIndex / VISIBLE_DAYS) * 100}%`;
              const width = `${((rightIndex - leftIndex + 1) / VISIBLE_DAYS) * 100}%`;

              return (
                <div className="timeline-row" key={task._id}>
                  <button type="button" className="timeline-task-label" onClick={() => onTaskClick(task)}>
                    <span className={`timeline-priority-dot priority-${task.priority.toLowerCase()}`} />
                    <span>
                      <strong>{task.title}</strong>
                      <small>{task.status}</small>
                    </span>
                  </button>
                  <div className="timeline-track">
                    {days.map((date) => (
                      <div
                        key={toDateKey(date)}
                        className="timeline-drop-cell"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, date)}
                      />
                    ))}
                    {todayIndex >= 0 && todayIndex < VISIBLE_DAYS && (
                      <span
                        className="timeline-today-line"
                        style={{ left: `${((todayIndex + 0.5) / VISIBLE_DAYS) * 100}%` }}
                      />
                    )}
                    {visible && (
                      <button
                        type="button"
                        draggable
                        className={`timeline-bar priority-${task.priority.toLowerCase()} ${draggingTaskId === task._id ? 'is-dragging' : ''}`}
                        style={{ left, width }}
                        onDragStart={(event) => {
                          setDraggingTaskId(task._id);
                          event.dataTransfer.setData('text/task-id', task._id);
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => setDraggingTaskId(null)}
                        onClick={() => onTaskClick(task)}
                        title={`${task.title}: ${new Date(task.startDate).toLocaleDateString()} – ${new Date(task.dueDate).toLocaleDateString()}`}
                      >
                        {task.title}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {unscheduled.length > 0 && (
        <div className="timeline-unscheduled">
          <div>
            <h4>Unscheduled tasks</h4>
            <p>Set both a start and due date to place these on the timeline.</p>
          </div>
          <div className="timeline-unscheduled-list">
            {unscheduled.map((task) => (
              <button type="button" key={task._id} onClick={() => onTaskClick(task)}>
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineView;
