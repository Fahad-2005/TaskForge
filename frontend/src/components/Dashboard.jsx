import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ toggleSidebar }) {
  const [activeView, setActiveView] = useState('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]); // Holds our tasks array from the database

  // Form Field Trackers
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📥 READ: Fetch tasks from database as soon as dashboard mounts
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching database data:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 📤 WRITE: Create a new task and append it dynamically
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, priority }),
      });

      if (response.ok) {
        // Clear fields, hide modal, and silently refresh dataset from cloud
        setTitle('');
        setDescription('');
        setStatus('To Do');
        setPriority('Medium');
        setIsModalOpen(false);
        fetchTasks(); 
      }
    } catch (error) {
      alert('Error saving task: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔄 UPDATE: Toggle column assignment on an active task card
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Optimistically reload UI items directly out of database records
        fetchTasks();
      }
    } catch (error) {
      console.error('Error shifting card pipeline state:', error);
    }
  };

  // Helper mapping to attach border highlights to cards depending on priority tiers
  const getPriorityBorder = (level) => {
    if (level === 'Urgent') return '#ef4444';
    if (level === 'High') return '#f97316';
    if (level === 'Medium') return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <div className="dashboard-container">
      {/* Top Application Ribbon */}
      <div className="top-bar">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>☰</button>

        <div className="view-switcher">
          <button onClick={() => setActiveView('board')} className="view-btn" style={{ backgroundColor: activeView === 'board' ? '#fff' : 'transparent', color: activeView === 'board' ? '#1e293b' : '#64748b' }}>📋 Board View</button>
          <button onClick={() => setActiveView('list')} className="view-btn" style={{ backgroundColor: activeView === 'list' ? '#fff' : 'transparent', color: activeView === 'list' ? '#1e293b' : '#64748b' }}>☰ List View</button>
        </div>

        <button className="add-task-btn" onClick={() => setIsModalOpen(true)}>+ Add New Task</button>
      </div>

      {/* Main Content Area */}
      <div className="canvas-area">
        {activeView === 'board' ? (
          <div className="kanban-grid">
            {['To Do', 'In Progress', 'In Review', 'Complete'].map((columnTitle) => {
              // Filter database array down to items matching this column pipeline criteria
              const columnTasks = tasks.filter(t => t.status === columnTitle);

              return (
                <div key={columnTitle} className="kanban-column">
                  <div className="column-header">
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>{columnTitle}</span>
                    <span style={{ backgroundColor: '#cbd5e1', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task Cards Container Area */}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {columnTasks.length === 0 ? (
                      <div className="task-dropzone" style={{ height: '80px', border: '2px dashed #cbd5e1', color: '#94a3b8' }}>Empty</div>
                    ) : (
                      columnTasks.map((task) => (
                        <div key={task._id} className="task-card" style={{ borderLeftColor: getPriorityBorder(task.priority) }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                            
                            {/* Quick Action Selector to Update Columns */}
                            <select 
                              className="status-select-inline" 
                              value={task.status} 
                              onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="In Review">In Review</option>
                              <option value="Complete">Complete</option>
                            </select>
                          </div>

                          <h4>{task.title}</h4>
                          {task.description && <p>{task.description}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Representation Layout */
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Workspace Grid View ({tasks.length} total tasks)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasks.map(t => (
                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{t.title}</span>
                  <span style={{ color: '#64748b' }}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- POP-UP CREATION MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="modal-form">
              <div>
                <label>Task Title</label>
                <input type="text" placeholder="e.g., Fix Sidebar Alignment" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div>
                <label>Description</label>
                <textarea placeholder="Describe what needs to be done..." rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label>Status Pipeline</label>
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

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-task-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Task'}
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