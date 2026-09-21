import certificateService from '../services/certificate.service.js';
import catchAsync from '../utils/catchAsync.js';

export const certificateController = {
  verify: catchAsync(async (req, res) => {
    const certificate = await certificateService.verifyCertificate(req.params.hash);
    res.status(200).json({
      status: 'success',
      valid: true,
      data: {
        certificateId: certificate._id,
        hash: certificate.certificateHash,
        issueDate: certificate.issueDate,
        student: {
          fullName: certificate.studentId.fullName,
          email: certificate.studentId.email
        },
        course: {
          title: certificate.courseId.title
        }
      }
    });
  }),

  getStudentCertificates: catchAsync(async (req, res) => {
    const studentId = req.params.studentId || req.user._id;
    const certificates = await certificateService.getStudentCertificates(studentId);
    
    res.status(200).json({
      status: 'success',
      results: certificates.length,
      data: { certificates }
    });
  })
};

export default certificateController;
