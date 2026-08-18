import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';

// @desc    Get all students (with search, filter, sorting, pagination)
// @route   GET /api/students
// @access  Private
export const getStudents = async (req, res) => {
  const { department, semester, program, status, search, page = 1, limit = 10, sortBy = 'studentId', sortOrder = 'asc' } = req.query;
  
  let query = {};

  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (program) query.program = program;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sort = {};
    if (sortBy === 'name') {
      sort.firstName = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const students = await Student.find(query)
      .populate('department', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student profile by ID (detailed)
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('department', 'name code headOfDepartment')
      .populate('courses', 'courseName courseCode creditHours');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 1. Fetch exam results for this student
    const results = await Result.find({ student: student._id })
      .populate('examination', 'examName date maxMarks')
      .populate('course', 'courseName courseCode creditHours');

    // 2. Fetch attendance for this student
    const attendance = await Attendance.find({ student: student._id })
      .populate('course', 'courseName courseCode')
      .sort({ date: -1 });

    // Calculate attendance summaries by course
    const attendanceSummary = {};
    attendance.forEach(record => {
      const courseId = record.course._id.toString();
      if (!attendanceSummary[courseId]) {
        attendanceSummary[courseId] = {
          courseCode: record.course.courseCode,
          courseName: record.course.courseName,
          present: 0,
          absent: 0,
          late: 0,
          total: 0
        };
      }
      attendanceSummary[courseId].total += 1;
      if (record.status === 'Present') attendanceSummary[courseId].present += 1;
      if (record.status === 'Absent') attendanceSummary[courseId].absent += 1;
      if (record.status === 'Late') attendanceSummary[courseId].late += 1;
    });

    // Calculate overall GPA from results
    let totalCredits = 0;
    let weightedGPA = 0;
    results.forEach(resRecord => {
      const credit = resRecord.course?.creditHours || 3; // default fallback
      totalCredits += credit;
      weightedGPA += resRecord.gpa * credit;
    });
    const cumulativeGPA = totalCredits > 0 ? (weightedGPA / totalCredits).toFixed(2) : '0.00';

    res.json({
      student,
      results,
      cumulativeGPA,
      attendanceSummary: Object.values(attendanceSummary),
      attendanceDetail: attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create student and user account
// @route   POST /api/students
// @access  Private/Admin
export const createStudent = async (req, res) => {
  const {
    studentId,
    firstName,
    lastName,
    dob,
    gender,
    email,
    phone,
    address,
    department,
    program,
    semester,
    enrollmentDate,
    status,
    courses,
    password,
  } = req.body;

  try {
    // Check if studentId or email already exists
    const studentIdExists = await Student.findOne({ studentId: studentId.toUpperCase() });
    if (studentIdExists) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Verify department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ message: 'Department not found' });
    }

    // Create user login credential
    const userPassword = password || `Std@${studentId}`;
    const user = new User({
      email: email.toLowerCase(),
      password: userPassword,
      role: 'student',
      isActive: status !== 'inactive',
    });
    const savedUser = await user.save();

    // Create student profile
    const student = new Student({
      user: savedUser._id,
      studentId: studentId.toUpperCase(),
      firstName,
      lastName,
      dob,
      gender,
      email: email.toLowerCase(),
      phone,
      address,
      department,
      program,
      semester: Number(semester),
      enrollmentDate: enrollmentDate || Date.now(),
      status: status || 'active',
      courses: courses || [],
      documents: [],
    });

    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private/Admin
export const updateStudent = async (req, res) => {
  const {
    firstName,
    lastName,
    dob,
    gender,
    email,
    phone,
    address,
    department,
    program,
    semester,
    enrollmentDate,
    status,
    courses,
  } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      // Check if email changed and is unique
      if (email && email.toLowerCase() !== student.email) {
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Update User email
        await User.findByIdAndUpdate(student.user, { email: email.toLowerCase() });
        student.email = email.toLowerCase();
      }

      // Update User status if status is provided
      if (status) {
        await User.findByIdAndUpdate(student.user, { isActive: status === 'active' });
      }

      student.firstName = firstName || student.firstName;
      student.lastName = lastName || student.lastName;
      student.dob = dob || student.dob;
      student.gender = gender || student.gender;
      student.phone = phone !== undefined ? phone : student.phone;
      student.address = address !== undefined ? address : student.address;
      student.department = department || student.department;
      student.program = program || student.program;
      student.semester = semester !== undefined ? Number(semester) : student.semester;
      student.enrollmentDate = enrollmentDate || student.enrollmentDate;
      student.status = status || student.status;
      if (courses !== undefined) {
        student.courses = courses;
      }

      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student & associated user credentials
// @route   DELETE /api/students/:id
// @access  Private/Admin
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      // Delete user account
      await User.deleteOne({ _id: student.user });

      // Clean up student results
      await Result.deleteMany({ student: student._id });

      // Clean up student attendance
      await Attendance.deleteMany({ student: student._id });

      // Delete student profile
      await Student.deleteOne({ _id: student._id });

      res.json({ message: 'Student and associated data removed successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload document metadata for a student
// @route   POST /api/students/:id/documents
// @access  Private/Admin
export const uploadStudentDocument = async (req, res) => {
  const { name, fileUrl } = req.body;

  try {
    if (!name || !fileUrl) {
      return res.status(400).json({ message: 'Document name and URL are required' });
    }

    const student = await Student.findById(req.params.id);

    if (student) {
      student.documents.push({ name, fileUrl });
      await student.save();
      res.status(201).json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete document for a student
// @route   DELETE /api/students/:id/documents/:docId
// @access  Private/Admin
export const deleteStudentDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      student.documents = student.documents.filter(
        (doc) => doc._id.toString() !== req.params.docId
      );
      await student.save();
      res.json({ message: 'Document removed successfully', student });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
