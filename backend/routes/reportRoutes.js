const express = require("express");
const { protect, masterTrainerOnly, trainerOnly, requireRoles } = require("../middlewares/authMiddleware");
const {
  generateAttendanceReport,
  generateDayPlanComplianceReport,
  generateObservationReport,
  generateAssignmentReport,
  generateAuditLog
} = require("../controllers/reportController");

const router = express.Router();

// Attendance reports
router.get("/attendance", protect, requireRoles(["master_trainer", "trainer"]), generateAttendanceReport);

// Day plan compliance reports
router.get("/day-plan-compliance", protect, requireRoles(["master_trainer", "trainer"]), generateDayPlanComplianceReport);

// Observation reports
router.get("/observations", protect, requireRoles(["master_trainer", "trainer"]), generateObservationReport);

// Assignment reports (Master Trainer only)
router.get("/assignments", protect, masterTrainerOnly, generateAssignmentReport);

// Audit log (Master Trainer only)
router.get("/audit", protect, masterTrainerOnly, generateAuditLog);

module.exports = router;
