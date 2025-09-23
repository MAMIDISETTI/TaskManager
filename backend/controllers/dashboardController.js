const User = require("../models/User");
const Attendance = require("../models/Attendance");
const DayPlan = require("../models/DayPlan");
const Assignment = require("../models/Assignment");
const Observation = require("../models/Observation");
const Notification = require("../models/Notification");

// @desc    Get Master Trainer Dashboard
// @route   GET /api/dashboard/master-trainer
// @access  Private (Master Trainer)
const getMasterTrainerDashboard = async (req, res) => {
  try {
    const masterTrainerId = req.user.id;
    const { startDate, endDate } = req.query;

    // Set default date range (last 30 days)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateFilter = {
      $gte: startDate ? new Date(startDate) : defaultStartDate,
      $lte: endDate ? new Date(endDate) : defaultEndDate
    };

    // Get all trainers and their assignments
    const trainers = await User.find({ role: "trainer" })
      .populate('assignedTrainees', 'name email employeeId department lastClockIn lastClockOut')
      .select('name email department assignedTrainees createdAt');

    // Get all trainees
    const trainees = await User.find({ role: "trainee" })
      .populate('assignedTrainer', 'name email')
      .select('name email employeeId department assignedTrainer lastClockIn lastClockOut joiningDate');

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          date: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
          },
          lateCount: {
            $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] }
          },
          halfDayCount: {
            $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] }
          },
          averageHours: { $avg: "$totalHours" }
        }
      }
    ]);

    // Get day plan statistics
    const dayPlanStats = await DayPlan.aggregate([
      {
        $match: {
          date: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          publishedPlans: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] }
          },
          completedPlans: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          draftPlans: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] }
          }
        }
      }
    ]);

    // Get observation statistics
    const observationStats = await Observation.aggregate([
      {
        $match: {
          date: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalObservations: { $sum: 1 },
          submittedObservations: {
            $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] }
          },
          reviewedObservations: {
            $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] }
          },
          averageRating: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$overallRating", "excellent"] }, then: 4 },
                  { case: { $eq: ["$overallRating", "good"] }, then: 3 },
                  { case: { $eq: ["$overallRating", "average"] }, then: 2 },
                  { case: { $eq: ["$overallRating", "needs_improvement"] }, then: 1 }
                ],
                default: 0
              }
            }
          }
        }
      }
    ]);

    // Get recent activities
    const recentActivities = await Notification.find({
      recipient: masterTrainerId
    })
    .populate('sender', 'name email role')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get assignment statistics
    const assignmentStats = await Assignment.aggregate([
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          activeAssignments: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          completedAssignments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          totalTraineesAssigned: { $sum: "$totalTrainees" }
        }
      }
    ]);

    res.json({
      overview: {
        totalTrainers: trainers.length,
        totalTrainees: trainees.length,
        assignedTrainees: trainees.filter(t => t.assignedTrainer).length,
        unassignedTrainees: trainees.filter(t => !t.assignedTrainer).length,
        activeAssignments: assignmentStats[0]?.activeAssignments || 0
      },
      attendance: attendanceStats[0] || {
        totalRecords: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        halfDayCount: 0,
        averageHours: 0
      },
      dayPlans: dayPlanStats[0] || {
        totalPlans: 0,
        publishedPlans: 0,
        completedPlans: 0,
        draftPlans: 0
      },
      observations: observationStats[0] || {
        totalObservations: 0,
        submittedObservations: 0,
        reviewedObservations: 0,
        averageRating: 0
      },
      assignments: assignmentStats[0] || {
        totalAssignments: 0,
        activeAssignments: 0,
        completedAssignments: 0,
        totalTraineesAssigned: 0
      },
      trainers,
      trainees,
      recentActivities
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Trainer Dashboard
// @route   GET /api/dashboard/trainer
// @access  Private (Trainer)
const getTrainerDashboard = async (req, res) => {
  try {
    console.log('=== TRAINER DASHBOARD START ===');
    console.log('Request user:', req.user);
    const trainerId = req.user.id;
    const { startDate, endDate } = req.query;
    
    console.log('Trainer ID:', trainerId);
    console.log('Date range:', { startDate, endDate });
    
    // First, let's just try to find the trainer
    console.log('Looking up trainer...');
    const trainer = await User.findById(trainerId)
      .populate('assignedTrainees', 'name email employeeId department lastClockIn lastClockOut')
      .select('name email assignedTrainees');

    if (!trainer) {
      console.log('Trainer not found');
      return res.status(404).json({ message: "Trainer not found" });
    }

    console.log(`Trainer found: ${trainer.name}`);
    console.log('Trainer object keys:', Object.keys(trainer.toObject()));
    console.log('assignedTrainees field:', trainer.assignedTrainees);
    console.log(`Assigned trainees: ${trainer.assignedTrainees ? trainer.assignedTrainees.length : 0}`);
    
    // Ensure assignedTrainees is an array and initialize if needed
    let assignedTrainees = [];
    
    // Check if assignedTrainees exists and is an array
    if (trainer.assignedTrainees && Array.isArray(trainer.assignedTrainees)) {
      assignedTrainees = trainer.assignedTrainees;
    } else {
      console.log('assignedTrainees field is missing or invalid, initializing...');
      // Initialize the field in the database
      await User.findByIdAndUpdate(trainerId, { 
        $set: { assignedTrainees: [] } 
      });
      assignedTrainees = [];
      console.log('assignedTrainees field initialized');
    }
    
    // Return a simple response first to test
    return res.json({
      overview: {
        assignedTrainees: assignedTrainees.length,
        totalDayPlans: 0,
        totalObservations: 0,
        unreadNotifications: 0
      },
      assignedTrainees: assignedTrainees,
      recentDayPlans: [],
      recentObservations: [],
      notifications: []
    });

  } catch (error) {
    console.error('=== TRAINER DASHBOARD ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Trainee Dashboard
// @route   GET /api/dashboard/trainee
// @access  Private (Trainee)
const getTraineeDashboard = async (req, res) => {
  try {
    const traineeId = req.user.id;
    const { startDate, endDate } = req.query;

    // Set default date range (last 30 days)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateFilter = {
      $gte: startDate ? new Date(startDate) : defaultStartDate,
      $lte: endDate ? new Date(endDate) : defaultEndDate
    };

    // Get trainee info
    const trainee = await User.findById(traineeId)
      .populate('assignedTrainer', 'name email')
      .select('name email employeeId department assignedTrainer lastClockIn lastClockOut');

    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          user: traineeId,
          date: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] }
          },
          averageHours: { $avg: "$totalHours" },
          totalHours: { $sum: "$totalHours" }
        }
      }
    ]);

    // Get day plans assigned to trainee
    const dayPlanStats = await DayPlan.aggregate([
      {
        $match: {
          assignedTrainees: traineeId,
          date: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          completedTasks: {
            $sum: {
              $size: {
                $filter: {
                  input: "$tasks",
                  cond: { $eq: ["$$this.status", "completed"] }
                }
              }
            }
          },
          totalTasks: {
            $sum: { $size: "$tasks" }
          }
        }
      }
    ]);

    // Get recent day plans
    const recentDayPlans = await DayPlan.find({ assignedTrainees: traineeId })
      .populate('trainer', 'name email')
      .sort({ date: -1 })
      .limit(5);

    // Get observations about this trainee
    const recentObservations = await Observation.find({ trainee: traineeId })
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get notifications
    const notifications = await Notification.find({ recipient: traineeId })
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get today's attendance status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.findOne({
      user: traineeId,
      date: today
    });

    res.json({
      overview: {
        assignedTrainer: trainee.assignedTrainer,
        totalDayPlans: dayPlanStats[0]?.totalPlans || 0,
        completedTasks: dayPlanStats[0]?.completedTasks || 0,
        totalTasks: dayPlanStats[0]?.totalTasks || 0,
        unreadNotifications: notifications.filter(n => !n.isRead).length,
        todayClockIn: todayAttendance?.clockIn?.time || null,
        todayClockOut: todayAttendance?.clockOut?.time || null
      },
      attendance: attendanceStats[0] || {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        averageHours: 0,
        totalHours: 0
      },
      dayPlans: dayPlanStats[0] || {
        totalPlans: 0,
        completedTasks: 0,
        totalTasks: 0
      },
      recentDayPlans,
      recentObservations,
      notifications,
      todayAttendance: todayAttendance ? {
        clockedIn: !!todayAttendance.clockIn?.time,
        clockedOut: !!todayAttendance.clockOut?.time,
        clockInTime: todayAttendance.clockIn?.time,
        clockOutTime: todayAttendance.clockOut?.time,
        totalHours: todayAttendance.totalHours || 0,
        status: todayAttendance.status
      } : null
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMasterTrainerDashboard,
  getTrainerDashboard,
  getTraineeDashboard
};
