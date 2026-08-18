import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Calendar,
  Award,
  Megaphone,
  Clock,
  CheckCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import Alert from '../components/Alert';
import Skeleton from '../components/Skeleton';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        if (user.role === 'admin') {
          const stats = await api.admin.getStats();
          const announcements = await api.announcements.list();
          setData({ stats, announcements });
        } else if (user.role === 'teacher') {
          // Fetch teacher courses and announcements
          if (profile) {
            const courses = await api.courses.list({ teacher: profile._id });
            const announcements = await api.announcements.list();
            const exams = await api.exams.list();
            setData({ courses, announcements, exams });
          }
        } else if (user.role === 'student') {
          // Fetch student attendance, results, announcements
          if (profile) {
            const announcements = await api.announcements.list();
            const results = await api.exams.getMyResults();
            const attendance = await api.attendance.getMyAttendance();
            
            // Group attendance by course code
            const attendanceSummary = {};
            attendance.forEach(rec => {
              const code = rec.course.courseCode;
              if (!attendanceSummary[code]) {
                attendanceSummary[code] = {
                  name: rec.course.courseName,
                  present: 0,
                  total: 0
                };
              }
              attendanceSummary[code].total += 1;
              if (rec.status === 'Present' || rec.status === 'Late') {
                attendanceSummary[code].present += 1;
              }
            });

            setData({ announcements, results, attendanceSummary: Object.entries(attendanceSummary) });
          }
        }
      } catch (err) {
        setError('Failed to fetch dashboard intelligence: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton variant="rect" height="40px" width="300px" />
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height="100px" />
          ))}
        </div>
        <div className="dashboard-split-grid">
          <Skeleton variant="rect" height="350px" />
          <Skeleton variant="rect" height="350px" />
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD LAYOUT
  // ----------------------------------------------------
  if (user.role === 'admin') {
    const { stats, announcements } = data;
    return (
      <div>
        {/* Welcome Section */}
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Institutional Command Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back, administrator. Here is a high-level summary of campus activity.</p>
        </div>

        {/* Statistics Cards Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Total Enrollment</span>
              <span className="stat-value">{stats.counts.totalStudents}</span>
            </div>
            <div className="stat-icon-box">
              <Users size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Active Faculty</span>
              <span className="stat-value">{stats.counts.totalTeachers}</span>
            </div>
            <div className="stat-icon-box">
              <GraduationCap size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Active Departments</span>
              <span className="stat-value">{stats.counts.totalDepartments}</span>
            </div>
            <div className="stat-icon-box">
              <School size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-label">Daily Attendance Rate</span>
              <span className="stat-value">{stats.attendanceStats.rate}%</span>
            </div>
            <div className="stat-icon-box" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        {/* Split Grid: Main Content & Sidebar */}
        <div className="dashboard-split-grid">
          {/* Main Column */}
          <div>
            {/* Recent Student Admissions Table */}
            <div className="dashboard-card" style={{ padding: '24px 0' }}>
              <h3 className="dashboard-card-title" style={{ padding: '0 24px 12px 24px', margin: 0 }}>
                <span>Recent Student Admissions</span>
                <Link to="/students" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>View All</Link>
              </h3>
              <div className="table-scroll-container">
                <table className="admin-table" style={{ border: 'none', boxShadow: 'none' }}>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Full Name</th>
                      <th>Program</th>
                      <th>Department</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentAdmissions.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent admissions recorded.</td>
                      </tr>
                    ) : (
                      stats.recentAdmissions.map((s) => (
                        <tr key={s._id}>
                          <td className="text-mono" style={{ fontWeight: 600 }}>{s.studentId}</td>
                          <td>{s.firstName} {s.lastName}</td>
                          <td>{s.program}</td>
                          <td>{s.department?.code}</td>
                          <td>
                            <span className={`badge badge-${s.status === 'active' ? 'success' : 'warning'}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Examinations */}
            <div className="dashboard-card" style={{ padding: '24px 0' }}>
              <h3 className="dashboard-card-title" style={{ padding: '0 24px 12px 24px', margin: 0 }}>
                <span>Upcoming Examinations</span>
                <Link to="/exams" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Manage Exams</Link>
              </h3>
              <div className="table-scroll-container">
                <table className="admin-table" style={{ border: 'none', boxShadow: 'none' }}>
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Max Marks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.upcomingExams.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No upcoming examinations scheduled.</td>
                      </tr>
                    ) : (
                      stats.upcomingExams.map((exam) => (
                        <tr key={exam._id}>
                          <td style={{ fontWeight: 600 }}>{exam.examName}</td>
                          <td>{exam.course?.courseName} ({exam.course?.courseCode})</td>
                          <td className="text-mono">{new Date(exam.date).toLocaleDateString()}</td>
                          <td>{exam.maxMarks}</td>
                          <td>
                            <span className="badge badge-info">{exam.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div>
            {/* Announcements */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Megaphone size={18} className="icon-muted" />
                  <span>Announcements</span>
                </div>
                <Link to="/announcements" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Manage</Link>
              </h3>
              <ul className="activity-list">
                {announcements.slice(0, 4).map((ann) => (
                  <li key={ann._id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ann.title}</span>
                      <span style={{ fontSize: '0.8rem', marginTop: '2px' }}>{ann.content.slice(0, 80)}...</span>
                      <span className="activity-time" style={{ marginTop: '4px' }}>
                        {new Date(ann.createdAt).toLocaleDateString()} • To {ann.targetRole}
                      </span>
                    </div>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No announcements published.</p>
                )}
              </ul>
            </div>

            {/* Attendance Breakdowns */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} className="icon-muted" />
                  <span>Attendance Distribution</span>
                </div>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 550 }}>Present Logs</span>
                  <span className="text-mono" style={{ fontWeight: 600 }}>{stats.attendanceStats.present}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.attendanceStats.total > 0 ? (stats.attendanceStats.present / stats.attendanceStats.total) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--color-success)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontWeight: 550 }}>Late Logs</span>
                  <span className="text-mono" style={{ fontWeight: 600 }}>{stats.attendanceStats.late}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.attendanceStats.total > 0 ? (stats.attendanceStats.late / stats.attendanceStats.total) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--color-warning)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontWeight: 550 }}>Absent Logs</span>
                  <span className="text-mono" style={{ fontWeight: 600 }}>{stats.attendanceStats.absent}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.attendanceStats.total > 0 ? (stats.attendanceStats.absent / stats.attendanceStats.total) * 100 : 0}%`, height: '100%', backgroundColor: 'var(--color-error)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // TEACHER DASHBOARD LAYOUT
  // ----------------------------------------------------
  if (user.role === 'teacher') {
    const { courses, announcements, exams } = data;
    return (
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Faculty Portal Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome, {profile?.firstName} {profile?.lastName}. You are logged in as {profile?.position}.</p>
        </div>

        <div className="dashboard-split-grid">
          {/* Main Column */}
          <div>
            {/* Courses assigned */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} className="icon-muted" />
                  <span>My Assigned Courses</span>
                </div>
              </h3>
              
              {courses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>You are not currently assigned to teach any courses.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {courses.map(course => (
                    <div key={course._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)' }}>
                      <div>
                        <h4 style={{ fontSize: '0.925rem', fontWeight: 700 }}>{course.courseName}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          <span className="text-mono" style={{ fontWeight: 600 }}>{course.courseCode}</span> • Semester {course.semester} • Credits: {course.creditHours}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to="/attendance" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          Attendance
                        </Link>
                        <Link to="/exams" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                          Enter Grades
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming examinations */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <span>Active Examinations & Schedule</span>
                <Link to="/exams" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>New Exam</Link>
              </h3>
              <div className="table-scroll-container">
                <table className="admin-table" style={{ border: 'none', boxShadow: 'none' }}>
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Max Marks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No examinations scheduled.</td>
                      </tr>
                    ) : (
                      exams.map((exam) => (
                        <tr key={exam._id}>
                          <td style={{ fontWeight: 600 }}>{exam.examName}</td>
                          <td>{exam.course?.courseCode}</td>
                          <td className="text-mono">{new Date(exam.date).toLocaleDateString()}</td>
                          <td>{exam.maxMarks}</td>
                          <td>
                            <span className={`badge badge-${exam.status === 'published' ? 'success' : 'info'}`}>{exam.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            {/* Announcements */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Megaphone size={18} className="icon-muted" />
                  <span>Faculty Announcements</span>
                </div>
              </h3>
              <ul className="activity-list">
                {announcements.map((ann) => (
                  <li key={ann._id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ann.title}</span>
                      <span style={{ fontSize: '0.8rem', marginTop: '2px' }}>{ann.content}</span>
                      <span className="activity-time" style={{ marginTop: '4px' }}>
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No announcements matching your profile.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STUDENT PORTAL DASHBOARD
  // ----------------------------------------------------
  if (user.role === 'student') {
    const { announcements, results, attendanceSummary } = data;
    return (
      <div>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Student Portal Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome, {profile?.firstName} {profile?.lastName}. You are registered in the {profile?.program} program.</p>
        </div>

        <div className="dashboard-split-grid">
          {/* Main Column */}
          <div>
            {/* Registered Courses */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} className="icon-muted" />
                  <span>My Enrolled Courses</span>
                </div>
              </h3>

              {profile?.courses?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>You are not currently registered in any academic courses.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {profile?.courses?.map((course) => (
                    <div key={course._id} style={{ display: 'flex', flexDirection: 'column', padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)' }}>
                      <span className="text-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{course.courseCode}</span>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>{course.courseName}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Credit Hours: {course.creditHours} • Semester: {course.semester}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Academic Results */}
            <div className="dashboard-card" style={{ padding: '24px 0' }}>
              <h3 className="dashboard-card-title" style={{ padding: '0 24px 12px 24px', margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} className="icon-muted" />
                  <span>Recent Exam Grades</span>
                </div>
                <Link to="/exams/my-results" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Transcript</Link>
              </h3>
              <div className="table-scroll-container">
                <table className="admin-table" style={{ border: 'none', boxShadow: 'none' }}>
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Course</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>GPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No grade cards published yet.</td>
                      </tr>
                    ) : (
                      results.slice(0, 3).map((resRecord) => (
                        <tr key={resRecord._id}>
                          <td style={{ fontWeight: 600 }}>{resRecord.examination?.examName}</td>
                          <td>{resRecord.course?.courseName}</td>
                          <td className="text-mono">{resRecord.marksObtained} / {resRecord.examination?.maxMarks}</td>
                          <td>
                            <span className={`badge badge-${resRecord.grade.startsWith('F') ? 'error' : 'success'}`}>{resRecord.grade}</span>
                          </td>
                          <td className="text-mono" style={{ fontWeight: 600 }}>{resRecord.gpa.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            {/* Announcements */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Megaphone size={18} className="icon-muted" />
                  <span>Targeted Announcements</span>
                </div>
              </h3>
              <ul className="activity-list">
                {announcements.map((ann) => (
                  <li key={ann._id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ann.title}</span>
                      <span style={{ fontSize: '0.8rem', marginTop: '2px' }}>{ann.content}</span>
                      <span className="activity-time" style={{ marginTop: '4px' }}>
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No new announcements matching your profile.</p>
                )}
              </ul>
            </div>

            {/* Attendance Summaries */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} className="icon-muted" />
                  <span>Attendance Ratios</span>
                </div>
                <Link to="/attendance/my" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Full Logs</Link>
              </h3>
              
              {attendanceSummary.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>No attendance marks logged.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                  {attendanceSummary.map(([code, summary]) => {
                    const percentage = summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 100;
                    return (
                      <div key={code} style={{ fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600 }}>{code} - {summary.name}</span>
                          <span className="text-mono" style={{ fontWeight: 700 }}>{percentage}%</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: percentage >= 75 ? 'var(--color-success)' : 'var(--color-error)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
