import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      required: true,
    },
    gpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one result per student per examination
resultSchema.index({ student: 1, examination: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);

export default Result;
