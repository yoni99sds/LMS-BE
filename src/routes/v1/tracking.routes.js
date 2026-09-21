import express from 'express';
import trackingController from '../../controllers/tracking.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validator.middleware.js';
import { scormCommitValidator } from '../../utils/validators.js';

const router = express.Router();

router.use(protect);

// SCORM routes
router.post('/scorm/commit', scormCommitValidator, validateRequest, trackingController.commitScormProgress);
router.get('/scorm/progress/:lessonId', trackingController.getScormProgress);

// xAPI LRS routes
router.post('/xapi/statements', trackingController.postStatements);
router.get('/xapi/statements', trackingController.getStatements);

export default router;
