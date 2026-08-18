import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar on path changes if on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Determine navbar page title
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') {
      if (user?.role === 'student') return 'Student Portal';
      if (user?.role === 'teacher') return 'Faculty Portal';
      return 'Institutional Overview';
    }
    if (path.startsWith('/students')) return 'Student Registry';
    if (path.startsWith('/teachers')) return 'Faculty Directory';
    if (path.startsWith('/departments')) return 'Academic Departments';
    if (path.startsWith('/courses')) return 'Course Registry';
    if (path.startsWith('/attendance')) {
      if (user?.role === 'student') return 'My Attendance Record';
      return 'Class Attendance';
    }
    if (path.startsWith('/exams')) {
      if (user?.role === 'student') return 'Grade Transcript';
      return 'Examinations & Grades';
    }
    if (path.startsWith('/announcements')) return 'Announcements Board';
    if (path.startsWith('/settings')) return 'System Settings';

    return 'Academic Portal';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar navigation drawer */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Sidebar mobile overlay background */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      <div className="dashboard-content-area">
        {/* Top Navbar */}
        <div className="top-navbar-wrapper">
          <button className="mobile-menu-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
            <Menu size={22} />
          </button>
          <Navbar title={getPageTitle()} />
        </div>

        {/* Scrollable Main content */}
        <main className="dashboard-main-view">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
