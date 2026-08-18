import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import { CalendarCheck, Save, Users, Calendar } from 'lucide-react';

const AttendanceMark = () => {
  const { user, profile } = useAuth();
  
  // Selection States
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Roster & Loading States
  const [roster, setRoster] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form selections on mount
  useEffect(() => {
    const loadCourses = async () => {
      setLoadingMetadata(true);
      setError('');
      try {
        let result = [];
        if (user.role === 'teacher') {
          // Only show courses taught by this teacher
          result = await api.courses.list({ teacher: profile?._id });
        } else {
          // Admin can manage attendance for all active courses
          result = await api.courses.list();
        }
        setCourses(result);
        if (result.length > 0) {
          setSelectedCourse(result[0]._id);
        }
      } catch (err) {
        setError('Failed to retrieve courses list: ' + err.message);
      } finally {
        setLoadingMetadata(false);
      }
    };
    loadCourses();
  }, [user, profile]);

  const handleLoadRoster = async () => {
    if (!selectedCourse || !selectedDate) {
      setError('Please select a course and valid date.');
      return;
    }
    setLoadingRoster(true);
    setError('');
    setSuccess('');
    try {
      const data = await api.attendance.getCourseRoster(selectedCourse, selectedDate);
      setRoster(data);
    } catch (err) {
      setError(err.message || 'Could not fetch class roster.');
      setRoster([]);
    } finally {
      setLoadingRoster(false);
    }
  };

  // Auto load roster when course or date selection changes
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      handleLoadRoster();
    }
  }, [selectedCourse, selectedDate]);

  // Toggle status for a student in local state
  const handleStatusChange = (studentId, status) => {
    setRoster(prev =>
      prev.map(row => (row.studentId === studentId ? { ...row, status } : row))
    );
  };

  // Mark All students present/absent helper
  const handleMarkAll = (status) => {
    setRoster(prev => prev.map(row => ({ ...row, status })));
  };

  const handleSaveAttendance = async () => {
    const unmarked = roster.filter(row => !row.status);
    if (unmarked.length > 0) {
      if (!window.confirm(`There are ${unmarked.length} students unmarked. Unmarked entries will not be saved. Proceed?`)) {
        return;
      }
    }

    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const recordsToSave = roster
        .filter(row => !!row.status)
        .map(row => ({
          studentId: row.studentId,
          status: row.status,
        }));

      await api.attendance.saveBulk(selectedCourse, selectedDate, recordsToSave);
      setSuccess('Attendance logs saved successfully for this date.');
      handleLoadRoster();
    } catch (err) {
      setError(err.message || 'Failed to save attendance logs.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingMetadata) {
    return <Skeleton variant="rect" height="300px" />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-desc">
          <h2>Class Attendance</h2>
          <p className="page-description">Record daily academic rosters, mark present/absent statistics, and save logs.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Course Selection Form controls */}
      <div className="filter-bar" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '16px', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Academic Subject / Course *</label>
          <select
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.length === 0 ? (
              <option value="">No courses assigned</option>
            ) : (
              courses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.courseName} ({c.courseCode}) - Sem {c.semester}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Roster Date *</label>
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <button onClick={handleLoadRoster} className="btn btn-secondary" style={{ height: '42px' }}>
          Refresh
        </button>
      </div>

      {/* Roster Sheet */}
      {selectedCourse && (
        <div className="dashboard-card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} className="icon-muted" />
              <span>Roster Registry ({roster.length} students)</span>
            </h3>
            {roster.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleMarkAll('Present')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Mark All Present
                </button>
                <button onClick={() => handleMarkAll('Absent')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Mark All Absent
                </button>
              </div>
            )}
          </div>

          {loadingRoster ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rect" height="50px" />
              ))}
            </div>
          ) : roster.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0', fontSize: '0.9rem' }}>
              No students enrolled in this course are currently active.
            </p>
          ) : (
            <div className="attendance-grid">
              {roster.map((row) => (
                <div key={row.studentId} className="attendance-row">
                  <div className="student-info">
                    <span className="student-name">{row.name}</span>
                    <span className="student-uid">{row.studentUid}</span>
                  </div>

                  <div className="attendance-actions">
                    <button
                      onClick={() => handleStatusChange(row.studentId, 'Present')}
                      className={`btn-radio btn-radio-present ${row.status === 'Present' ? 'active' : ''}`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(row.studentId, 'Late')}
                      className={`btn-radio btn-radio-late ${row.status === 'Late' ? 'active' : ''}`}
                    >
                      Late
                    </button>
                    <button
                      onClick={() => handleStatusChange(row.studentId, 'Absent')}
                      className={`btn-radio btn-radio-absent ${row.status === 'Absent' ? 'active' : ''}`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={handleSaveAttendance} className="btn btn-primary" disabled={isSaving}>
                  <Save size={16} />
                  <span>{isSaving ? 'Saving Roster...' : 'Save Attendance Logs'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceMark;
