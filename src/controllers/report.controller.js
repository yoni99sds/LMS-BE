import reportService from '../services/report.service.js';
import catchAsync from '../utils/catchAsync.js';

export const reportController = {
  getPlatformOverview: catchAsync(async (req, res) => {
    const report = await reportService.getPlatformOverviewReport();
    res.status(200).json({
      status: 'success',
      data: { report }
    });
  }),

  getInstructorPerformance: catchAsync(async (req, res) => {
    // If Admin, they can pass target instructorId as query parameter, otherwise it defaults to the logged-in instructor
    const instructorId = req.user.role === 'Admin' && req.query.instructorId 
      ? req.query.instructorId 
      : req.user._id;

    const report = await reportService.getInstructorPerformanceReport(instructorId);
    
    res.status(200).json({
      status: 'success',
      data: { report }
    });
  })
};

export default reportController;
