import React from 'react';
import logo from '../../assets/Logo.png';
import { MdNotificationsNone } from 'react-icons/md';

const Navbar = ({ sidebarWidth }) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 32px',
        background: 'linear-gradient(90deg, #27ae60 0%, #16c98d 100%)',
        borderBottom: 'none',
        position: 'fixed',
        top: 0,
        left: sidebarWidth,
        right: 0,
        zIndex: 1001,
        height: 64,
        borderRadius: '0 0 0 0',
        boxShadow: '0 2px 12px rgba(39,174,96,0.08)',
        transition: 'left 0.3s ease-in-out'
      }}
    >
      <img
        style={{ height: 40, objectFit: 'contain', borderRadius: 8 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      </div>
    </nav>
  );
};

export default Navbar;
