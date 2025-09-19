import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from "react-icons/md";
import { FaUser, FaRoute, } from "react-icons/fa";
import { MdOutlineAppRegistration } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { FaTicket } from "react-icons/fa6";
import { TbReportAnalytics } from "react-icons/tb";
import { FiLogOut } from "react-icons/fi";
import logo from '../../assets/Logo.png';

// Add this fallback at the top, before Sidebar definition
const useAuth = () => ({
  logout: async () => {
    // Dummy logout function
    // Replace with your actual logout logic
    alert("Logged out!");
  }
});

const sidebarSections = [
  {
    header: null,
    items: [
      { label: "Dashboard", icon: <MdDashboard size={18} />, to: "/" }
    ]
  },
  {
    header: "BUS REGISTRATION",
    items: [
      { label: "Registration", icon: <MdOutlineAppRegistration size={16} />, to: "/bus_registration" }
    ]
  },
  {
    header: "ROUTE MANAGEMENT",
    items: [
      { label: "Route", icon: <FaRoute size={16} />, to: "/customer" }
    ]
  },
  {
    header: "BUS SCHEDULING",
    items: [
      { label: "Schedule", icon: <RiCalendarScheduleFill size={16} />, to: "/products" }
    ]
  },
  {
    header: "PASSENGER SECTION",
    items: [
      { label: "Passenger", icon: <FaUser size={16} />, to: "/pawning" }
    ]
  },
  {
    header: "TICKET SECTION",
    items: [
      { label: "Sales & Payments", icon: <FaTicket size={16} />, to: "/accounts" }
    ]
  },
  {
    header: "REPORTS",
    items: [
      { label: "Reports", icon: <TbReportAnalytics size={16} />, to: "/payments" }
    ]
  },
];

const Sidebar = ({ sidebarOpen, toggleSidebar, isMobile = false }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobile, sidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{
          background: 'linear-gradient(180deg, #27ae60 0%, #16c98d 100%)',
          borderRadius: '0 0 0 0',
          boxShadow: '2px 0 12px rgba(39,174,96,0.08)',
          width: sidebarOpen ? 296 : 64,
          transition: 'width 0.3s',
        }}
        className={`fixed top-0 left-0 h-screen z-50 shadow-lg transition-all duration-300`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: '1px solid #16c98d' }}>
          <img
            src={logo}
            alt="TransitGo Logo"
            className={`transition-all`}
            style={{
              objectFit: "contain",
              height: sidebarOpen ? 100 : 32,
              width: sidebarOpen ? 120 : 32,
              borderRadius: 8,
              transition: 'all 0.3s'
            }}
          />
          <button
            onClick={toggleSidebar}
            style={{
              background: '#fff',
              color: '#27ae60',
              border: 'none',
              borderRadius: 8,
              padding: '6px 10px',
              marginLeft: 8,
              fontSize: 22,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(22,201,141,0.08)',
              transition: 'background 0.2s',
            }}
            className="transition ml-2"
          >
            {sidebarOpen ? (
              isMobile ? (
                <MdClose size={22} />
              ) : (
                <MdChevronLeft size={22} />
              )
            ) : (
              <MdChevronRight size={22} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-2 px-2 space-y-2">
          {sidebarSections.map((section, idx) => (
            <div key={idx}>
              {section.header && sidebarOpen && (
                <div style={{
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '8px 12px',
                  margin: '8px 0 4px 0',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}>
                  {section.header}
                </div>
              )}
              {section.items.map((item, itemIdx) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={itemIdx}
                    to={item.to}
                    onClick={() => isMobile && toggleSidebar()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 16px',
                      borderRadius: 8,
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? '#fff' : 'transparent',
                      color: isActive ? '#27ae60' : '#fff',
                      fontSize: 15,
                      marginBottom: 4,
                      boxShadow: isActive ? '0 1px 4px rgba(22,201,141,0.08)' : 'none',
                      transition: 'background 0.2s, color 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{item.icon}</span>
                    {sidebarOpen && (
                      <span>{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom info bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 12px',
          borderTop: '1px solid #16c98d',
          background: 'rgba(22,201,141,0.12)',
          borderRadius: '0 0 24px 24px'
        }}>
          <button
            onClick={async () => await logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 16px',
              borderRadius: 8,
              width: '100%',
              background: '#fff',
              color: '#27ae60',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 1px 4px rgba(22,201,141,0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
          >
            <FiLogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;