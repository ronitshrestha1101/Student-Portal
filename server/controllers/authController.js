import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Department from '../models/Department.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
      let profile = null;
      if (user.role === 'student') {
        profile = await Student.findOne({ user: user._id }).populate('department');
      } else if (user.role === 'teacher') {
        profile = await Teacher.findOne({ user: user._id }).populate('department');
      }
      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        },
        profile,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  const { email, password, role, firstName, lastName, dob, gender, department, program, semester } = req.body;
  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({
      email: email.toLowerCase(),
      password,
      role,
    });
    const savedUser = await user.save();
    let profile = null;
    if (role === 'student') {
      const studentId = 'STU' + Math.floor(100000 + Math.random() * 900000);
      let deptId = department;
      if (!deptId) {
        const dept = await Department.findOne();
        if (dept) {
          deptId = dept._id;
        }
      }
      const student = new Student({
        user: savedUser._id,
        studentId,
        firstName: firstName || 'New',
        lastName: lastName || 'Student',
        dob: dob || new Date('2000-01-01'),
        gender: gender || 'Male',
        email: email.toLowerCase(),
        department: deptId,
        program: program || 'Undergraduate',
        semester: Number(semester) || 1,
      });
      profile = await student.save();
    } else if (role === 'teacher') {
      const employeeId = 'TCH' + Math.floor(1000 + Math.random() * 9000);
      let deptId = department;
      if (!deptId) {
        const dept = await Department.findOne();
        if (dept) {
          deptId = dept._id;
        }
      }
      const teacher = new Teacher({
        user: savedUser._id,
        employeeId,
        firstName: firstName || 'New',
        lastName: lastName || 'Teacher',
        email: email.toLowerCase(),
        department: deptId,
        position: 'Assistant Professor',
      });
      profile = await teacher.save();
    }
    res.status(201).json({
      token: generateToken(savedUser._id),
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
      },
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id })
        .populate('department')
        .populate('courses');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id }).populate('department');
    }
    res.json({
      user,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
