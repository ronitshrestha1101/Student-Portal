import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import Skeleton from '../../components/Skeleton';
import { Plus, Edit2, Trash2, Megaphone, Calendar, Send } from 'lucide-react';

const AnnouncementList = () => {
  const { user } = useAuth();
  
  // Data States
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'all',
    targetDepartment: '',
    targetSemester: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load departments metadata (only admin needs it)
  useEffect(() => {
    if (user.role === 'admin') {
      const fetchDepts = async () => {
        try {
          const depts = await api.departments.list();
          setDepartments(depts);
        } catch (err) {
          console.error(err);
        }
      };
      fetchDepts();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      let data = [];
      if (user.role === 'admin') {
        data = await api.announcements.listAdmin();
      } else {
        data = await api.announcements.list();
      }
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  const openAddEditModal = (ann = null) => {
    setFormError('');
    if (ann) {
      setSelectedAnn(ann);
      setFormData({
        title: ann.title,
        content: ann.content,
        targetRole: ann.targetRole || 'all',
        targetDepartment: ann.targetDepartment?._id || ann.targetDepartment || '',
        targetSemester: ann.targetSemester ? String(ann.targetSemester) : '',
      });
    } else {
      setSelectedAnn(null);
      setFormData({
        title: '',
        content: '',
        targetRole: 'all',
        targetDepartment: '',
        targetSemester: '',
      });
    }
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (ann) => {
    setSelectedAnn(ann);
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
      if (selectedAnn) {
        await api.announcements.update(selectedAnn._id, formData);
        setSuccessMsg('Announcement modified successfully.');
      } else {
        await api.announcements.create(formData);
        setSuccessMsg('Announcement published successfully.');
      }
      setIsAddEditModalOpen(false);
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Verify announcement fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await api.announcements.delete(selectedAnn._id);
      setSuccessMsg('Announcement removed from boards.');
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete announcement.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton variant="rect" height="40px" width="300px" />
        <Skeleton variant="rect" height="150px" />
        <Skeleton variant="rect" height="150px" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-desc">
          <h2>Announcements Board</h2>
          <p className="page-description">University notices, alerts, faculty updates, and department circulars.</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={() => openAddEditModal()} className="btn btn-primary">
            <Plus size={16} />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {error && <Alert type="error" message={error} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--bg-secondary)' }}>
            <Megaphone size={36} className="text-muted" style={{ marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No announcements are posted on the board.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id} className="announcement-card">
              <div className="announcement-card-header">
                <div>
                  <h3 className="announcement-title" style={{ fontWeight: 700 }}>{ann.title}</h3>
                  <div className="announcement-metadata">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Posted by {ann.createdBy?.role || 'Admin'}</span>
                  </div>
                </div>
                
                {user.role === 'admin' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openAddEditModal(ann)}
                      className="btn btn-secondary"
                      style={{ padding: '6px' }}
                      title="Edit Notice"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(ann)}
                      className="btn btn-danger"
                      style={{ padding: '6px' }}
                      title="Delete Notice"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="announcement-content">
                <p style={{ whiteSpace: 'pre-wrap' }}>{ann.content}</p>
              </div>

              {/* Show targeting details to admin */}
              {user.role === 'admin' && (
                <div className="announcement-badges" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <span className="badge badge-info">Audience: {ann.targetRole}</span>
                  {ann.targetDepartment && (
                    <span className="badge badge-success">Dept: {ann.targetDepartment.code}</span>
                  )}
                  {ann.targetSemester && (
                    <span className="badge badge-warning">Sem: {ann.targetSemester}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedAnn ? 'Edit Published Notice' : 'Publish New Notice'}
        size="md"
      >
        {formError && <Alert type="error" message={formError} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Notice Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder="e.g. End Semester Exam Registration Dates"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Audience *</label>
              <select
                name="targetRole"
                className="form-select"
                value={formData.targetRole}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="all">Everyone</option>
                <option value="student">Students Only</option>
                <option value="teacher">Faculty Only</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Department (Optional)</label>
              <select
                name="targetDepartment"
                className="form-select"
                value={formData.targetDepartment}
                onChange={handleInputChange}
                disabled={isSubmitting || formData.targetRole === 'teacher'}
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Semester (Optional, Students Only)</label>
            <select
              name="targetSemester"
              className="form-select"
              value={formData.targetSemester}
              onChange={handleInputChange}
              disabled={isSubmitting || formData.targetRole !== 'student'}
            >
              <option value="">All Semesters</option>
              {Array.from({ length: 8 }).map((_, i) => (
                <option key={i+1} value={i+1}>Semester {i+1}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notice Content *</label>
            <textarea
              name="content"
              className="form-textarea"
              value={formData.content}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder="Type your announcement contents here..."
              style={{ minHeight: '150px' }}
            />
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
              <Send size={14} />
              <span>{isSubmitting ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Announcement Deletion"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete this announcement? It will be removed from all student and teacher dashboards.
          </p>
          <div className="form-actions" style={{ marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Yes, Delete Notice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnnouncementList;
