import Examination from '../models/Examination.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

// Grade and GPA Calculation Helper
const calculateGradeAndGPA = (marks, maxMarks) => {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
  if (percentage >= 80) return { grade: 'A', gpa: 3.7 };
  if (percentage >= 70) return { grade: 'B', gpa: 3.0 };
  if (percentage >= 60) return { grade: 'C', gpa: 2.0 };
  if (percentage >= 50) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
};

// @desc    Get all examinations
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res) => {
  const { course, status } = req.query;
  let query = {};
  
  if (course) query.course = course;
  if (status) query.status = status;

  try {
    const exams = await Examination.find(query)
      .populate({
        path: 'course',
        select: 'courseName courseCode creditHours department',
        populate: { path: 'department', select: 'name code' }
      })
      .sort({ date: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get examination by ID
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res) => {
  try {
    const exam = await Examination.findById(req.params.id)
      .populate({
        path: 'course',
        select: 'courseName courseCode creditHours department',
        populate: { path: 'department', select: 'name code' }
      });

    if (!exam) {
      return res.status(404).json({ message: 'Examination not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create examination
// @route   POST /api/exams
// @access  Private (Admin or Teacher)
export const createExam = async (req, res) => {
  const { examName, course, date, maxMarks, status } = req.body;

  try {
    const exam = new Examination({
      examName,
      course,
      date,
      maxMarks: maxMarks || 100,
      status: status || 'scheduled',
    });

    const createdExam = await exam.save();
    res.status(201).json(createdExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update examination
// @route   PUT /api/exams/:id
// @access  Private (Admin or Teacher)
export const updateExam = async (req, res) => {
  const { examName, course, date, maxMarks, status } = req.body;

  try {
    const exam = await Examination.findById(req.params.id);

    if (exam) {
      exam.examName = examName || exam.examName;
      exam.course = course || exam.course;
      exam.date = date || exam.date;
      exam.maxMarks = maxMarks || exam.maxMarks;
      exam.status = status || exam.status;

      const updatedExam = await exam.save();
      res.json(updatedExam);
    } else {
      res.status(404).json({ message: 'Examination not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete examination and associated results
// @route   DELETE /api/exams/:id
// @access  Private (Admin or Teacher)
export const deleteExam = async (req, res) => {
  try {
    const exam = await Examination.findById(req.params.id);

    if (exam) {
      // Delete all results associated with this exam
      await Result.deleteMany({ examination: exam._id });
      // Delete the exam itself
      await Examination.deleteOne({ _id: exam._id });
      res.json({ message: 'Examination and related student results removed successfully' });
    } else {
      res.status(404).json({ message: 'Examination not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get results roster for an examination (returns all course-enrolled students with their marks if saved)
// @route   GET /api/exams/:examId/results
// @access  Private (Admin or Teacher)
export const getExamResultsRoster = async (req, res) => {
  const { examId } = req.params;

  try {
    const exam = await Examination.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Examination not found' });
    }

    // Find students enrolled in the course for this exam
    const students = await Student.find({ courses: exam.course, status: 'active' }).select('firstName lastName studentId');

    // Find entered results for this exam
    const results = await Result.find({ examination: examId });

    // Merge students with their results
    const roster = students.map((student) => {
      const result = results.find((resRecord) => resRecord.student.toString() === student._id.toString());
      return {
        studentId: student._id,
        studentUid: student.studentId,
        name: student.fullName,
        marksObtained: result ? result.marksObtained : '',
        grade: result ? result.grade : '',
        gpa: result ? result.gpa : '',
        remarks: result ? result.remarks : '',
        resultId: result ? result._id : null,
      };
    });

    res.json(roster);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/Update bulk results for an examination
// @route   POST /api/exams/:examId/results
// @access  Private (Admin or Teacher)
export const saveBulkResults = async (req, res) => {
  const { examId } = req.params;
  const { records } = req.body; // array of { studentId, marksObtained, remarks }

  try {
    const exam = await Examination.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Examination not found' });
    }

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No result records provided' });
    }

    const savedResults = [];

    for (const record of records) {
      const { studentId, marksObtained, remarks } = record;

      if (marksObtained === '' || marksObtained === undefined || marksObtained === null) {
        // If marks is empty, delete any existing result for this student (un-assign)
        await Result.deleteOne({ examination: examId, student: studentId });
        continue;
      }

      const score = Number(marksObtained);
      if (isNaN(score) || score < 0 || score > exam.maxMarks) {
        continue; // skip invalid marks
      }

      // Calculate grade and GPA
      const { grade, gpa } = calculateGradeAndGPA(score, exam.maxMarks);

      // Upsert result record
      const result = await Result.findOneAndUpdate(
        {
          examination: examId,
          student: studentId,
        },
        {
          course: exam.course,
          marksObtained: score,
          grade,
          gpa,
          remarks: remarks || '',
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
      savedResults.push(result);
    }

    // Set exam status to completed if we saved marks
    if (exam.status === 'scheduled') {
      exam.status = 'completed';
      await exam.save();
    }

    res.json({
      message: 'Examination results saved successfully',
      count: savedResults.length,
      records: savedResults,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Publish examination results (changes exam status to published)
// @route   PUT /api/exams/:id/publish
// @access  Private (Admin or Teacher)
export const publishExamResults = async (req, res) => {
  try {
    const exam = await Examination.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Examination not found' });
    }

    exam.status = 'published';
    await exam.save();

    res.json({ message: 'Results published successfully. Students can now view them.', exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current student's published exam results
// @route   GET /api/exams/my-results
// @access  Private (Student)
export const getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Only get results where the examination has status 'published'
    const results = await Result.find({ student: student._id })
      .populate({
        path: 'examination',
        match: { status: 'published' },
        select: 'examName date maxMarks status'
      })
      .populate('course', 'courseName courseCode creditHours')
      .sort({ createdAt: -1 });

    // Filter out results where matching exam is null (not published)
    const publishedResults = results.filter(record => record.examination !== null);

    res.json(publishedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
