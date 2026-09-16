const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');

const auth         = require('../controllers/authController');
const student      = require('../controllers/studentController');
const faculty      = require('../controllers/facultyController');
const lab          = require('../controllers/labController');
const equipment    = require('../controllers/equipmentController');
const booking      = require('../controllers/bookingController');
const attendance   = require('../controllers/attendanceController');
const complaint    = require('../controllers/complaintController');
const announcement = require('../controllers/announcementController');
const notif        = require('../controllers/notificationController');
const analytics    = require('../controllers/analyticsController');
const audit        = require('../controllers/auditController');
const chatbot      = require('../controllers/chatbotController');
const experiment   = require('../controllers/experimentController');
const testController = require('../controllers/testController');
const rankController = require('../controllers/rankController');

// ---- AUTH ----
router.post('/auth/login', auth.login);
router.post('/auth/forgot', auth.forgotPassword);
router.post('/auth/reset', auth.resetPassword);
router.get ('/auth/me', verifyToken, auth.me);
router.post('/auth/register', verifyToken, requireRole('hod'), auth.register);
router.post('/auth/verify-code', auth.verifyCode);
router.post('/auth/signup', auth.signup);
router.post('/auth/verify-signup', auth.verifySignupCode);
router.post('/auth/resend-code', auth.resendCode);

// ---- STUDENTS ----
router.get   ('/students',            verifyToken, requireRole('hod','faculty'), student.list);
router.get   ('/students/:id',        verifyToken, student.get);
router.post  ('/students',            verifyToken, requireRole('hod'), student.create);
router.put   ('/students/:id',        verifyToken, requireRole('hod'), student.update);
router.delete('/students/:id',        verifyToken, requireRole('hod'), student.remove);
router.get   ('/students/:id/attendance', verifyToken, student.attendanceSummary);
router.get   ('/students/:id/status',     verifyToken, requireRole('hod','faculty'), student.studentStatus);
router.get   ('/me/attendance',           verifyToken, requireRole('student'), student.attendanceSummary);

// ---- FACULTY ----
router.get   ('/faculty',                      verifyToken, faculty.list);
router.get   ('/faculty/performance-analytics', verifyToken, requireRole('hod','faculty'), faculty.getPerformanceAnalytics);
router.post  ('/faculty/feedback',             verifyToken, requireRole('student'), faculty.submitFeedback);
router.get   ('/faculty/feedback',              verifyToken, faculty.getFacultyFeedback);
router.get   ('/faculty/:id/status',           verifyToken, requireRole('hod'), faculty.facultyStatus);
router.post  ('/faculty',                      verifyToken, requireRole('hod'), faculty.create);
router.put   ('/faculty/:id',                   verifyToken, requireRole('hod'), faculty.update);
router.delete('/faculty/:id',                   verifyToken, requireRole('hod'), faculty.remove);

// ---- LABS ----
router.get   ('/labs',     verifyToken, lab.list);
router.post  ('/labs',     verifyToken, requireRole('hod'), lab.create);
router.put   ('/labs/:id', verifyToken, requireRole('hod'), lab.update);
router.delete('/labs/:id', verifyToken, requireRole('hod'), lab.remove);

// ---- EQUIPMENT ----
router.get   ('/equipment',           verifyToken, equipment.list);
router.post  ('/equipment',           verifyToken, requireRole('hod','faculty'), equipment.create);
router.put   ('/equipment/:id',       verifyToken, requireRole('hod','faculty'), equipment.update);
router.delete('/equipment/:id',       verifyToken, requireRole('hod'), equipment.remove);
router.post  ('/equipment/issue',     verifyToken, requireRole('hod','faculty'), equipment.issue);
router.put   ('/equipment/return/:id',verifyToken, requireRole('hod','faculty'), equipment.returnItem);

// ---- BOOKINGS ----
router.get   ('/bookings',        verifyToken, booking.list);
router.post  ('/bookings',        verifyToken, booking.create);
router.put   ('/bookings/:id',    verifyToken, requireRole('hod','faculty'), booking.decide);
router.delete('/bookings/:id',    verifyToken, booking.cancel);

// ---- ATTENDANCE ----
router.post('/attendance/mark',     verifyToken, requireRole('hod','faculty'), attendance.mark);
router.post('/attendance/bulk',     verifyToken, requireRole('hod','faculty'), attendance.bulkMark);
router.post('/attendance/qr/generate', verifyToken, requireRole('hod','faculty'), attendance.generateQR);
router.post('/attendance/qr/submit',   verifyToken, requireRole('student'), attendance.markByQR);
router.get ('/attendance/active-qr', verifyToken, attendance.getActiveQR);
router.get ('/attendance/live/:lab_id', verifyToken, requireRole('hod','faculty'), attendance.getLiveLabAttendance);
router.post('/attendance/camera',   verifyToken, attendance.markByCamera);
router.get ('/attendance/report',   verifyToken, requireRole('hod','faculty'), attendance.report);

