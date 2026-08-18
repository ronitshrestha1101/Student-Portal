import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import { ArrowLeft, User, Phone, Mail, Calendar, School, BookOpen } from 'lucide-react';

const TeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.teachers.get(id);
        setProfileData(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve faculty profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton variant="rect" height="40px" width="200px" />
        <div className="profile-detail-layout">
          <Skeleton variant="rect" height="350px" />
          <Skeleton variant="rect" height="350px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <Alert type="error" message={error} />
      </div>
    );
  }

  const { teacher, courses } = profileData;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} />
        <span>Back to Directory</span>
      </button>

      <div className="profile-detail-layout">
        {/* Left Column: Teacher Info Card */}
        <div className="profile-sidebar">
          <div className="profile-avatar-large">
            {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
          </div>
          <h3 className="profile-name">{teacher.firstName} {teacher.lastName}</h3>
          <span className="profile-id">{teacher.employeeId}</span>
          
          <div className="profile-status">
            <span className={`badge badge-${teacher.status === 'active' ? 'success' : 'warning'}`}>
              {teacher.status}
            </span>
          </div>

          <ul className="profile-meta-list">
            <li className="profile-meta-item">
              <span className="profile-meta-label">Position</span>
              <span className="profile-meta-value">{teacher.position}</span>
            </li>
            <li className="profile-meta-item">
              <span className="profile-meta-label">Department</span>
              <span className="profile-meta-value">{teacher.department?.code}</span>
            </li>
            <li className="profile-meta-item">
              <span className="profile-meta-label">Joined</span>
              <span className="profile-meta-value">{new Date(teacher.joiningDate).toLocaleDateString()}</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Detailed Contact and Assigned Schedule info */}
        <div className="profile-main-content">
          <div className="profile-section-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} className="icon-muted" />
              <span>Contact Information</span>
            </h4>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{teacher.firstName} {teacher.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department Assignment</span>
                <span className="info-value">{teacher.department?.name} ({teacher.department?.code})</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email Address</span>
                <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} className="text-muted" />
                  <span>{teacher.email}</span>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone Contact</span>
                <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} className="text-muted" />
                  <span>{teacher.phone || 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="profile-section-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} className="icon-muted" />
              <span>Assigned Teaching Schedule</span>
            </h4>

            <div className="table-wrapper" style={{ margin: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No courses assigned to this faculty member.</td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course._id}>
                        <td className="text-mono" style={{ fontWeight: 600 }}>{course.courseCode}</td>
                        <td>{course.courseName}</td>
                        <td className="text-mono">{course.creditHours}</td>
                        <td className="text-mono">Semester {course.semester}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;
