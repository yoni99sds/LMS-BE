import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [100, 'Lesson title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true
    },
    contentType: {
      type: String,
      enum: ['Video', 'PDF', 'SCORM 1.2', 'SCORM 2004', 'xAPI', 'Text'],
      required: [true, 'Content type is required'],
      default: 'Text'
    },
    contentUrl: {
      type: String,
      trim: true
    },
    contentBody: {
      type: String // Used for Text lessons (HTML or markdown)
    },
    order: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number, // duration in minutes
      default: 0
    },
    isFree: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index to order lessons within a course
lessonSchema.index({ courseId: 1, order: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
