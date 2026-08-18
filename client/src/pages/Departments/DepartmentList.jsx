import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { Plus, Edit2, Trash2, Eye, School } from 'lucide-react';

const DepartmentList = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.departments.list();
      setDepartments(result);
    } catch (err) {
      setError(err.message || 'Failed to retrieve departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    const fetchTeachers = async () => {
      try {
        const t = await api.teachers.list();
        setTeachers(t);
      } catch (err) {
        console.error('Failed to load faculty:', err);
      }
    };
    fetchTeachers();
  }, []);

  const openAddEditModal = (dept = null) => {
    setFormError('');
    if (dept) {
      setSelectedDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        headOfDepartment: dept.headOfDepartment?._id || dept.headOfDepartment || '',
        status: dept.status || 'active',
      });
    } else {
      setSelectedDept(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        headOfDepartment: '',
        status: 'active',
      });
    }
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (dept) => {
    setSelectedDept(dept);
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
      if (selectedDept) {
        await api.departments.update(selectedDept._id, formData);
        setSuccessMsg('Department updated successfully!');
      } else {
        await api.departments.create(formData);
        setSuccessMsg('Department created successfully!');
      }
      setIsAddEditModalOpen(false);
      fetchDepartments();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Verify department details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await api.departments.delete(selectedDept._id);
      setSuccessMsg('Department removed successfully.');
      fetchDepartments();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete department.');
      setLoading(false);
    }
  };

  const tableColumns = [
    {
      header: 'Code',
      accessor: 'code',
      className: 'text-mono',
      render: (row, val) => <strong>{val}</strong>,
    },
    {
      header: 'Department Name',
      accessor: 'name',
    },
    {
      header: 'Head of Dept (HOD)',
      accessor: 'headOfDepartment',
      render: (row) => row.headOfDepartment ? `${row.headOfDepartment.firstName} ${row.headOfDepartment.lastName}` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row, val) => (
        <span className={`badge badge-${val === 'active' ? 'success' : 'warning'}`}>
          {val}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate(`/departments/${row._id}`)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px' }}
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => openAddEditModal(row)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px' }}
            title="Edit Details"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="btn btn-danger"
            style={{ padding: '4px 8px' }}
            title="Delete Record"
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
          <h2>Academic Departments</h2>
          <p className="page-description">Create and manage departments, assign faculty deans, and view curriculum statistics.</p>
        </div>
        <button onClick={() => openAddEditModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Create Department</span>
        </button>
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {error && <Alert type="error" message={error} />}

      <Table columns={tableColumns} data={departments} loading={loading} />

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedDept ? 'Edit Department Details' : 'Create New Department'}
        size="md"
      >
        {formError && <Alert type="error" message={formError} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Department Code * (Uppercase, e.g. CSE)</label>
            <input
              type="text"
              name="code"
              className="form-input"
              value={formData.code}
              onChange={handleInputChange}
              required
              disabled={isSubmitting || !!selectedDept}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Head of Department (HOD)</label>
            <select
              name="headOfDepartment"
              className="form-select"
              value={formData.headOfDepartment}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">No HOD Assigned</option>
              {teachers
                .filter(t => !selectedDept || t.department?._id === selectedDept._id)
                .map(t => (
                  <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.employeeId})</option>
                ))}
            </select>
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isSubmitting}
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
              {isSubmitting ? 'Saving...' : 'Save Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Department Deletion"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete the department{' '}
            <strong>
              {selectedDept?.name} ({selectedDept?.code})
            </strong>
            ? This action cannot be undone and will fail if there are active student or faculty accounts linked to it.
          </p>
          <div className="form-actions" style={{ marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Yes, Delete Department
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentList;
