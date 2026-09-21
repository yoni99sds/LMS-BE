import mongoose from 'mongoose';

const scormProgressSchema = new mongoose.Schema(
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
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson reference is required'],
      index: true
    },
    scormVersion: {
      type: String,
      enum: ['1.2', '2004'],
      required: [true, 'SCORM version (1.2 or 2004) is required']
    },
    // cmi: Stores the SCORM data model state (location, status, score, suspend_data, etc.)
    cmi: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index for student progress in a specific SCORM lesson
scormProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

const ScormProgress = mongoose.model('ScormProgress', scormProgressSchema);

export default ScormProgress;
