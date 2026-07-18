import { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import TimelineView from './TimelineView';
import NotificationCenter from './NotificationCenter';
import TaskActivityDrawer from './TaskActivityDrawer';
import { toInputDateValue } from '../utils/dateHelpers';
import { apiFetch } from '../services/api';
import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
import './Dashboard.css';

function Dashboard({ toggleSidebar, activeWorkspace, onWorkspaceUpdate }) {
  const [activeView, setActiveView] = useState('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Search, Filter, and Invite States
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Card Expand/Collapse Tracker
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Form Field Trackers (Dual-mode: Create & Edit)
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dropColumn, setDropColumn] = useState(null);

  // User Profile Properties
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const currentUserId = currentUser.id || currentUser._id;
  const isOwner = activeWorkspace?.owner === currentUserId;

  const fetchTasks = async () => {
    if (!activeWorkspace?._id) return;
    try {
      const data = await apiFetch(`/tasks?workspace=${activeWorkspace._id}`);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    fetchTasks();
  }, [activeWorkspace]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const upsertTask = (incoming) => {
    setTasks((current) => {
      const exists = current.some((task) => task._id === incoming._id);
      return exists
        ? current.map((task) => (task._id === incoming._id ? incoming : task))
        : [incoming, ...current];
    });
    setSelectedTask((current) => current?._id === incoming._id ? incoming : current);
  };

  useWorkspaceSocket(activeWorkspace?._id, {
    'task:created': upsertTask,
    'task:updated': upsertTask,
    'task:deleted': ({ _id }) => {
      setTasks((current) => current.filter((task) => task._id !== _id));
      setSelectedTask((current) => current?._id === _id ? null : current);
    },
    connect: fetchTasks,
  });

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !activeWorkspace?._id) return;
    setIsInviting(true);
    setInviteSuccess('');
    setInviteError('');
    try {
      const response = await fetch(`http://localhost:5000/api/workspaces/${activeWorkspace._id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, inviterId: currentUserId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invitation failed');
      setInviteSuccess(data.message);
      setInviteEmail('');
    } catch (error) {
      setInviteError(error.message);
    } finally {
      setIsInviting(false);
    }
  };

  // COMBINED CREATE AND UPDATE HANDLER
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!activeWorkspace?._id) return;
    if (startDate && dueDate && dueDate < startDate) {
      alert('Due date must be on or after the start date.');
      return;
    }
    setIsSubmitting(true);

    const url = editingTaskId ? `/tasks/${editingTaskId}` : '/tasks';
      
    const method = editingTaskId ? 'PUT' : 'POST';

    try {
      const saved = await apiFetch(url, {
        method: method,
        body: JSON.stringify({ 
          title, 
          description, 
          status, 
          priority, 
          workspace: activeWorkspace._id,
          assignedTo: assignedTo || null,
          startDate: startDate || null,
          dueDate: dueDate || null,
        }),
      });
      upsertTask(saved);

      // Clear Form state completely
      closeModal();
    } catch (error) {
      alert('❌ Task operation error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // INLINE TRIGGER: Loads existing task data directly into modal fields
  const openEditModal = (task) => {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setAssignedTo(task.assignedTo || '');
    setStartDate(toInputDateValue(task.startDate));
    setDueDate(toInputDateValue(task.dueDate));
    setIsModalOpen(true);
  };

  const openCreateModal = (prefillDate = null) => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setStatus('To Do');
    setPriority('Medium');
    setAssignedTo('');
    setStartDate(prefillDate ? toInputDateValue(prefillDate) : '');
    setDueDate(prefillDate ? toInputDateValue(prefillDate) : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setStatus('To Do');
    setPriority('Medium');
    setAssignedTo('');
    setStartDate('');
    setDueDate('');
    setIsModalOpen(false);
  };

  // PERMANENT TASK REMOVAL PIPELINE
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task completely?")) return;
    try {
      await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
      setTasks((current) => current.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error executing task removal:", error);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const updated = await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      upsertTask(updated);
    } catch (error) {
      console.error('Error shifting pipeline state:', error);
    }
  };

  const handleTaskDueDateChange = async (taskId, newDate) => {
    try {
      const updated = await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({
          dueDate: newDate ? newDate.toISOString() : null,
        }),
      });
      upsertTask(updated);
    } catch (error) {
      console.error('Error updating task deadline:', error);
    }
  };

  const handleTaskTimelineMove = async (taskId, newStartDate, newDueDate) => {
    try {
      const updated = await apiFetch(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({
          startDate: newStartDate.toISOString(),
          dueDate: newDueDate.toISOString(),
        }),
      });
      upsertTask(updated);
    } catch (error) {
      console.error('Error moving task timeline:', error);
      alert(error.message);
    }
  };

  const handleCardDragStart = (event, taskId) => {
    setDraggingTaskId(taskId);
    event.dataTransfer.setData('text/task-id', taskId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragEnd = () => {
    setDraggingTaskId(null);
    setDropColumn(null);
  };

  const handleColumnDragOver = (event, columnTitle) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropColumn(columnTitle);
  };

  const handleColumnDrop = async (event, columnTitle) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/task-id') || draggingTaskId;
    setDraggingTaskId(null);
    setDropColumn(null);
    if (!taskId) return;

    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === columnTitle) return;
    await handleUpdateStatus(taskId, columnTitle);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBorder = (level) => {
    if (level === 'Urgent') return '#ef4444';
    if (level === 'High') return '#f97316';
    if (level === 'Medium') return '#f59e0b';
    return '#94a3b8';
  };

  // Simple string-to-color hashing fallback loop for avatar styling variety
  const getAvatarColor = (name = 'A') => {
    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  if (!activeWorkspace) {
    return (
      <div className="dashboard-container">
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>No workspace selected</h3>
          <p>Select or create a workspace from the sidebar to start tracking tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Collaborative Workspace Banner */}
      <div className="workspace-banner">
        <div className="workspace-info">
          <span className="workspace-badge">Active</span>
          <h3 className="workspace-title">{activeWorkspace.name}</h3>
        </div>
        
        {isOwner ? (
          <form onSubmit={handleInviteUser} className="invite-form">
            <input 
              type="email" 
              className="invite-input" 
              placeholder="Invite member by email..." 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button type="submit" className="invite-btn" disabled={isInviting}>
              {isInviting ? 'Sending...' : '+ Invite'}
            </button>
            {inviteSuccess && <span className="invite-feedback invite-feedback--success">{inviteSuccess}</span>}
            {inviteError && <span className="invite-feedback invite-feedback--error">{inviteError}</span>}
          </form>
        ) : (
          <span className="member-readonly-label">Read-only Member View</span>
        )}
      </div>

      {/* Top Application Ribbon */}
      <div className="top-bar">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>☰</button>

        <div className="filter-bar">
          <input type="text" className="search-input" placeholder="Search workspace tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <select className="priority-filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="view-switcher">
          <button type="button" onClick={() => setActiveView('board')} className={`view-btn ${activeView === 'board' ? 'active' : ''}`}>Board</button>
          <button type="button" onClick={() => setActiveView('list')} className={`view-btn ${activeView === 'list' ? 'active' : ''}`}>List</button>
          <button type="button" onClick={() => setActiveView('calendar')} className={`view-btn ${activeView === 'calendar' ? 'active' : ''}`}>Calendar</button>
          <button type="button" onClick={() => setActiveView('timeline')} className={`view-btn ${activeView === 'timeline' ? 'active' : ''}`}>Timeline</button>
        </div>

        <NotificationCenter
          className="notification-center--ribbon"
          onWorkspaceUpdate={onWorkspaceUpdate}
        />

        <button type="button" className="add-task-btn" onClick={() => openCreateModal()}>+ Add Task</button>
      </div>

      {/* Main Content Area Canvas */}
      <div className="canvas-area">
        {activeView === 'board' ? (
          <div className="kanban-grid" style={{ alignItems: 'flex-start' }}>
            {['To Do', 'In Progress', 'In Review', 'Complete'].map((columnTitle) => {
              const columnTasks = filteredTasks.filter(t => t.status === columnTitle);

              return (
                <div
                  key={columnTitle}
                  className={`kanban-column ${dropColumn === columnTitle ? 'kanban-column--drop-target' : ''}`}
                  onDragOver={(event) => handleColumnDragOver(event, columnTitle)}
                  onDragLeave={() => {
                    if (dropColumn === columnTitle) setDropColumn(null);
                  }}
                  onDrop={(event) => handleColumnDrop(event, columnTitle)}
                >
                  <div className="column-header">
                    <span className="column-title">{columnTitle}</span>
                    <span className="column-count">{columnTasks.length}</span>
                  </div>

                  <div className="kanban-column-body">
                    {columnTasks.length === 0 ? (
                      <div className="task-dropzone">Drop tasks here</div>
                    ) : (
                      columnTasks.map((task) => {
                        const assigneeInfo = activeWorkspace?.members?.find(m => m._id === task.assignedTo || m._id === task.assignedTo?._id);

                        return (
                          <div
                            key={task._id}
                            className={`task-card ${draggingTaskId === task._id ? 'task-card--dragging' : ''}`}
                            style={{ borderLeftColor: getPriorityBorder(task.priority) }}
                            draggable
                            onDragStart={(event) => handleCardDragStart(event, task._id)}
                            onDragEnd={handleCardDragEnd}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                                
                                {assigneeInfo ? (
                                  <div 
                                    className="assignee-avatar" 
                                    style={{ backgroundColor: getAvatarColor(assigneeInfo.name) }}
                                    title={`Assigned to ${assigneeInfo.name} (${assigneeInfo.email})`}
                                  >
                                    {assigneeInfo.name.charAt(0)}
                                  </div>
                                ) : (
                                  <div className="assignee-avatar" style={{ backgroundColor: '#cbd5e1', color: '#475569' }} title="Unassigned task">
                                    -
                                  </div>
                                )}
                              </div>

                              <select
                                className="status-select-inline"
                                value={task.status}
                                onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="In Review">In Review</option>
                                <option value="Complete">Complete</option>
                              </select>
                            </div>

                            <h4 
                              onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}
                            >
                              <span>{expandedTaskId === task._id ? '▼' : '▶'}</span> {task.title}
                            </h4>

                            {task.dueDate && (
                              <span className="task-due-date">
                                Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            )}

                            {expandedTaskId === task._id && (
                              <div className="task-expand-tray">
                                <p className="task-expand-desc">
                                  {task.description || <span className="task-no-desc">No description provided.</span>}
                                </p>
                                
                                <div className="card-action-row">
                                  <button type="button" onClick={() => setSelectedTask(task)} className="tray-btn edit-btn">Discuss</button>
                                  <button type="button" onClick={() => openEditModal(task)} className="tray-btn edit-btn">Edit</button>
                                  <button type="button" onClick={() => handleDeleteTask(task._id)} className="tray-btn delete-btn">Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeView === 'list' ? (
          <div className="list-view-panel">
            <h4 className="list-view-title">Workspace Grid View ({filteredTasks.length} shown)</h4>
            {filteredTasks.length === 0 ? (
              <p className="list-view-empty">No tasks found in this workspace.</p>
            ) : (
              <table className="list-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t._id} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td>{t.status}</td>
                      <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                      <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : activeView === 'calendar' ? (
          <CalendarView
            tasks={filteredTasks}
            onDateClick={(date) => openCreateModal(date)}
            onTaskClick={setSelectedTask}
            onTaskDrop={handleTaskDueDateChange}
          />
        ) : (
          <TimelineView
            tasks={filteredTasks}
            onTaskClick={setSelectedTask}
            onTaskMove={handleTaskTimelineMove}
          />
        )}
      </div>

      {selectedTask && (
        <TaskActivityDrawer
          task={selectedTask}
          workspaceId={activeWorkspace._id}
          members={activeWorkspace.members || []}
          onClose={() => setSelectedTask(null)}
          onEdit={(task) => {
            setSelectedTask(null);
            openEditModal(task);
          }}
        />
      )}

      {/* DUAL PURPOSE CREATION / EDITING MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{editingTaskId ? 'Edit Task Details' : 'Create New Task'}</h2>
              <button type="button" className="close-modal-btn" onClick={closeModal} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSaveTask} className="modal-form">
              <div>
                <label>Task Title</label>
                <input type="text" placeholder="e.g., Fix Layout Alignment" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label>Description</label>
                <textarea placeholder="Describe details..." rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Assign To Teammate</label>
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  <option value="">Unassigned (No one)</option>
                  {activeWorkspace?.members?.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-date-row">
                <div>
                  <label>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label>Due Date</label>
                  <input type="date" min={startDate || undefined} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary modal-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;