// ---- COMPLAINTS ----
router.get ('/complaints',     verifyToken, complaint.list);
router.post('/complaints',     verifyToken, complaint.create);
router.put ('/complaints/:id', verifyToken, requireRole('hod','faculty'), complaint.update);

// ---- ANNOUNCEMENTS ----
router.get   ('/announcements',           verifyToken, announcement.list);
router.post  ('/announcements',           verifyToken, requireRole('hod','faculty'), announcement.create);
router.put   ('/announcements/:id',       verifyToken, requireRole('hod','faculty'), announcement.update);
router.delete('/announcements/:id',       verifyToken, requireRole('hod'), announcement.remove);
router.post  ('/announcements/:id/read',  verifyToken, announcement.markRead);

// ---- NOTIFICATIONS ----
router.get ('/notifications',         verifyToken, notif.list);
router.put ('/notifications/read-all',verifyToken, notif.markAllRead);
router.put ('/notifications/:id/read',verifyToken, notif.markRead);
router.delete('/notifications',       verifyToken, notif.clearAll);

// ---- ANALYTICS ----
router.get('/analytics/overview',      verifyToken, requireRole('hod','faculty'), analytics.overview);
router.get('/analytics/attendance',    verifyToken, requireRole('hod','faculty'), analytics.attendanceTrend);
router.get('/analytics/labs',          verifyToken, requireRole('hod','faculty'), analytics.labUtilization);
router.get('/analytics/equipment',     verifyToken, requireRole('hod','faculty'), analytics.equipmentStatus);
router.get('/analytics/complaints',    verifyToken, requireRole('hod','faculty'), analytics.complaintResolution);
router.get('/analytics/heatmap',       verifyToken, requireRole('hod','faculty'), analytics.heatmap);
router.get('/analytics/faculty-perf',  verifyToken, requireRole('hod'),          analytics.facultyPerformance);
router.get('/analytics/class-performance', verifyToken, requireRole('hod','faculty'), rankController.getClassPerformance);

// ---- RANKS / LEADERBOARD ----
router.get('/ranks/leaderboard', verifyToken, rankController.getSubjectRanks);

// ---- AUDIT ----
router.get('/audit-logs', verifyToken, requireRole('hod','faculty'), audit.list);

// ---- CHATBOT ----
router.post('/chatbot', verifyToken, chatbot.ask);

// ---- EXPERIMENTS / MANUALS ----
router.get   ('/experiments',        verifyToken, experiment.list);
router.post  ('/experiments',        verifyToken, requireRole('faculty','hod'), experiment.uploadMiddleware, experiment.create);
router.delete('/experiments/:id',    verifyToken, requireRole('faculty','hod'), experiment.remove);

const coding = require('../controllers/codingController');

// ---- TESTS ----
router.post('/tests/generate',            verifyToken, requireRole('hod','faculty'), testController.generateTest);
router.post('/tests/generate-coding',     verifyToken, requireRole('hod','faculty'), testController.generateCodingTest);
router.get ('/tests/created',             verifyToken, requireRole('hod','faculty'), testController.listCreatedTests);
router.get ('/tests/active/:studentId',   verifyToken, testController.listActiveTests);
router.get ('/tests/:testId/submissions',  verifyToken, requireRole('hod','faculty'), testController.getTestSubmissions);
router.get ('/tests/:testId/my-result',   verifyToken, requireRole('student'), testController.getMyTestResult);
router.post('/tests/malpractice-log',     verifyToken, requireRole('student'), testController.logMalpractice);
router.get ('/tests/coding/:testId',       verifyToken, requireRole('student'), testController.getCodingTestDetails);
router.post('/tests/coding/:testId/submit', verifyToken, requireRole('student'), testController.submitCodingTest);
router.get ('/tests/:testId',             verifyToken, testController.getTestDetails);
router.post('/tests/:testId/submit',      verifyToken, requireRole('student'), testController.submitTest);

// ---- HACKERRANK CODING ARENA ----
router.get ('/coding/categories', verifyToken, coding.getCategories);
router.get ('/coding/placement-patterns', verifyToken, coding.getPlacementPatterns);
router.get ('/coding/problems', verifyToken, coding.getProblems);
router.post('/coding/problems', verifyToken, requireRole('hod', 'faculty'), coding.createProblem);
router.get ('/coding/admin/submissions', verifyToken, requireRole('hod', 'faculty'), coding.getAllSubmissionsForAdmin);
router.get ('/coding/admin/analytics', verifyToken, requireRole('hod', 'faculty'), coding.getCodingAnalytics);
router.get ('/coding/problems/:id', verifyToken, coding.getProblemDetails);
router.post('/coding/run', verifyToken, coding.runCode);
router.post('/coding/submit', verifyToken, coding.submitCode);
router.get ('/coding/problems/:id/submissions', verifyToken, coding.getSubmissions);
router.get ('/coding/problems/:id/leaderboard', verifyToken, coding.getLeaderboard);

module.exports = router;
