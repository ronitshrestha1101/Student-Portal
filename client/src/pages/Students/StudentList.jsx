import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { Plus, Search, Edit2, Trash2, Eye, Calendar, BookOpen } from 'lucide-react';

const StudentList = () => {
  const navigate = useNavigate();
  
  // Data States
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Sorting States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('studentId');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter States
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    department: '',
    program: '',
    semester: '1',
    enrollmentDate: '',
    status: 'active',
    courses: [],
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load departments, courses and student list
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [depts, courses] = await Promise.all([
          api.departments.list(),
          api.courses.list()
        ]);
        setDepartments(depts);
        setAllCourses(courses);
        if (depts.length > 0 && !formData.department) {
          setFormData(prev => ({ ...prev, department: depts[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.students.list({
        page,
        limit: 10,
        sortBy,
        sortOrder,
        search,
        department: deptFilter,
        semester: semFilter,
        status: statusFilter,
      });
      setStudents(result.students);
      setTotalPages(result.pages);
      setTotalRecords(result.total);
    } catch (err) {
      setError(err.message || 'Failed to retrieve students roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, sortBy, sortOrder, deptFilter, semFilter, statusFilter]);

  // Debounced search fetch
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchStudents();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Handle Sort
  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  // Open Add/Edit Modal
  const openAddEditModal = (student = null) => {
    setFormError('');
    if (student) {
      // Editing
      setSelectedStudent(student);
      setFormData({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
        gender: student.gender || 'Male',
        email: student.email,
        phone: student.phone || '',
        address: student.address || '',
        department: student.department?._id || student.department || '',
        program: student.program || '',
        semester: String(student.semester || 1),
        enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : '',
        status: student.status || 'active',
        courses: student.courses?.map(c => c._id || c) || [],
        password: '', // leave empty to not update password
      });
    } else {
      // Adding
      setSelectedStudent(null);
      setFormData({
        studentId: '',
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'Male',
        email: '',
        phone: '',
        address: '',
        department: departments[0]?._id || '',
        program: '',
        semester: '1',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        courses: [],
        password: '',
      });
    }
    setIsAddEditModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Form Field Change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Course Checkbox select handler
  const handleCourseCheckboxChange = (courseId) => {
    setFormData(prev => {
      const courses = [...prev.courses];
      if (courses.includes(courseId)) {
        return { ...prev, courses: courses.filter(id => id !== courseId) };
      } else {
        return { ...prev, courses: [...courses, courseId] };
      }
    });
  };

  // Form Submit (Add/Edit Student)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (selectedStudent) {
        // Edit API
        await api.students.update(selectedStudent._id, formData);
        setSuccessMsg('Student profile updated successfully!');
      } else {
        // Add API
        await api.students.create(formData);
        setSuccessMsg('New student registered and login provisioned successfully!');
      }
      setIsAddEditModalOpen(false);
      fetchStudents();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Verify student details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete handler
  const handleDeleteConfirm = async () => {
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await api.students.delete(selectedStudent._id);
      setSuccessMsg('Student and associated credentials removed.');
      fetchStudents();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete student records.');
      setLoading(false);
    }
  };

  // Columns definition for Table
  const tableColumns = [
    {
      header: 'Student ID',
      accessor: 'studentId',
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
      header: 'Program',
      accessor: 'program',
    },
    {
      header: 'Sem',
      accessor: 'semester',
      className: 'text-mono',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row, val) => (
        <span className={`badge badge-${val === 'active' ? 'success' : val === 'suspended' ? 'error' : 'warning'}`}>
          {val}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate(`/students/${row._id}`)}
            className="btn btn-secondary"
            style={{ padding: '4px 8px' }}
            title="View Student Profile"
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
          <h2>Student Registry</h2>
          <p className="page-description">Manage enrolled students, academic courses, and view cumulative summaries.</p>
        </div>
        <button onClick={() => openAddEditModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Add New Student</span>
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
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={semFilter}
            onChange={(e) => { setSemFilter(e.target.value); setPage(1); }}
            style={{ width: '120px' }}
          >
            <option value="">All Semesters</option>
            {Array.from({ length: 8 }).map((_, i) => (
              <option key={i+1} value={i+1}>Sem {i+1}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ width: '130px' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <Table
        columns={tableColumns}
        data={students}
        loading={loading}
        pagination={{
          page,
          pages: totalPages,
          total: totalRecords,
          onPageChange: setPage,
        }}
        sort={{
          sortBy,
          sortOrder,
          onSort: handleSortChange,
        }}
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedStudent ? 'Edit Student Record' : 'Register New Student'}
        size="lg"
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
              <label className="form-label">Student ID * (Unique)</label>
              <input
                type="text"
                name="studentId"
                className="form-input"
                placeholder="e.g. STD2026001"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                disabled={isSubmitting || !!selectedStudent}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                className="form-input"
                value={formData.dob}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
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
              <label className="form-label">Program *</label>
              <input
                type="text"
                name="program"
                className="form-input"
                placeholder="e.g. B.Tech CSE, MBA"
                value={formData.program}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Semester *</label>
              <select
                name="semester"
                className="form-select"
                value={formData.semester}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <option key={i+1} value={i+1}>Semester {i+1}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Enrollment Date</label>
              <input
                type="date"
                name="enrollmentDate"
                className="form-input"
                value={formData.enrollmentDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Status *</label>
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
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {selectedStudent ? 'Change Login Password (Leave blank to keep current)' : 'Account Login Password *'}
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder={selectedStudent ? 'Enter new password if changing' : 'Enter login password'}
              value={formData.password}
              onChange={handleInputChange}
              required={!selectedStudent}
              disabled={isSubmitting}
            />
          </div>

          {/* Assigned Courses checkboxes */}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Enrolled Academic Courses</label>
            <div
              style={{
                maxHeight: '160px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                backgroundColor: 'var(--bg-primary)',
              }}
            >
              {allCourses
                .filter(course => !formData.department || course.department?._id === formData.department)
                .map(course => (
                  <label
                    key={course._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.courses.includes(course._id)}
                      onChange={() => handleCourseCheckboxChange(course._id)}
                      disabled={isSubmitting}
                    />
                    <span>
                      <strong>{course.courseCode}</strong> - {course.courseName}
                    </span>
                  </label>
                ))}
              {allCourses.filter(course => !formData.department || course.department?._id === formData.department).length === 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', gridColumn: 'span 2' }}>
                  No courses found for the selected department.
                </span>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Residential Address</label>
            <textarea
              name="address"
              className="form-textarea"
              value={formData.address}
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
              {isSubmitting ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Student Deletion"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete the student profile for{' '}
            <strong>
              {selectedStudent?.firstName} {selectedStudent?.lastName} ({selectedStudent?.studentId})
            </strong>
            ? This action will permanently remove all academic results, attendance entries, and user credentials.
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

export default StudentList;
