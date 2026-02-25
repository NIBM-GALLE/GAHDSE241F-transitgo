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
      {!isMobile && <Navbar sidebarWidth={sidebarOpen ? 296 : 64} />}
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
          marginTop: isMobile ? 0 : 64,
          marginLeft: isMobile ? 0 : (sidebarOpen ? 296 : 64),
          position: 'relative',
          transition: 'margin-left 0.3s ease-in-out',
          height: isMobile ? '100vh' : 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
