import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && <Navbar />}
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={handleToggleSidebar}
        isMobile={isMobile}
      />
      <main
        style={{
          flex: 1,
          background: '#f4f6fc',
          padding: isMobile ? '32px 8px' : '32px',
          marginTop: 56,
          position: 'relative'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;