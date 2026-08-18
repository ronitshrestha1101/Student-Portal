import Announcement from '../models/Announcement.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// @desc    Get all announcements (Admin view, or generic listing)
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
  try {
    const query = {};
    
    // If not admin, restrict to targeted roles
    if (req.user.role === 'teacher') {
      query.targetRole = { $in: ['all', 'teacher'] };
    } else if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) {
        query.targetRole = { $in: ['all', 'student'] };
        query.$and = [
          {
            $or: [
              { targetDepartment: null },
              { targetDepartment: student.department }
            ]
          },
          {
            $or: [
              { targetSemester: null },
              { targetSemester: student.semester }
            ]
          }
        ];
      } else {
        query.targetRole = 'all';
      }
    }

    const announcements = await Announcement.find(query)
      .populate('targetDepartment', 'name code')
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all announcements for Admin administration
// @route   GET /api/announcements/admin
// @access  Private/Admin
export const getAdminAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('targetDepartment', 'name code')
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res) => {
  const { title, content, targetRole, targetDepartment, targetSemester } = req.body;

  try {
    const announcement = new Announcement({
      title,
      content,
      targetRole: targetRole || 'all',
      targetDepartment: targetDepartment || null,
      targetSemester: targetSemester ? Number(targetSemester) : null,
      createdBy: req.user._id,
    });

    const createdAnnouncement = await announcement.save();
    const populated = await Announcement.findById(createdAnnouncement._id)
      .populate('targetDepartment', 'name code')
      .populate('createdBy', 'email role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
export const updateAnnouncement = async (req, res) => {
  const { title, content, targetRole, targetDepartment, targetSemester } = req.body;

  try {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
      announcement.title = title || announcement.title;
      announcement.content = content || announcement.content;
      announcement.targetRole = targetRole || announcement.targetRole;
      announcement.targetDepartment = targetDepartment !== undefined ? (targetDepartment || null) : announcement.targetDepartment;
      announcement.targetSemester = targetSemester !== undefined ? (targetSemester ? Number(targetSemester) : null) : announcement.targetSemester;

      const updatedAnnouncement = await announcement.save();
      const populated = await Announcement.findById(updatedAnnouncement._id)
        .populate('targetDepartment', 'name code')
        .populate('createdBy', 'email role');

      res.json(populated);
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
      await Announcement.deleteOne({ _id: announcement._id });
      res.json({ message: 'Announcement removed successfully' });
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
