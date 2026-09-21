import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [100, 'Assignment title cannot exceed 100 characters']
    },
    instructions: {
      type: String,
      required: [true, 'Instructions are required']
    },
    dueDate: {
      type: Date
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [0, 'Max score cannot be negative']
    },
    fileAttachmentUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
