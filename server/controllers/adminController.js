import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Examination from '../models/Examination.js';
import Attendance from '../models/Attendance.js';

// @desc    Get administrative dashboard overview statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const totalTeachers = await Teacher.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments({ status: 'active' });
    const totalCourses = await Course.countDocuments({ status: 'active' });

    // Recent Admissions (last 5)
    const recentAdmissions = await Student.find()
      .populate('department', 'name code')
      .sort({ enrollmentDate: -1 })
      .limit(5);

    // Upcoming Exams (next 5)
    const upcomingExams = await Examination.find({
      date: { $gte: new Date() },
    })
      .populate('course', 'courseName courseCode')
      .sort({ date: 1 })
      .limit(5);

    // Attendance Overview (all time status distribution)
    const presentCount = await Attendance.countDocuments({ status: 'Present' });
    const absentCount = await Attendance.countDocuments({ status: 'Absent' });
    const lateCount = await Attendance.countDocuments({ status: 'Late' });
    const totalAttendanceRecords = presentCount + absentCount + lateCount;

    const attendanceStats = {
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      total: totalAttendanceRecords,
      rate: totalAttendanceRecords > 0 
        ? Math.round(((presentCount + lateCount) / totalAttendanceRecords) * 100) 
        : 100, // Present + Late count as attended
    };

    res.json({
      counts: {
        totalStudents,
        activeStudents,
        totalTeachers,
        totalDepartments,
        totalCourses,
      },
      recentAdmissions,
      upcomingExams,
      attendanceStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
