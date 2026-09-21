import certificateRepository from '../repositories/certificate.repository.js';
import courseRepository from '../repositories/course.repository.js';
import AppError from '../utils/AppError.js';

export const certificateService = {
  issueCertificate: async (studentId, courseId) => {
    // Check if certificate already issued
    const existing = await certificateRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) {
      return existing;
    }

    // Verify course exists
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // In a real application, you would generate a PDF and store it in an S3 bucket
    // We will save with a mock PDF URL and auto-generated UUID certificate hash
    const pdfUrl = `/uploads/certificates/${studentId}_${courseId}.pdf`;

    return await certificateRepository.create({
      studentId,
      courseId,
      pdfUrl
    });
  },

  verifyCertificate: async (hash) => {
    const certificate = await certificateRepository.findByHash(hash);
    if (!certificate) {
      throw new AppError('Certificate not found or verification hash is invalid', 404);
    }
    return certificate;
  },

  getStudentCertificates: async (studentId) => {
    return await certificateRepository.find({ studentId }, 'courseId');
  }
};

export default certificateService;
