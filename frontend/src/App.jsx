import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HomeHub from './components/HomeHub';
import ProfileSettings from './components/ProfileSettings';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');

  // Multi-Workspace States
  const [workspaces, setWorkspaces] = useState({ owned: [], joined: [] });
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  // 📊 Global Tasks State for Live HomeHub Analytics
  const [allTasks, setAllTasks] = useState([]);

  // Fetch workspaces matching ONLY the logged-in user profiles
  const fetchWorkspaces = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || (!currentUser.id && !currentUser._id)) return;
    
    const userId = currentUser.id || currentUser._id;

    try {
      // Calling our newly created smart database filtering route endpoint
      const response = await fetch(`http://localhost:5000/api/workspaces/user/${userId}`);
      if (response.ok) {
        const data = await response.json(); // Data structure is now: { owned: [...], joined: [...] }
        setWorkspaces(data);
        
        // Auto-select the first available workspace as active context fallback if present
        if (data.owned.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data.owned[0]);
        } else if (data.joined.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data.joined[0]);
        }
      }
    } catch (error) {
      console.error("Error pulling workspaces:", error);
    }
  };

  // 📈 Fetch all global tasks for analytics extraction
  const fetchAllUserTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setAllTasks(data);
      }
    } catch (error) {
      console.error("Error loading global tasks for analytics:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWorkspaces();
      fetchAllUserTasks(); // Hydrate task list immediately on login match
    } else {
      setWorkspaces({ owned: [], joined: [] });
      setActiveWorkspace(null);
      setAllTasks([]);
    }
  }, [isLoggedIn]);

  const handleCreateWorkspace = async (workspaceName) => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;

    try {
      const response = await fetch('http://localhost:5000/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName, ownerId: userId }),
      });
      if (response.ok) {
        // Refresh the whole workspace object list safely straight out of database collections
        fetchWorkspaces();
        setCurrentScreen('tasks');
      }
    } catch (error) {
      console.error("Error writing new workspace:", error);
    }
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, overflow: 'hidden' }}>
      <Sidebar 
        onLogout={() => setIsLoggedIn(false)} 
        isOpen={sidebarOpen} 
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
      />

      {/* Connected dynamic data array tracking into your landing metrics dashboard */}
      {currentScreen === 'home' && (
        <HomeHub changeSubScreen={setCurrentScreen} tasks={allTasks} />
      )}
      
      {currentScreen === 'tasks' && (
        <Dashboard toggleSidebar={() => setSidebarOpen(!sidebarOpen)} activeWorkspace={activeWorkspace} />
      )}

      {currentScreen === 'settings' && (
        <ProfileSettings />
      )}
    </div>
  );
}

export default App;