import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import {
  ArrowLeft,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  CalendarDays,
  FileText,
  Trash2,
  Plus,
  ExternalLink,
  Award
} from 'lucide-react';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Profile data state
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // profile, attendance, results, documents

  // Upload Document Modal State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docFormData, setDocFormData] = useState({ name: '', fileUrl: '' });
  const [docError, setDocError] = useState('');
  const [isDocSubmitting, setIsDocSubmitting] = useState(false);

  const fetchStudentProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.students.get(id);
      setProfileData(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve student profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const handleDocInputChange = (e) => {
    const { name, value } = e.target;
    setDocFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docFormData.name || !docFormData.fileUrl) {
      setDocError('Please fill in document name and reference URL.');
      return;
    }
    setDocError('');
    setIsDocSubmitting(true);

    try {
      await api.students.uploadDoc(id, docFormData);
      setIsDocModalOpen(false);
      setDocFormData({ name: '', fileUrl: '' });
      fetchStudentProfile();
    } catch (err) {
      setDocError(err.message || 'Failed to upload document reference.');
    } finally {
      setIsDocSubmitting(false);
    }
  };

  const handleDocDelete = async (docId) => {
    if (!window.confirm('Delete this document from student records?')) return;
    try {
      await api.students.deleteDoc(id, docId);
      fetchStudentProfile();
    } catch (err) {
      alert(err.message || 'Could not delete document.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton variant="rect" height="40px" width="200px" />
        <div className="profile-detail-layout">
          <Skeleton variant="rect" height="450px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Skeleton variant="rect" height="40px" />
            <Skeleton variant="rect" height="350px" />
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

  const { student, results, cumulativeGPA, attendanceSummary, attendanceDetail } = profileData;

  return (
    <div>
      {/* Back navigation button */}
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} />
        <span>Back to Registry</span>
      </button>

      <div className="profile-detail-layout">
        {/* Left column: Student Profile brief card */}
        <div className="profile-sidebar">
          <div className="profile-avatar-large">
            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
          </div>
          <h3 className="profile-name">{student.firstName} {student.lastName}</h3>
          <span className="profile-id">{student.studentId}</span>
          
          <div className="profile-status">
            <span className={`badge badge-${student.status === 'active' ? 'success' : student.status === 'suspended' ? 'error' : 'warning'}`}>
              {student.status}
            </span>
          </div>

          <ul className="profile-meta-list">
            <li className="profile-meta-item">
              <span className="profile-meta-label">Program</span>
              <span className="profile-meta-value">{student.program}</span>
            </li>
            <li className="profile-meta-item">
              <span className="profile-meta-label">Department</span>
              <span className="profile-meta-value">{student.department?.code}</span>
            </li>
            <li className="profile-meta-item">
              <span className="profile-meta-label">Semester</span>
              <span className="profile-meta-value">Semester {student.semester}</span>
            </li>
            <li className="profile-meta-item">
              <span className="profile-meta-label">Cum. GPA</span>
              <span className="profile-meta-value text-mono">{cumulativeGPA}</span>
            </li>
          </ul>
        </div>

        {/* Right column: Tabs & Detailed Data panels */}
        <div className="profile-main-content">
          {/* Tab Navigation links */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'profile' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Basic Info
            </button>
            <button
              className={`profile-tab ${activeTab === 'attendance' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              Attendance
            </button>
            <button
              className={`profile-tab ${activeTab === 'results' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Grades & Results
            </button>
            <button
              className={`profile-tab ${activeTab === 'documents' ? 'profile-tab-active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents ({student.documents?.length || 0})
            </button>
          </div>

          {/* TAB 1: BASIC INFORMATION PROFILE CARD */}
          {activeTab === 'profile' && (
            <div className="profile-section-card">
              <h4 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} className="icon-muted" />
                <span>Personal & Academic Registry</span>
              </h4>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{student.firstName} {student.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Enrollment Date</span>
                  <span className="info-value">{new Date(student.enrollmentDate).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} className="text-muted" />
                    <span>{student.email}</span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Birth</span>
                  <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} className="text-muted" />
                    <span>{new Date(student.dob).toLocaleDateString()}</span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} className="text-muted" />
                    <span>{student.phone || 'N/A'}</span>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender</span>
                  <span className="info-value">{student.gender}</span>
                </div>
                <div className="info-item" style={{ gridColumn: 'span 2' }}>
                  <span className="info-label">Residential Address</span>
                  <span className="info-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <MapPin size={14} className="text-muted" style={{ marginTop: '3px' }} />
                    <span>{student.address || 'No address registered.'}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="profile-section-card">
              <h4 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} className="icon-muted" />
                <span>Attendance Log Summaries</span>
              </h4>

              {attendanceSummary.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No attendance sheets recorded for this student.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {attendanceSummary.map((sum) => {
                      const rate = sum.total > 0 ? Math.round((sum.present / sum.total) * 100) : 100;
                      return (
                        <div key={sum.courseCode} style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-primary)' }}>
                          <span className="text-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{sum.courseCode}</span>
                          <h5 style={{ fontSize: '0.875rem', margin: '2px 0 10px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sum.courseName}</h5>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            <span>Attended: {sum.present}/{sum.total}</span>
                            <span style={{ fontWeight: 700 }}>{rate}%</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${rate}%`, height: '100%', backgroundColor: rate >= 75 ? 'var(--color-success)' : 'var(--color-error)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <h5 style={{ fontSize: '0.9rem', marginTop: '10px' }}>Recent Roster Activity</h5>
                  <div className="table-wrapper" style={{ margin: 0 }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Course</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceDetail.slice(0, 10).map((record) => (
                          <tr key={record._id}>
                            <td className="text-mono">{new Date(record.date).toLocaleDateString()}</td>
                            <td>{record.course?.courseName} ({record.course?.courseCode})</td>
                            <td>
                              <span className={`badge badge-${record.status === 'Present' ? 'success' : record.status === 'Late' ? 'warning' : 'error'}`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GRADES & RESULTS */}
          {activeTab === 'results' && (
            <div className="profile-section-card">
              <h4 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} className="icon-muted" />
                <span>Published Examinations Grades</span>
              </h4>

              {results.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No academic results published yet.</p>
              ) : (
                <div>
                  <div className="table-wrapper" style={{ margin: 0 }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Exam Name</th>
                          <th>Course</th>
                          <th>Credits</th>
                          <th>Marks Obtained</th>
                          <th>Grade</th>
                          <th>GPA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((resRecord) => (
                          <tr key={resRecord._id}>
                            <td style={{ fontWeight: 600 }}>{resRecord.examination?.examName}</td>
                            <td>{resRecord.course?.courseName} ({resRecord.course?.courseCode})</td>
                            <td className="text-mono">{resRecord.course?.creditHours}</td>
                            <td className="text-mono">{resRecord.marksObtained} / {resRecord.examination?.maxMarks}</td>
                            <td>
                              <span className={`badge badge-${resRecord.grade.startsWith('F') ? 'error' : 'success'}`}>
                                {resRecord.grade}
                              </span>
                            </td>
                            <td className="text-mono" style={{ fontWeight: 600 }}>{resRecord.gpa.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px 24px', border: '1px solid var(--border-light)', borderRadius: 'var(--border-radius)', display: 'flex', gap: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Cumulative GPA</span>
                        <span className="text-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cumulativeGPA}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUPPORTING CREDENTIALS DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="profile-section-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} className="icon-muted" />
                  <span>Academic & Identity Documents</span>
                </h4>
                <button onClick={() => setIsDocModalOpen(true)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <Plus size={14} />
                  <span>Add Document</span>
                </button>
              </div>

              {student.documents?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No supporting files uploaded yet.</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>Upload certificates, ID documents, or transcripts.</p>
                </div>
              ) : (
                <div className="documents-grid">
                  {student.documents.map((doc) => (
                    <div key={doc._id} className="document-item-card">
                      <div className="document-info">
                        <FileText size={24} className="text-muted" />
                        <div className="doc-text">
                          <span className="doc-name" title={doc.name}>{doc.name}</span>
                          <span className="doc-date">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '6px' }}
                          title="Open Document URL"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => handleDocDelete(doc._id)}
                          className="btn btn-danger"
                          style={{ padding: '6px' }}
                          title="Delete File"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Attach Student Document"
        size="sm"
      >
        {docError && <Alert type="error" message={docError} />}
        <form onSubmit={handleDocSubmit}>
          <div className="form-group">
            <label className="form-label">Document Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. High School Transcript"
              value={docFormData.name}
              onChange={handleDocInputChange}
              required
              disabled={isDocSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Document File URL *</label>
            <input
              type="url"
              name="fileUrl"
              className="form-input"
              placeholder="https://example.com/docs/file.pdf"
              value={docFormData.fileUrl}
              onChange={handleDocInputChange}
              required
              disabled={isDocSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDocModalOpen(false)}
              disabled={isDocSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isDocSubmitting}>
              {isDocSubmitting ? 'Saving...' : 'Add Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDetails;
