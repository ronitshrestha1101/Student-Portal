import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { Plus, Edit2, Trash2, Award, ClipboardList, CheckCircle } from 'lucide-react';

const ExamList = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Data States
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    examName: '',
    course: '',
    date: '',
    maxMarks: '100',
    status: 'scheduled',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExamsAndCourses = async () => {
    setLoading(true);
    setError('');
    try {
      let activeCourses = [];
      if (user.role === 'teacher') {
        activeCourses = await api.courses.list({ teacher: profile?._id });
      } else {
        activeCourses = await api.courses.list();
      }
      setCourses(activeCourses);
      
      const examList = await api.exams.list();
      setExams(examList);
      
      if (activeCourses.length > 0 && !formData.course) {
        setFormData(prev => ({ ...prev, course: activeCourses[0]._id }));
      }
    } catch (err) {
      setError('Failed to retrieve exams metadata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsAndCourses();
  }, [user, profile]);

  const openAddEditModal = (exam = null) => {
    setFormError('');
    if (exam) {
      setSelectedExam(exam);
      setFormData({
        examName: exam.examName,
        course: exam.course?._id || exam.course || '',
        date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '',
        maxMarks: String(exam.maxMarks || 100),
        status: exam.status || 'scheduled',
      });
    } else {
      setSelectedExam(null);
      setFormData({
        examName: '',
        course: courses[0]?._id || '',
        date: new Date().toISOString().split('T')[0],
        maxMarks: '100',
        status: 'scheduled',
      });
    }
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (exam) => {
    setSelectedExam(exam);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (selectedExam) {
        await api.exams.update(selectedExam._id, formData);
        setSuccessMsg('Examination details updated successfully!');
      } else {
        await api.exams.create(formData);
        setSuccessMsg('New examination schedule recorded successfully!');
      }
      setIsAddEditModalOpen(false);
      fetchExamsAndCourses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Verify exam details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await api.exams.delete(selectedExam._id);
      setSuccessMsg('Examination and associated results deleted.');
      fetchExamsAndCourses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete exam.');
      setLoading(false);
    }
  };

  const handlePublishResults = async (examId) => {
    if (!window.confirm('Publish results? This will enable students to view their grade cards.')) return;
    try {
      await api.exams.publishResults(examId);
      setSuccessMsg('Results published to student portals successfully!');
      fetchExamsAndCourses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not publish results.');
    }
  };

  const tableColumns = [
    {
      header: 'Exam Name',
      accessor: 'examName',
      render: (row, val) => <strong>{val}</strong>,
    },
    {
      header: 'Course Code',
      accessor: 'course.courseCode',
      className: 'text-mono',
    },
    {
      header: 'Subject Title',
      accessor: 'course.courseName',
    },
    {
      header: 'Max Marks',
      accessor: 'maxMarks',
      className: 'text-mono',
    },
    {
      header: 'Date',
      accessor: 'date',
      className: 'text-mono',
      render: (row, val) => new Date(val).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row, val) => (
        <span className={`badge badge-${val === 'published' ? 'success' : val === 'completed' ? 'warning' : 'info'}`}>
          {val}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Only allow grading for exams that are of the teacher's/admin's courses */}
          <button
            onClick={() => navigate(`/exams/${row._id}/grade`)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
            title="Grade Students"
          >
            <ClipboardList size={14} style={{ marginRight: '4px' }} />
            <span>Grade</span>
          </button>
          
          {row.status === 'completed' && (
            <button
              onClick={() => handlePublishResults(row._id)}
              className="btn btn-primary"
              style={{ padding: '4px 8px', fontSize: '0.8rem', backgroundColor: 'var(--color-success)', border: 'none' }}
              title="Publish Grade Sheets"
            >
              <CheckCircle size={14} style={{ marginRight: '4px' }} />
              <span>Publish</span>
            </button>
          )}

          <button
            onClick={() => openAddEditModal(row)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px' }}
            title="Edit Exam"
          >
            <Edit2 size={14} />
          </button>
          
          <button
            onClick={() => openDeleteModal(row)}
            className="btn btn-danger"
            style={{ padding: '4px 8px' }}
            title="Delete Exam"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-desc">
          <h2>Examinations & Grades</h2>
          <p className="page-description">Schedule mid-term or end-term exam sheets, input student marks, and publish transcripts.</p>
        </div>
        <button onClick={() => openAddEditModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Schedule Exam</span>
        </button>
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {error && <Alert type="error" message={error} />}

      <Table columns={tableColumns} data={exams} loading={loading} />

      {/* Add / Edit Exam Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedExam ? 'Edit Exam details' : 'Schedule New Examination'}
        size="md"
      >
        {formError && <Alert type="error" message={formError} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Examination Name *</label>
            <input
              type="text"
              name="examName"
              className="form-input"
              value={formData.examName}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder="e.g. Mid-Term Examination Fall 2026"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Associated Course Subject *</label>
            <select
              name="course"
              className="form-select"
              value={formData.course}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Course</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>
                  {c.courseName} ({c.courseCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Exam Date *</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Max Marks *</label>
              <input
                type="number"
                name="maxMarks"
                className="form-input"
                value={formData.maxMarks}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed (Awaiting Grading)</option>
              <option value="published">Published (Grades Visible to Students)</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddEditModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Exam'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Exam Deletion"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete the exam schedule for{' '}
            <strong>
              {selectedExam?.examName}
            </strong>
            ? This action cannot be undone and will delete all entered student grades for this exam.
          </p>
          <div className="form-actions" style={{ marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Yes, Delete Exam
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamList;
