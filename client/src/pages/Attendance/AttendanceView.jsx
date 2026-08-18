import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import { Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const AttendanceView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.attendance.getMyAttendance();
        setLogs(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve attendance sheets.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Compute Statistics
  const totalClasses = logs.length;
  const presentLogs = logs.filter(l => l.status === 'Present').length;
  const lateLogs = logs.filter(l => l.status === 'Late').length;
  const absentLogs = logs.filter(l => l.status === 'Absent').length;
  
  const attendedCount = presentLogs + lateLogs;
  const attendanceRate = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 100;

  const tableColumns = [
    {
      header: 'Date',
      accessor: 'date',
      className: 'text-mono',
      render: (row, val) => new Date(val).toLocaleDateString(),
    },
    {
      header: 'Course Code',
      accessor: 'course.courseCode',
      className: 'text-mono',
      render: (row, val) => <strong>{val}</strong>,
    },
    {
      header: 'Course Name',
      accessor: 'course.courseName',
    },
    {
      header: 'Credits',
      accessor: 'course.creditHours',
      className: 'text-mono',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row, val) => (
        <span className={`badge badge-${val === 'Present' ? 'success' : val === 'Late' ? 'warning' : 'error'}`}>
          {val}
        </span>
      ),
    },
  ];

  if (loading) {
    return <Skeleton variant="rect" height="400px" />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-desc">
          <h2>My Attendance Logs</h2>
          <p className="page-description">Review your chronological class attendance sheets, ratios, and academic compliance records.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Attendance Compliance Warning banner */}
      {attendanceRate < 75 && (
        <Alert
          type="warning"
          message={`Your attendance is currently ${attendanceRate}%, which is below the mandatory 75% university policy. Further absences may lead to exam restriction.`}
        />
      )}

      {/* Statistics Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Logs Recorded</span>
            <span className="stat-value">{totalClasses}</span>
          </div>
          <div className="stat-icon-box">
            <Calendar size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Classes Attended</span>
            <span className="stat-value text-success">{attendedCount}</span>
          </div>
          <div className="stat-icon-box" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Absences Logged</span>
            <span className="stat-value text-error">{absentLogs}</span>
          </div>
          <div className="stat-icon-box" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
            <XCircle size={20} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Cumulative Ratio</span>
            <span className="stat-value" style={{ color: attendanceRate >= 75 ? 'var(--color-success)' : 'var(--color-error)' }}>{attendanceRate}%</span>
          </div>
          <div className="stat-icon-box" style={{ backgroundColor: attendanceRate >= 75 ? 'var(--color-success-light)' : 'var(--color-warning-light)', color: attendanceRate >= 75 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Raw logs */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <h3 className="dashboard-card-title" style={{ padding: '20px 24px', margin: 0 }}>
          Attendance Logs History
        </h3>
        <Table columns={tableColumns} data={logs} />
      </div>
    </div>
  );
};

export default AttendanceView;
