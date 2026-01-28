import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { signOutUser } from "../../firebase/auth";

const sidebarSections = [
  {
    header: null,
    items: [
      { label: "Dashboard", icon: <MdDashboard size={18} />, to: "/home" }
    ]
  },
  {
    header: "BUS REGISTRATION",
    items: [
      { label: "Registration", icon: <MdOutlineAppRegistration size={16} />, to: "/home/bus_registration" }
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
  const navigate = useNavigate();
  const location = useLocation();
  const [openSection, setOpenSection] = useState(null);

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.success) {
      navigate("/");
    }
  };

  const textTransition = {
    transition: "opacity 0.25s ease, transform 0.25s ease, width 0.25s ease",
    opacity: sidebarOpen ? 1 : 0,
    transform: sidebarOpen ? "translateX(0)" : "translateX(-8px)",
    width: sidebarOpen ? "auto" : 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    pointerEvents: sidebarOpen ? "auto" : "none",
  };

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
          className="fixed inset-0 bg-white bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      <aside
        style={{
          background: 'linear-gradient(180deg, #27ae60 0%, #16c98d 100%)',
          borderRadius: '0 0 0 0',
          boxShadow: '2px 0 12px rgba(39,174,96,0.08)',
          width: sidebarOpen ? 296 : 64,
          transition: 'width 0.3s ease-in-out',
        }}
        className={`fixed top-0 left-0 h-screen z-50 shadow-lg`}
      >
        {/* Logo & Toggle */}
        <div 
          className={`flex items-center py-5 ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-2'}`} 
          style={{ borderBottom: '1px solid #16c98d' }}
        >
          {sidebarOpen && (
            <img
              src={logo}
              alt="TransitGo Logo"
              className={`transition-all`}
              style={{
                objectFit: "contain",
                height: 100,
                width: 120,
                borderRadius: 8,
                transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
              }}
            />
          )}
          <button
            onClick={toggleSidebar}
            style={{
              background: '#fff',
              color: '#27ae60',
              border: 'none',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 22,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(22,201,141,0.08)',
              transition: 'background 0.2s',
              marginLeft: sidebarOpen ? 8 : 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="transition"
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
              {section.header && (
                <div
                  aria-hidden={!sidebarOpen}
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 12,
                    padding: sidebarOpen ? "8px 12px" : 0,
                    margin: sidebarOpen ? "8px 0 4px 0" : 0,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    opacity: sidebarOpen ? 0.8 : 0,
                    maxHeight: sidebarOpen ? 40 : 0,
                    overflow: "hidden",
                    transition:
                      "opacity 0.25s ease, max-height 0.25s ease, padding 0.25s ease, margin 0.25s ease",
                    pointerEvents: sidebarOpen ? "auto" : "none",
                  }}
                >
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
                      gap: sidebarOpen ? 12 : 0,
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
                    <span style={textTransition}>{item.label}</span>
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
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: sidebarOpen ? 12 : 0,
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
            <span style={textTransition}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
