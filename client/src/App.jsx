import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

// Students
import StudentList from './pages/Students/StudentList';
import StudentDetails from './pages/Students/StudentDetails';

// Teachers
import TeacherList from './pages/Teachers/TeacherList';
import TeacherDetails from './pages/Teachers/TeacherDetails';

// Departments
import DepartmentList from './pages/Departments/DepartmentList';
import DepartmentDetails from './pages/Departments/DepartmentDetails';

// Courses
import CourseList from './pages/Courses/CourseList';

// Attendance
import AttendanceMark from './pages/Attendance/AttendanceMark';
import AttendanceView from './pages/Attendance/AttendanceView';

// Exams & Results
import ExamList from './pages/Exams/ExamList';
import ResultEntry from './pages/Exams/ResultEntry';
import ResultView from './pages/Exams/ResultView';

// Announcements
import AnnouncementList from './pages/Announcements/AnnouncementList';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Portal Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Fallback to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Shared Page Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="announcements" element={<AnnouncementList />} />

            {/* Admin Only Routes */}
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="students/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeacherList />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeacherDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DepartmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DepartmentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CourseList />
                </ProtectedRoute>
              }
            />

            {/* Attendance Routes */}
            <Route
              path="attendance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <AttendanceMark />
                </ProtectedRoute>
              }
            />
            <Route
              path="attendance/my"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AttendanceView />
                </ProtectedRoute>
              }
            />

            {/* Exam & Grade Routes */}
            <Route
              path="exams"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <ExamList />
                </ProtectedRoute>
              }
            />
            <Route
              path="exams/:examId/grade"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <ResultEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="exams/my-results"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ResultView />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
