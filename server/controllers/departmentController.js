import Department from '../models/Department.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('headOfDepartment', 'firstName lastName employeeId email');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department by ID with detailed statistics
// @route   GET /api/departments/:id
// @access  Private
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('headOfDepartment', 'firstName lastName employeeId email');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get related teachers, courses, students count
    const teachers = await Teacher.find({ department: department._id }).select('firstName lastName employeeId email position status');
    const courses = await Course.find({ department: department._id }).populate('assignedTeacher', 'firstName lastName');
    const studentCount = await Student.countDocuments({ department: department._id });

    res.json({
      department,
      teachers,
      courses,
      studentCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req, res) => {
  const { name, code, description, headOfDepartment, status } = req.body;

  try {
    // Check if code or name already exists
    const codeExists = await Department.findOne({ code: code.toUpperCase() });
    if (codeExists) {
      return res.status(400).json({ message: 'Department code already exists' });
    }

    const nameExists = await Department.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    const department = new Department({
      name,
      code,
      description,
      headOfDepartment: headOfDepartment || null,
      status: status || 'active',
    });

    const createdDepartment = await department.save();
    res.status(201).json(createdDepartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const updateDepartment = async (req, res) => {
  const { name, code, description, headOfDepartment, status } = req.body;

  try {
    const department = await Department.findById(req.params.id);

    if (department) {
      // Check for code uniqueness if changed
      if (code && code.toUpperCase() !== department.code) {
        const codeExists = await Department.findOne({ code: code.toUpperCase() });
        if (codeExists) {
          return res.status(400).json({ message: 'Department code already exists' });
        }
        department.code = code;
      }

      // Check for name uniqueness if changed
      if (name && name !== department.name) {
        const nameExists = await Department.findOne({ name });
        if (nameExists) {
          return res.status(400).json({ message: 'Department name already exists' });
        }
        department.name = name;
      }

      department.description = description !== undefined ? description : department.description;
      department.headOfDepartment = headOfDepartment !== undefined ? (headOfDepartment || null) : department.headOfDepartment;
      department.status = status || department.status;

      const updatedDepartment = await department.save();
      res.json(updatedDepartment);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (department) {
      // Check if there are active teachers or students in this department
      const teachersCount = await Teacher.countDocuments({ department: department._id });
      const studentsCount = await Student.countDocuments({ department: department._id });

      if (teachersCount > 0 || studentsCount > 0) {
        return res.status(400).json({
          message: `Cannot delete department. There are ${teachersCount} teachers and ${studentsCount} students currently assigned to it.`,
        });
      }

      await Department.deleteOne({ _id: department._id });
      res.json({ message: 'Department removed successfully' });
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
