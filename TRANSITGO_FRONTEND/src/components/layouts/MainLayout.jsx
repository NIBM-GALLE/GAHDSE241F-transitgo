import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{ flex: 1, background: '#f4f6fc', padding: '32px' }}>
      <Outlet />
    </main>
  </div>
);

export default MainLayout;