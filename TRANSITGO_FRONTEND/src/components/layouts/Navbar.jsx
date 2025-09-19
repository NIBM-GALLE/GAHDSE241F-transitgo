import React from 'react';
import logo from '../../assets/Logo.png';
import { MdNotificationsNone } from 'react-icons/md';

const Navbar = () => {
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
        left: 296,
        right: 0,
        zIndex: 1001,
        height: 64,
        borderRadius: '0 0 0 0',
        boxShadow: '0 2px 12px rgba(39,174,96,0.08)',
      }}
    >
      <img
        style={{ height: 40, objectFit: 'contain', borderRadius: 8 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button
          style={{
            background: 'white',
            border: 'none',
            color: '#27ae60',
            fontSize: 28,
            cursor: 'pointer',
            position: 'relative',
            borderRadius: 8,
            padding: '6px 10px',
            boxShadow: '0 1px 4px rgba(22,201,141,0.08)',
            transition: 'background 0.2s',
          }}
          aria-label="Notifications"
        >
          <MdNotificationsNone />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: '#e74c3c',
              color: 'white',
              borderRadius: '50%',
              fontSize: 10,
              padding: '2px 5px',
              minWidth: 16,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            3
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
