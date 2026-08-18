import mongoose from 'mongoose';

const examinationSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'published'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

const Examination = mongoose.model('Examination', examinationSchema);

export default Examination;
