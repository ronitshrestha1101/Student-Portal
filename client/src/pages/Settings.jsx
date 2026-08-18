import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Settings as SettingsIcon, ShieldAlert, KeyRound } from 'lucide-react';

const Settings = () => {
  const { user, profile } = useAuth();
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send change password request to backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setSuccess('Your password has been changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Could not update password. Verify current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-section">
      <div className="page-header">
        <div className="page-title-desc">
          <h2>Account Settings</h2>
          <p className="page-description">Manage your portal credentials, update login passwords, and review security settings.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }} className="profile-detail-layout">
        {/* Change Password Card */}
        <div className="settings-card">
          <h3 className="settings-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} className="icon-muted" />
            <span>Update Password</span>
          </h3>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                name="currentPassword"
                className="form-input"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                name="newPassword"
                className="form-input"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                placeholder="Re-enter new password"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Account Details Brief */}
        <div className="settings-card">
          <h3 className="settings-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} className="icon-muted" />
            <span>Login Information</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</span>
              <span style={{ fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Account Access Level</span>
              <span className={`badge badge-info`} style={{ marginTop: '4px' }}>{user?.role}</span>
            </div>
            {profile && (
              <>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Unique UID</span>
                  <span className="text-mono" style={{ fontWeight: 600 }}>{profile.studentId || profile.employeeId}</span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Department</span>
                  <span style={{ fontWeight: 600 }}>{profile.department?.name}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
