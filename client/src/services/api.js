const BASE_URL = 'http://localhost:5000/api';

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

export const api = {
  // Auth
  auth: {
    login: (email, password) =>
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => apiFetch('/auth/me'),
  },

  // Admin Dashboard Stats
  admin: {
    getStats: () => apiFetch('/admin/dashboard-stats'),
  },

  // Students
  students: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      return apiFetch(`/students?${query.toString()}`);
    },
    get: (id) => apiFetch(`/students/${id}`),
    create: (data) =>
      apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiFetch(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiFetch(`/students/${id}`, {
        method: 'DELETE',
      }),
    uploadDoc: (id, docData) =>
      apiFetch(`/students/${id}/documents`, {
        method: 'POST',
        body: JSON.stringify(docData),
      }),
    deleteDoc: (id, docId) =>
      apiFetch(`/students/${id}/documents/${docId}`, {
        method: 'DELETE',
      }),
  },

  // Teachers
  teachers: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      return apiFetch(`/teachers?${query.toString()}`);
    },
    get: (id) => apiFetch(`/teachers/${id}`),
    create: (data) =>
      apiFetch('/teachers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiFetch(`/teachers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiFetch(`/teachers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Departments
  departments: {
    list: () => apiFetch('/departments'),
    get: (id) => apiFetch(`/departments/${id}`),
    create: (data) =>
      apiFetch('/departments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiFetch(`/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiFetch(`/departments/${id}`, {
        method: 'DELETE',
      }),
  },

  // Courses
  courses: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      return apiFetch(`/courses?${query.toString()}`);
    },
    get: (id) => apiFetch(`/courses/${id}`),
    create: (data) =>
      apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiFetch(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiFetch(`/courses/${id}`, {
        method: 'DELETE',
      }),
  },

  // Attendance
  attendance: {
    getCourseRoster: (courseId, date) =>
      apiFetch(`/attendance/course/${courseId}?date=${date}`),
    saveBulk: (courseId, date, records) =>
      apiFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({ courseId, date, records }),
      }),
    getMyAttendance: () => apiFetch('/attendance/my-attendance'),
  },

  // Examinations and Results
  exams: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      return apiFetch(`/exams?${query.toString()}`);
    },
    get: (id) => apiFetch(`/exams/${id}`),
    create: (data) =>
      apiFetch('/exams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiFetch(`/exams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiFetch(`/exams/${id}`, {
        method: 'DELETE',
      }),
    getResultsRoster: (examId) =>
      apiFetch(`/exams/${examId}/results`),
    saveBulkResults: (examId, records) =>
      apiFetch(`/exams/${examId}/results`, {
        method: 'POST',
        body: JSON.stringify({ records }),
      }),
    publishResults: (id) =>
      apiFetch(`/exams/${id}/publish`, {
        method: 'PUT',
      }),
    getMyResults: () => apiFetch('/exams/my-results'),
  },

  // Announcements
  announcements: {
    list: () => apiFetch('/announcements'),
    listAdmin: () => apiFetch('/announcements/admin'),
    create: (data) =>
      apiFetch('/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      apiFetch(`/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      apiFetch(`/announcements/${id}`, {
        method: 'DELETE',
      }),
  },
};
