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
      { label: "Registration", icon: <MdOutlineAppRegistration size={16} />, to: "/cashier" }
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

const Sidebar = ({ sidebarOpen = true, toggleSidebar = () => {}, isMobile = false }) => {
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
          background: "linear-gradient(to bottom, #59AC77 0%, #59AC77 50%, #3A6F43 100%)"
        }}
        className={`fixed top-0 left-0 h-screen z-50 border-r border-gray-400 shadow-lg transition-all duration-300 ${
          sidebarOpen
            ? isMobile
              ? "w-64 translate-x-0"
              : "w-64"
            : isMobile
            ? "-translate-x-full"
            : "w-20"
        }`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-400">
          <img
            src={logo}
            alt="TransitGo Logo"
            className={`transition-all ${sidebarOpen ? "h-40 w-70" : "h-8 w-auto mx-auto"}`}
            style={{ objectFit: "contain" }}
          />
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-gray-200 transition ml-2"
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
                <div className="text-xs text-gray-900 font-semibold px-2 py-1 mt-2 mb-1 uppercase tracking-wide">
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
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#1C352D] text-white font-semibold"
                        : "text-green-950 hover:bg-[#1C352D] hover:text-white"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <span className="text-sm whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-3 border-t border-gray-400 bg-[#3A6F43]">
          <button
            onClick={async () => await logout()}
            className={`flex items-center gap-3 p-2 rounded-lg w-full text-green-950 hover:bg-red-500 hover:text-white transition-all ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
          >
            <FiLogOut size={18} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
          {sidebarOpen && (
            <div className="mt-2 text-xs text-gray-500 text-center">
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;