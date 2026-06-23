import React, { useState } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Master responsive state

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, overflow: 'hidden' }}>
      <Sidebar onLogout={() => setIsLoggedIn(false)} isOpen={sidebarOpen} />
      <Dashboard toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    </div>
  );
}

export default App;