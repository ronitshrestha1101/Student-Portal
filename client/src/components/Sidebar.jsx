import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  Award,
  Megaphone,
  Settings,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const getNavigationLinks = () => {
    const role = user?.role;

    if (role === 'admin') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/students', label: 'Students', icon: <Users size={20} /> },
        { path: '/teachers', label: 'Teachers', icon: <GraduationCap size={20} /> },
        { path: '/departments', label: 'Departments', icon: <School size={20} /> },
        { path: '/courses', label: 'Courses', icon: <BookOpen size={20} /> },
        { path: '/exams', label: 'Examinations', icon: <Award size={20} /> },
        { path: '/announcements', label: 'Announcements', icon: <Megaphone size={20} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
      ];
    } else if (role === 'teacher') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },
        { path: '/exams', label: 'Examinations & Grades', icon: <Award size={20} /> },
        { path: '/announcements', label: 'Announcements', icon: <Megaphone size={20} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
      ];
    } else if (role === 'student') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/attendance/my', label: 'My Attendance', icon: <CalendarCheck size={20} /> },
        { path: '/exams/my-results', label: 'My Results', icon: <Award size={20} /> },
        { path: '/announcements', label: 'Announcements', icon: <Megaphone size={20} /> },
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
      ];
    }
    return [];
  };

  const navLinks = getNavigationLinks();

  return (
    <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <School className="logo-icon" size={24} />
          <span className="logo-text">State University</span>
        </div>
        <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-navigation">
        <ul className="sidebar-menu">
          {navLinks.map((link) => (
            <li key={link.path} className="sidebar-menu-item">
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                onClick={() => {
                  if (window.innerWidth <= 1024) {
                    toggleSidebar(); // Close drawer on mobile click
                  }
                }}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-label">{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <span className="academic-term">Fall Semester 2026</span>
      </div>
    </aside>
  );
};

export default Sidebar;
