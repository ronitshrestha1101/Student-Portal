import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { Plus, Search, Edit2, Trash2, Eye, Calendar, BookOpen, GraduationCap } from 'lucide-react';

const TeacherList = () => {
  const navigate = useNavigate();

  // Data States
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & Search
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    joiningDate: '',
    status: 'active',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const depts = await api.departments.list();
        setDepartments(depts);
        if (depts.length > 0 && !formData.department) {
          setFormData(prev => ({ ...prev, department: depts[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.teachers.list({
        search,
        department: deptFilter,
      });
      setTeachers(result);
    } catch (err) {
      setError(err.message || 'Failed to retrieve teachers roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [deptFilter]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeachers();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const openAddEditModal = (teacher = null) => {
    setFormError('');
    if (teacher) {
      setSelectedTeacher(teacher);
      setFormData({
        employeeId: teacher.employeeId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone || '',
        department: teacher.department?._id || teacher.department || '',
        position: teacher.position || '',
        joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : '',
        status: teacher.status || 'active',
        password: '',
      });
    } else {
      setSelectedTeacher(null);
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: departments[0]?._id || '',
        position: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
        password: '',
      });
    }
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (teacher) => {
    setSelectedTeacher(teacher);
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
      if (selectedTeacher) {
        await api.teachers.update(selectedTeacher._id, formData);
        setSuccessMsg('Faculty profile updated successfully!');
      } else {
        await api.teachers.create(formData);
        setSuccessMsg('New faculty registered and login provisioned successfully!');
      }
      setIsAddEditModalOpen(false);
      fetchTeachers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Verify teacher details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await api.teachers.delete(selectedTeacher._id);
      setSuccessMsg('Faculty member and credentials removed.');
      fetchTeachers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete teacher records.');
      setLoading(false);
    }
  };

  const tableColumns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      className: 'text-mono',
      render: (row, val) => <strong>{val}</strong>,
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Department',
      accessor: 'department.code',
    },
    {
      header: 'Position',
      accessor: 'position',
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate',
      render: (row, val) => new Date(val).toLocaleDateString(),
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
            onClick={() => navigate(`/teachers/${row._id}`)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px' }}
            title="View Profile & Classes"
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
          <h2>Faculty Directory</h2>
          <p className="page-description">Manage academic teachers, coordinators, and assign them to departments and titles.</p>
        </div>
        <button onClick={() => openAddEditModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Faculty</span>
        </button>
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {error && <Alert type="error" message={error} />}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-left">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by ID, name, email..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher List Table */}
      <Table columns={tableColumns} data={teachers} loading={loading} />

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedTeacher ? 'Edit Faculty Record' : 'Register New Faculty'}
        size="md"
      >
        {formError && <Alert type="error" message={formError} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee ID * (Unique)</label>
              <input
                type="text"
                name="employeeId"
                className="form-input"
                placeholder="e.g. TCH101"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
                disabled={isSubmitting || !!selectedTeacher}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="faculty@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>Select Department</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Academic Position / Title *</label>
              <input
                type="text"
                name="position"
                className="form-input"
                placeholder="e.g. Professor, Lecturer"
                value={formData.position}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                className="form-input"
                value={formData.joiningDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row">
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
              <label className="form-label">
                {selectedTeacher ? 'Change Password (Leave blank to keep)' : 'Login Password *'}
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder={selectedTeacher ? 'Enter new password if changing' : 'Enter login password'}
                value={formData.password}
                onChange={handleInputChange}
                required={!selectedTeacher}
                disabled={isSubmitting}
              />
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Faculty Deletion"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete the faculty record for{' '}
            <strong>
              {selectedTeacher?.firstName} {selectedTeacher?.lastName} ({selectedTeacher?.employeeId})
            </strong>
            ? This action will permanently remove their credentials and un-assign them from any active HOD chairs or course teaching schedules.
          </p>
          <div className="form-actions" style={{ marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Yes, Delete Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherList;
