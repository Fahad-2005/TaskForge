import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ toggleSidebar, activeWorkspace }) {
  const [activeView, setActiveView] = useState('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Teammate Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Form Field Trackers
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FETCH Scoped Tasks based on activeWorkspace selection
  const fetchTasks = async () => {
    if (!activeWorkspace?._id) return;
    try {
      // Fetching all tasks, then filtering by workspace on the client side
      // (Later we can optimize our backend route to query: Task.find({ workspace: workspaceId }))
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      if (response.ok) {
        const scopedTasks = data.filter(t => t.workspace === activeWorkspace._id);
        setTasks(scopedTasks);
      }
    } catch (error) {
      console.error('Error fetching database data:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeWorkspace]); // Re-fetch data instantly when user selects another workspace!

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !activeWorkspace?._id) return;
    setIsInviting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/workspaces/${activeWorkspace._id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invitation failed');
      alert(`✅ Success: ${data.message}`);
      setInviteEmail('');
    } catch (error) {
      alert(`⚠️ ${error.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!activeWorkspace?._id) return alert('Please select or create a workspace first!');
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, priority, workspace: activeWorkspace._id }),
      });
      if (response.ok) {
        setTitle(''); setDescription(''); setStatus('To Do'); setPriority('Medium');
        setIsModalOpen(false);
        fetchTasks(); 
      }
    } catch (error) {
      alert('Error saving task: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) fetchTasks();
    } catch (error) {
      console.error('Error shifting card pipeline state:', error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBorder = (level) => {
    if (level === 'Urgent') return '#ef4444';
    if (level === 'High') return '#f97316';
    if (level === 'Medium') return '#f59e0b';
    return '#94a3b8';
  };

  if (!activeWorkspace) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#64748b' }}>
        <h3>Select or Create a Workspace from the Sidebar to start tracking tasks!</h3>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Collaborative Workspace Banner */}
      <div className="workspace-banner">
        <div className="workspace-info">
          <span style={{ fontSize: '20px' }}>🏢</span>
          <h3 className="workspace-title">{activeWorkspace.name}</h3>
        </div>
        
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
            {isInviting ? 'Adding...' : '+ Invite'}
          </button>
        </form>
      </div>

      {/* Top Application Ribbon */}
      <div className="top-bar">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>☰</button>

        <div className="filter-bar">
          <input type="text" className="search-input" placeholder="🔍 Search workspace tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <select className="priority-filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="view-switcher" style={{ marginLeft: '16px' }}>
          <button onClick={() => setActiveView('board')} className="view-btn" style={{ backgroundColor: activeView === 'board' ? '#fff' : 'transparent', color: activeView === 'board' ? '#1e293b' : '#64748b' }}>📋 Board View</button>
          <button onClick={() => setActiveView('list')} className="view-btn" style={{ backgroundColor: activeView === 'list' ? '#fff' : 'transparent', color: activeView === 'list' ? '#1e293b' : '#64748b' }}>☰ List View</button>
        </div>

        <button className="add-task-btn" onClick={() => setIsModalOpen(true)}>+ Add Task</button>
      </div>

      {/* Main Content Area Canvas */}
      <div className="canvas-area">
        {activeView === 'board' ? (
          <div className="kanban-grid" style={{ alignItems: 'flex-start' }}>
            {['To Do', 'In Progress', 'In Review', 'Complete'].map((columnTitle) => {
              const columnTasks = filteredTasks.filter(t => t.status === columnTitle);

              return (
                <div key={columnTitle} className="kanban-column" style={{ maxH: 'calc(100vh - 200px)' }}>
                  <div className="column-header">
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>{columnTitle}</span>
                    <span style={{ backgroundColor: '#cbd5e1', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                      {columnTasks.length}
                    </span>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', minHeight: '150px' }}>
                    {columnTasks.length === 0 ? (
                      <div className="task-dropzone" style={{ height: '80px', border: '2px dashed #cbd5e1', color: '#94a3b8' }}>No Tasks</div>
                    ) : (
                      columnTasks.map((task) => (
                        <div key={task._id} className="task-card" style={{ borderLeftColor: getPriorityBorder(task.priority) }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                            <select className="status-select-inline" value={task.status} onChange={(e) => handleUpdateStatus(task._id, e.target.value)}>
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
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Workspace Grid View ({filteredTasks.length} shown)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTasks.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>No tasks found in this workspace.</p>
              ) : (
                filteredTasks.map(t => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: '#334155' }}>{t.title}</span>
                    <span style={{ color: '#64748b' }}>{t.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL */}
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
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-task-btn" disabled={isSubmitting}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;