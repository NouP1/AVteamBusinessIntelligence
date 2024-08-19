import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BuyerRecords from './components/BuyerDashboard';
import NavBar from './components/NavBar';
import Sidebar from './components/SideBar';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';


const App = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = [
    { label: 'Главная', onClick: () => console.log('Главная') },
    { label: 'Настройки', onClick: () => console.log('Настройки') },
    { label: 'Профиль', onClick: () => console.log('Профиль') },
  ];

  return (
    <Router>
      <div>
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        ) : (
          <> 
           
          <NavBar onMenuClick={handleMenuClick} onLogout={handleLogout}  />
           
           
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} menuItems={menuItems} />
           
            <Routes>
              {user.role === 'admin' ? (
                <Route path="/admin" element={<AdminDashboard />} />
              ) : (
                <Route path={`/buyer/${user.name}`} element={<BuyerRecords username={user.name} />} />
              )}
              <Route path="*" element={<Navigate to={user.role === 'admin' ? '/admin' : `/buyer/${user.name}`} />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;