import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

// @desc    Get attendance status for all students enrolled in a course on a specific date
// @route   GET /api/attendance/course/:courseId
// @access  Private
export const getCourseAttendance = async (req, res) => {
  const { date } = req.query;
  const { courseId } = req.params;

  try {
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required (YYYY-MM-DD)' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find all students enrolled in this course
    const students = await Student.find({ courses: courseId, status: 'active' }).select('firstName lastName studentId');

    // Get attendance records for this course and date
    const queryDate = new Date(date);
    // Set hours to UTC midnight for precise date matching
    queryDate.setUTCHours(0, 0, 0, 0);
    
    const nextDay = new Date(queryDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const attendanceRecords = await Attendance.find({
      course: courseId,
      date: {
        $gte: queryDate,
        $lt: nextDay,
      },
    });

    // Merge student roster with their attendance status
    const roster = students.map((student) => {
      const record = attendanceRecords.find(
        (rec) => rec.student.toString() === student._id.toString()
      );
      return {
        studentId: student._id,
        studentUid: student.studentId,
        name: student.fullName,
        status: record ? record.status : '', // '' means unmarked
        attendanceId: record ? record._id : null,
      };
    });

    res.json(roster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Update bulk attendance for a course on a specific date
// @route   POST /api/attendance
// @access  Private (Teacher and Admin)
export const saveBulkAttendance = async (req, res) => {
  const { courseId, date, records } = req.body;

  try {
    if (!courseId || !date || !records || !Array.from(records).length) {
      return res.status(400).json({ message: 'Course, date, and attendance records are required' });
    }

    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    const savedRecords = [];

    for (const record of records) {
      const { studentId, status } = record;

      if (!['Present', 'Absent', 'Late'].includes(status)) {
        continue; // skip invalid statuses
      }

      // Upsert record
      const updatedRecord = await Attendance.findOneAndUpdate(
        {
          course: courseId,
          student: studentId,
          date: queryDate,
        },
        {
          status,
          markedBy: req.user._id,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
      savedRecords.push(updatedRecord);
    }

    res.status(200).json({
      message: 'Attendance saved successfully',
      count: savedRecords.length,
      records: savedRecords,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get attendance history for the logged-in student
// @route   GET /api/attendance/my-attendance
// @access  Private (Student)
export const getMyAttendance = async (req, res) => {
  try {
    // Find the student profile first
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attendance = await Attendance.find({ student: student._id })
      .populate('course', 'courseName courseCode creditHours')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
