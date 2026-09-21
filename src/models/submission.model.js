import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded', 'Late', 'Resubmitted'],
      default: 'Submitted',
      index: true
    },
    submittedText: {
      type: String
    },
    submittedFileUrl: {
      type: String
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative']
    },
    feedback: {
      type: String
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Ensure a student has only one active submission per assignment unless resubmitted
submissionSchema.index({ assignmentId: 1, studentId: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
