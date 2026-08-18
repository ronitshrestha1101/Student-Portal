import Course from '../models/Course.js';
import Student from '../models/Student.js';

// @desc    Get all courses with optional filters
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req, res) => {
  const { department, semester, teacher, search } = req.query;
  let query = {};

  if (department) query.department = department;
  if (semester) query.semester = semester;
  if (teacher) query.assignedTeacher = teacher;
  if (search) {
    query.$or = [
      { courseName: { $regex: search, $options: 'i' } },
      { courseCode: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const courses = await Course.find(query)
      .populate('department', 'name code')
      .populate('assignedTeacher', 'firstName lastName employeeId position');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('department', 'name code')
      .populate('assignedTeacher', 'firstName lastName employeeId email position');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get count of students enrolled
    const studentCount = await Student.countDocuments({ courses: course._id });

    res.json({
      course,
      studentCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  const { courseCode, courseName, department, semester, creditHours, assignedTeacher, status } = req.body;

  try {
    const codeExists = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      courseCode,
      courseName,
      department,
      semester,
      creditHours,
      assignedTeacher: assignedTeacher || null,
      status: status || 'active',
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  const { courseCode, courseName, department, semester, creditHours, assignedTeacher, status } = req.body;

  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (courseCode && courseCode.toUpperCase() !== course.courseCode) {
        const codeExists = await Course.findOne({ courseCode: courseCode.toUpperCase() });
        if (codeExists) {
          return res.status(400).json({ message: 'Course code already exists' });
        }
        course.courseCode = courseCode;
      }

      course.courseName = courseName || course.courseName;
      course.department = department || course.department;
      course.semester = semester || course.semester;
      course.creditHours = creditHours || course.creditHours;
      course.assignedTeacher = assignedTeacher !== undefined ? (assignedTeacher || null) : course.assignedTeacher;
      course.status = status || course.status;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      // Check if students are enrolled
      const enrolledStudentsCount = await Student.countDocuments({ courses: course._id });
      if (enrolledStudentsCount > 0) {
        return res.status(400).json({
          message: `Cannot delete course. There are ${enrolledStudentsCount} students currently enrolled in it.`,
        });
      }

      await Course.deleteOne({ _id: course._id });
      res.json({ message: 'Course removed successfully' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
