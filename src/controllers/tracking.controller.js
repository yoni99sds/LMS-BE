import ScormProgress from '../models/scormProgress.model.js';
import XapiStatement from '../models/xapiStatement.model.js';
import enrollmentRepository from '../repositories/enrollment.repository.js';
import enrollmentService from '../services/enrollment.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const trackingController = {
  // SCORM Commit (Save Progress)
  commitScormProgress: catchAsync(async (req, res) => {
    const studentId = req.user._id;
    const { courseId, lessonId, scormVersion, cmiData } = req.body;

    // Verify enrollment
    const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
    if (!enrollment) {
      throw new AppError('Student is not enrolled in this course', 400);
    }

    // Find or create progress
    let progress = await ScormProgress.findOne({ studentId, lessonId });

    if (!progress) {
      progress = new ScormProgress({
        studentId,
        courseId,
        lessonId,
        scormVersion,
        cmi: cmiData
      });
    } else {
      // Merge new CMI data into existing
      const currentCmi = progress.cmi ? Object.fromEntries(progress.cmi) : {};
      const mergedCmi = { ...currentCmi, ...cmiData };
      progress.cmi = mergedCmi;
      progress.lastAccessed = Date.now();
    }

    await progress.save();

    // Check if lesson is marked completed in SCORM cmi data
    let isCompleted = false;
    if (scormVersion === '1.2') {
      const status = progress.cmi.get('cmi.core.lesson_status');
      isCompleted = status === 'completed' || status === 'passed';
    } else if (scormVersion === '2004') {
      const compStatus = progress.cmi.get('cmi.completion_status');
      const succStatus = progress.cmi.get('cmi.success_status');
      isCompleted = compStatus === 'completed' || succStatus === 'passed';
    }

    // If completed in SCORM, automatically complete the lesson in enrollment!
    if (isCompleted) {
      await enrollmentService.completeLesson(studentId, courseId, lessonId);
    }

    res.status(200).json({
      status: 'success',
      message: 'SCORM state committed successfully',
      data: { progress }
    });
  }),

  // SCORM Get (Load Progress)
  getScormProgress: catchAsync(async (req, res) => {
    const studentId = req.user._id;
    const { lessonId } = req.params;

    const progress = await ScormProgress.findOne({ studentId, lessonId });

    res.status(200).json({
      status: 'success',
      data: {
        progress: progress || { cmi: {} }
      }
    });
  }),

  // xAPI POST Statements
  postStatements: catchAsync(async (req, res) => {
    const studentId = req.user._id;
    const studentEmail = req.user.email;
    const studentName = req.user.fullName;

    let statements = req.body;
    if (!Array.isArray(statements)) {
      statements = [statements];
    }

    if (statements.length === 0) {
      throw new AppError('No xAPI statements provided', 400);
    }

    // Enforce matching actor credentials to prevent spoofing
    const enrichedStatements = statements.map((stmt) => {
      if (!stmt.actor) stmt.actor = {};
      stmt.actor.mbox = `mailto:${studentEmail}`;
      stmt.actor.name = studentName;
      stmt.stored = Date.now();
      if (!stmt.timestamp) stmt.timestamp = Date.now();
      return stmt;
    });

    const saved = await XapiStatement.insertMany(enrichedStatements);
    const ids = saved.map((s) => s._id);

    // If statement is "completed" an activity, update course enrollment if applicable
    for (const stmt of enrichedStatements) {
      const verbId = stmt.verb ? stmt.verb.id : '';
      const objectId = stmt.object ? stmt.object.id : '';
      
      const isCompletedVerb = 
        verbId.endsWith('completed') || 
        verbId.endsWith('passed') || 
        verbId === 'http://adlnet.gov/expapi/verbs/completed';

      if (isCompletedVerb && objectId) {
        // Find if objectId matches a lesson context
        // Normally, the object.id contains a URL. We check if there's a lesson with this metadata
        // For standard xAPI routing, we can query course/lesson if extensions point to courseId and lessonId
        const contextExtensions = stmt.context?.extensions || {};
        const courseId = contextExtensions['http://example.com/extensions/course-id'];
        const lessonId = contextExtensions['http://example.com/extensions/lesson-id'];

        if (courseId && lessonId) {
          try {
            await enrollmentService.completeLesson(studentId, courseId, lessonId);
          } catch (e) {
            // Silently ignore if course/lesson completes fail due to format
          }
        }
      }
    }

    res.status(200).json(ids);
  }),

  // xAPI GET Statements (LRS Query)
  getStatements: catchAsync(async (req, res) => {
    const { agent, verb, activity, since, until, limit = 50 } = req.query;

    const filter = {};

    // Filter by agent mbox
    if (agent) {
      // agent is passed as JSON string or plain email
      let email = agent;
      try {
        const parsedAgent = JSON.parse(agent);
        email = parsedAgent.mbox || parsedAgent.account?.name;
      } catch (e) {
        // use raw string
      }
      if (email) {
        filter['actor.mbox'] = email.startsWith('mailto:') ? email : `mailto:${email}`;
      }
    } else if (req.user.role === 'Student') {
      // Students can only see their own statements
      filter['actor.mbox'] = `mailto:${req.user.email}`;
    }

    // Filter by verb ID
    if (verb) {
      filter['verb.id'] = verb;
    }

    // Filter by object (activity) ID
    if (activity) {
      filter['object.id'] = activity;
    }

    // Filter by time range
    if (since || until) {
      filter.timestamp = {};
      if (since) filter.timestamp.$gte = new Date(since);
      if (until) filter.timestamp.$lte = new Date(until);
    }

    const statements = await XapiStatement.find(filter)
      .sort('-timestamp')
      .limit(Math.min(parseInt(limit, 10) || 50, 100))
      .exec();

    res.status(200).json({ statements });
  })
};

export default trackingController;
