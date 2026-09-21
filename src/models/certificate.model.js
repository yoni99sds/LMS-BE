import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    certificateHash: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      index: true
    },
    pdfUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate certificates for same student and course
certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
