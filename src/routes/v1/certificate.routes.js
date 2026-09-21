import express from 'express';
import certificateController from '../../controllers/certificate.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public verification route
router.get('/verify/:hash', certificateController.verify);

// Protected routes
router.get('/student/:studentId?', protect, certificateController.getStudentCertificates);

export default router;
