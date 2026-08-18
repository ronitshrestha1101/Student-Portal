import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import { ArrowLeft, School, GraduationCap, BookOpen, Users, User } from 'lucide-react';

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deptData, setDeptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeptDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.departments.get(id);
        setDeptData(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve department profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchDeptDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton variant="rect" height="40px" width="200px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <Skeleton variant="rect" height="300px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Skeleton variant="rect" height="200px" />
            <Skeleton variant="rect" height="200px" />
          </div>
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

  const { department, teachers, courses, studentCount } = deptData;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} />
        <span>Back to Departments</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }} className="profile-detail-layout">
        {/* Left Column: Department Info Summary */}
        <div className="profile-sidebar">
          <div className="profile-avatar-large" style={{ backgroundColor: 'var(--color-primary-light)', border: '2px solid var(--color-primary)' }}>
            <School size={48} className="logo-icon" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 className="profile-name" style={{ textAlign: 'center' }}>{department.name}</h3>
          <span className="profile-id">{department.code}</span>
          
          <div className="profile-status">
            <span className={`badge badge-${department.status === 'active' ? 'success' : 'warning'}`}>
              {department.status}
            </span>
          </div>

          <ul className="profile-meta-list">
            <li className="profile-meta-item">
              <span className="profile-meta-label">Total Faculty</span>
              <span className="profile-meta-value">{teachers.length}</span>
            </li>
            <li className="profile-meta-item">
              <span className="profile-meta-label">Total Courses</span>
              <span className="profile-meta-value">{courses.length}</span>
            </li>
            <li className="profile-meta-item">
              <span className="profile-meta-label">Students Count</span>
              <span className="profile-meta-value">{studentCount}</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Faculty & Courses Details */}
        <div className="profile-main-content">
          {/* Department Head (HOD) Detail */}
          <div className="profile-section-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} className="icon-muted" />
              <span>Head of Department (HOD)</span>
            </h4>
            {department.headOfDepartment ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="avatar-placeholder" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>
                  {department.headOfDepartment.firstName.charAt(0)}{department.headOfDepartment.lastName.charAt(0)}
                </div>
                <div>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    {department.headOfDepartment.firstName} {department.headOfDepartment.lastName}
                  </h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Employee ID: {department.headOfDepartment.employeeId} • Email: {department.headOfDepartment.email}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No dean/HOD currently assigned to lead this department.</p>
            )}
          </div>

          {/* Department Faculty List */}
          <div className="profile-section-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} className="icon-muted" />
              <span>Department Faculty Directory</span>
            </h4>
            <div className="table-wrapper" style={{ margin: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No faculty members assigned to this department.</td>
                    </tr>
                  ) : (
                    teachers.map((t) => (
                      <tr key={t._id}>
                        <td className="text-mono" style={{ fontWeight: 600 }}>{t.employeeId}</td>
                        <td>{t.firstName} {t.lastName}</td>
                        <td>{t.position}</td>
                        <td>
                          <span className={`badge badge-${t.status === 'active' ? 'success' : 'warning'}`}>{t.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Curriculum Courses */}
          <div className="profile-section-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} className="icon-muted" />
              <span>Department Curriculum Courses</span>
            </h4>
            <div className="table-wrapper" style={{ margin: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Assigned Faculty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No courses defined in this department curriculum.</td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course._id}>
                        <td className="text-mono" style={{ fontWeight: 600 }}>{course.courseCode}</td>
                        <td>{course.courseName}</td>
                        <td className="text-mono">{course.creditHours}</td>
                        <td>
                          {course.assignedTeacher ? `${course.assignedTeacher.firstName} ${course.assignedTeacher.lastName}` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                        </td>
                        <td>
                          <span className={`badge badge-${course.status === 'active' ? 'success' : 'warning'}`}>{course.status}</span>
                        </td>
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

export default DepartmentDetails;
