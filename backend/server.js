require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const taskRoutes = require("./routes/taskRoutes")
const reportRoutes = require("./routes/reportRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")
const dayPlanRoutes = require("./routes/dayPlanRoutes")
const assignmentRoutes = require("./routes/assignmentRoutes")
const observationRoutes = require("./routes/observationRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const joinerRoutes = require("./routes/joinerRoutes")
const resultRoutes = require("./routes/resultRoutes")
const traineeDayPlanRoutes = require("./routes/traineeDayPlanRoutes")

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Specific origin required when credentials: true
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies to be sent
  })
);

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dayplans", dayPlanRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/joiners", joinerRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/trainee-dayplans", traineeDayPlanRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});