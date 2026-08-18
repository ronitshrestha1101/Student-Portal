import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getTeachers = async (req, res) => {
  const { department, search } = req.query;
  let query = {};

  if (department) query.department = department;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const teachers = await Teacher.find(query).populate('department', 'name code');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teacher profile by ID with courses taught
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('department', 'name code');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Get courses assigned to this teacher
    const courses = await Course.find({ assignedTeacher: teacher._id }).populate('department', 'name code');

    res.json({
      teacher,
      courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create teacher & user account
// @route   POST /api/teachers
// @access  Private/Admin
export const createTeacher = async (req, res) => {
  const {
    employeeId,
    firstName,
    lastName,
    email,
    phone,
    department,
    position,
    joiningDate,
    status,
    password, // optional, can default
  } = req.body;

  try {
    // Check if employeeId or email already exists
    const employeeIdExists = await Teacher.findOne({ employeeId: employeeId.toUpperCase() });
    if (employeeIdExists) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if department exists
    const dept = await Department.findById(department);
    if (!dept) {
      return res.status(400).json({ message: 'Department not found' });
    }

    // Create User record
    const userPassword = password || `Tch@${employeeId}`;
    const user = new User({
      email: email.toLowerCase(),
      password: userPassword,
      role: 'teacher',
      isActive: status !== 'inactive',
    });
    const savedUser = await user.save();

    // Create Teacher profile
    const teacher = new Teacher({
      user: savedUser._id,
      employeeId: employeeId.toUpperCase(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      department,
      position,
      joiningDate: joiningDate || Date.now(),
      status: status || 'active',
    });

    const createdTeacher = await teacher.save();
    res.status(201).json(createdTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private/Admin
export const updateTeacher = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    department,
    position,
    joiningDate,
    status,
  } = req.body;

  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      // If email is changing, ensure uniqueness in User collection
      if (email && email.toLowerCase() !== teacher.email) {
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        
        // Update user email
        await User.findByIdAndUpdate(teacher.user, { email: email.toLowerCase() });
        teacher.email = email.toLowerCase();
      }

      // Update User status if status is provided
      if (status) {
        await User.findByIdAndUpdate(teacher.user, { isActive: status === 'active' });
      }

      teacher.firstName = firstName || teacher.firstName;
      teacher.lastName = lastName || teacher.lastName;
      teacher.phone = phone !== undefined ? phone : teacher.phone;
      teacher.department = department || teacher.department;
      teacher.position = position || teacher.position;
      teacher.joiningDate = joiningDate || teacher.joiningDate;
      teacher.status = status || teacher.status;

      const updatedTeacher = await teacher.save();
      res.json(updatedTeacher);
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete teacher & user account
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (teacher) {
      // Find and remove associated user
      await User.deleteOne({ _id: teacher.user });

      // Unassign teacher from any courses
      await Course.updateMany(
        { assignedTeacher: teacher._id },
        { $set: { assignedTeacher: null } }
      );

      // Unassign teacher from HOD of any departments
      await Department.updateMany(
        { headOfDepartment: teacher._id },
        { $set: { headOfDepartment: null } }
      );

      // Remove teacher profile
      await Teacher.deleteOne({ _id: teacher._id });
      res.json({ message: 'Teacher and associated login account removed successfully' });
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
