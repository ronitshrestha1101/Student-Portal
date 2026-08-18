import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Alert from '../../components/Alert';
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    semester: '1',
    creditHours: '3',
    assignedTeacher: '',
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [depts, t] = await Promise.all([
          api.departments.list(),
          api.teachers.list()
        ]);
        setDepartments(depts);
        setTeachers(t);
        if (depts.length > 0 && !formData.department) {
          setFormData(prev => ({ ...prev, department: depts[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load course metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.courses.list({
        search,
        department: deptFilter,
        semester: semFilter,
      });
      setCourses(result);
    } catch (err) {
      setError(err.message || 'Failed to retrieve course directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [deptFilter, semFilter]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const openAddEditModal = (course = null) => {
    setFormError('');
    if (course) {
      setSelectedCourse(course);
      setFormData({
        courseCode: course.courseCode,
        courseName: course.courseName,
        department: course.department?._id || course.department || '',
        semester: String(course.semester || 1),
        creditHours: String(course.creditHours || 3),
        assignedTeacher: course.assignedTeacher?._id || course.assignedTeacher || '',
        status: course.status || 'active',
      });
    } else {
      setSelectedCourse(null);
      setFormData({
        courseCode: '',
        courseName: '',
        department: departments[0]?._id || '',
        semester: '1',
        creditHours: '3',
        assignedTeacher: '',
        status: 'active',
      });
    }
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
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
      if (selectedCourse) {
        await api.courses.update(selectedCourse._id, formData);
        setSuccessMsg('Course curriculum updated successfully!');
      } else {
        await api.courses.create(formData);
        setSuccessMsg('New course registered in curriculum directory!');
      }
      setIsAddEditModalOpen(false);
      fetchCourses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Verify course details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setIsDeleteModalOpen(false);
    try {
      await api.courses.delete(selectedCourse._id);
      setSuccessMsg('Course removed from syllabus records.');
      fetchCourses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not delete course.');
      setLoading(false);
    }
  };

  const tableColumns = [
    {
      header: 'Course Code',
      accessor: 'courseCode',
      className: 'text-mono',
      render: (row, val) => <strong>{val}</strong>,
    },
    {
      header: 'Course Name',
      accessor: 'courseName',
    },
    {
      header: 'Department',
      accessor: 'department.code',
    },
    {
      header: 'Semester',
      accessor: 'semester',
      className: 'text-mono',
      render: (row, val) => `Sem ${val}`,
    },
    {
      header: 'Credits',
      accessor: 'creditHours',
      className: 'text-mono',
    },
    {
      header: 'Faculty Instructor',
      accessor: 'assignedTeacher',
      render: (row) => row.assignedTeacher ? `${row.assignedTeacher.firstName} ${row.assignedTeacher.lastName}` : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>,
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
            title="Delete Course"
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
          <h2>Course Registry</h2>
          <p className="page-description">Manage university subjects, set credits, assign teaching instructors, and align syllabus codes.</p>
        </div>
        <button onClick={() => openAddEditModal()} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Course Code</span>
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
              placeholder="Search by code or course name..."
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

          <select
            className="filter-select"
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            style={{ width: '120px' }}
          >
            <option value="">All Semesters</option>
            {Array.from({ length: 8 }).map((_, i) => (
              <option key={i+1} value={i+1}>Sem {i+1}</option>
            ))}
          </select>
        </div>
      </div>

      <Table columns={tableColumns} data={courses} loading={loading} />

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={selectedCourse ? 'Edit Course Settings' : 'Add New Course Code'}
        size="md"
      >
        {formError && <Alert type="error" message={formError} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Course Code * (Uppercase, e.g. CS-101)</label>
            <input
              type="text"
              name="courseCode"
              className="form-input"
              value={formData.courseCode}
              onChange={handleInputChange}
              required
              disabled={isSubmitting || !!selectedCourse}
              style={{ textTransform: 'uppercase' }}
              placeholder="e.g. CS-101"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Title / Name *</label>
            <input
              type="text"
              name="courseName"
              className="form-input"
              value={formData.courseName}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder="e.g. Introduction to Programming"
            />
          </div>

          <div className="form-row">
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
            <div className="form-group">
              <label className="form-label">Credit Hours *</label>
              <select
                name="creditHours"
                className="form-select"
                value={formData.creditHours}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="1">1 Credit</option>
                <option value="2">2 Credits</option>
                <option value="3">3 Credits</option>
                <option value="4">4 Credits</option>
                <option value="5">5 Credits</option>
                <option value="6">6 Credits</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Semester Align *</label>
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
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Faculty Instructor</label>
            <select
              name="assignedTeacher"
              className="form-select"
              value={formData.assignedTeacher}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="">No Instructor Assigned</option>
              {teachers
                .filter(t => !formData.department || t.department?._id === formData.department)
                .map(t => (
                  <option key={t._id} value={t._id}>{t.firstName} {t.lastName} ({t.employeeId})</option>
                ))}
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
              {isSubmitting ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Course Deletion"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete the course{' '}
            <strong>
              {selectedCourse?.courseName} ({selectedCourse?.courseCode})
            </strong>
            ? This action cannot be undone and will fail if there are active students enrolled.
          </p>
          <div className="form-actions" style={{ marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Yes, Remove Course
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseList;
