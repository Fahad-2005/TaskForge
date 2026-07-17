import { useMemo, useState } from 'react';
import {
  MONTH_NAMES,
  WEEKDAY_LABELS,
  formatDisplayDate,
  getCalendarDays,
  isToday,
  toDateKey,
} from '../utils/dateHelpers';
import './CalendarView.css';

function CalendarView({ tasks, onDateClick, onTaskClick, onTaskDrop }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dropTargetKey, setDropTargetKey] = useState(null);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const key = toDateKey(task.dueDate);
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return map;
  }, [tasks]);

  const unscheduledTasks = useMemo(
    () => tasks.filter((task) => !task.dueDate),
    [tasks]
  );

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDateKey(toDateKey(today));
  };

  const handleDayClick = (date) => {
    const key = toDateKey(date);
    setSelectedDateKey(key);
    onDateClick(date);
  };

  const handleDragStart = (e, taskId) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('text/task-id', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDropTargetKey(null);
  };

  const handleDragOver = (e, dateKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetKey(dateKey);
  };

  const handleDragLeave = (dateKey) => {
    if (dropTargetKey === dateKey) setDropTargetKey(null);
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/task-id') || draggingTaskId;
    setDraggingTaskId(null);
    setDropTargetKey(null);
    if (taskId) onTaskDrop(taskId, date);
  };

  const handleUnscheduledDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/task-id') || draggingTaskId;
    setDraggingTaskId(null);
    setDropTargetKey(null);
    if (taskId) onTaskDrop(taskId, null);
  };

  return (
    <div className="calendar-view">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <h3 className="calendar-month-title">
            {MONTH_NAMES[month]} {year}
          </h3>
          <div className="calendar-nav">
            <button type="button" className="calendar-nav-btn" onClick={goToPrevMonth} aria-label="Previous month">‹</button>
            <button type="button" className="calendar-nav-btn calendar-today-btn" onClick={goToToday}>Today</button>
            <button type="button" className="calendar-nav-btn" onClick={goToNextMonth} aria-label="Next month">›</button>
          </div>
        </div>
        <p className="calendar-hint">Click a date to schedule · Drag tasks between days</p>
      </div>

      <div className="calendar-layout">
        <div className="calendar-grid-panel">
          <div className="calendar-weekdays">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="calendar-weekday">{label}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date) => {
              const dateKey = toDateKey(date);
              const isCurrentMonth = date.getMonth() === month;
              const dayTasks = tasksByDate[dateKey] || [];
              const isDropTarget = dropTargetKey === dateKey;

              return (
                <div
                  key={dateKey}
                  className={[
                    'calendar-day',
                    !isCurrentMonth && 'calendar-day--muted',
                    isToday(date) && 'calendar-day--today',
                    selectedDateKey === dateKey && 'calendar-day--selected',
                    isDropTarget && 'calendar-day--drop-target',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleDayClick(date)}
                  onDragOver={(e) => handleDragOver(e, dateKey)}
                  onDragLeave={() => handleDragLeave(dateKey)}
                  onDrop={(e) => handleDrop(e, date)}
                >
                  <span className="calendar-day-number">{date.getDate()}</span>

                  <div className="calendar-day-tasks">
                    {dayTasks.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className={[
                          'calendar-task-chip',
                          `calendar-task-chip--${task.priority.toLowerCase()}`,
                          draggingTaskId === task._id && 'calendar-task-chip--dragging',
                        ].filter(Boolean).join(' ')}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside
          className="calendar-sidebar"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleUnscheduledDrop}
        >
          <h4 className="calendar-sidebar-title">Unscheduled</h4>
          <p className="calendar-sidebar-desc">Drag tasks here to remove deadlines, or onto a date to schedule.</p>

          <div className="calendar-unscheduled-list">
            {unscheduledTasks.length === 0 ? (
              <p className="calendar-unscheduled-empty">All tasks have deadlines mapped.</p>
            ) : (
              unscheduledTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onTaskClick(task)}
                  className={[
                    'calendar-unscheduled-item',
                    `calendar-task-chip--${task.priority.toLowerCase()}`,
                    draggingTaskId === task._id && 'calendar-task-chip--dragging',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="calendar-unscheduled-dot" />
                  {task.title}
                </div>
              ))
            )}
          </div>

          {selectedDateKey && (
            <div className="calendar-selected-info">
              <span className="calendar-selected-label">Selected</span>
              <strong>{formatDisplayDate(selectedDateKey)}</strong>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default CalendarView;
