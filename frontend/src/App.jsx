import React, { useState } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HomeHub from './components/HomeHub';
import ProfileSettings from './components/ProfileSettings';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // 🎛️ Dynamic Sub-screen Controller ('home', 'tasks', 'settings')
  const [currentScreen, setCurrentScreen] = useState('home'); 

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, overflow: 'hidden' }}>
      
      {/* Sidebar gets the tracking controller links */}
      <Sidebar 
        onLogout={() => setIsLoggedIn(false)} 
        isOpen={sidebarOpen} 
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />

      {/* Conditionally render the appropriate component panel */}
      {currentScreen === 'home' && (
        <HomeHub changeSubScreen={setCurrentScreen} />
      )}
      
      {currentScreen === 'tasks' && (
        <Dashboard toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      )}

      {currentScreen === 'settings' && (
        <ProfileSettings />
      )}

    </div>
  );
}

export default App;