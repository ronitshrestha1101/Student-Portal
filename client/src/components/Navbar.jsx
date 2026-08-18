import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user, profile, logout } = useAuth();

  // Get display name
  const getDisplayName = () => {
    if (profile && profile.firstName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return user?.email ? user.email.split('@')[0] : 'Administrator';
  };

  // Get role label
  const getRoleLabel = () => {
    if (!user) return '';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <h1 className="navbar-title">{title || 'Academic Portal'}</h1>
      </div>
      
      <div className="navbar-right">
        <div className="navbar-notifications" title="No new notifications">
          <Bell size={20} className="icon-muted" />
        </div>
        
        <div className="navbar-user-profile">
          <div className="avatar-placeholder">
            {profile?.firstName ? (
              profile.firstName.charAt(0) + profile.lastName.charAt(0)
            ) : (
              <User size={18} />
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{getDisplayName()}</span>
            <span className={`user-role-badge role-${user?.role}`}>{getRoleLabel()}</span>
          </div>
        </div>

        <button onClick={logout} className="btn-logout" title="Sign out from portal">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
