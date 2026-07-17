import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HomeHub from './components/HomeHub';
import ProfileSettings from './components/ProfileSettings';
import NotificationCenter from './components/NotificationCenter';
import { apiFetch } from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));

  const [workspaces, setWorkspaces] = useState({ owned: [], joined: [] });
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [allTasks, setAllTasks] = useState([]);

  const fetchWorkspaces = async () => {
    const currentUser = user || JSON.parse(localStorage.getItem('user'));
    if (!currentUser || (!currentUser.id && !currentUser._id)) return;

    const userId = currentUser.id || currentUser._id;

    try {
      const response = await fetch(`http://localhost:5000/api/workspaces/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);

        if (data.owned.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data.owned[0]);
        } else if (data.joined.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data.joined[0]);
        }
        return data;
      }
    } catch (error) {
      console.error('Error pulling workspaces:', error);
    }
  };

  const fetchAllUserTasks = async (spaces = workspaces) => {
    try {
      const ids = [...(spaces.owned || []), ...(spaces.joined || [])].map((space) => space._id);
      const taskGroups = await Promise.all(ids.map((id) => apiFetch(`/tasks?workspace=${id}`)));
      setAllTasks(taskGroups.flat());
    } catch (error) {
      console.error('Error loading global tasks for analytics:', error);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isLoggedIn) {
      fetchWorkspaces().then((spaces) => {
        if (spaces) fetchAllUserTasks(spaces);
      });
    } else {
      setWorkspaces({ owned: [], joined: [] });
      setActiveWorkspace(null);
      setAllTasks([]);
    }
  }, [isLoggedIn]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const handleCreateWorkspace = async (workspaceName) => {
    const currentUser = user || JSON.parse(localStorage.getItem('user'));
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;

    try {
      const response = await fetch('http://localhost:5000/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName, ownerId: userId }),
      });
      if (response.ok) {
        fetchWorkspaces();
        setCurrentScreen('tasks');
      }
    } catch (error) {
      console.error('Error writing new workspace:', error);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLoginSuccess = () => {
    setUser(JSON.parse(localStorage.getItem('user')));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const showGlobalBell = currentScreen !== 'tasks';

  return (
    <div className="app-shell">
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        user={user}
      />

      {showGlobalBell && (
        <NotificationCenter
          className="notification-center--global"
          onWorkspaceUpdate={fetchWorkspaces}
        />
      )}

      {currentScreen === 'home' && (
        <HomeHub changeSubScreen={setCurrentScreen} tasks={allTasks} user={user} />
      )}

      {currentScreen === 'tasks' && (
        <Dashboard
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeWorkspace={activeWorkspace}
          onWorkspaceUpdate={fetchWorkspaces}
        />
      )}

      {currentScreen === 'settings' && (
        <ProfileSettings user={user} onUserUpdate={handleUserUpdate} />
      )}
    </div>
  );
}

export default App;
