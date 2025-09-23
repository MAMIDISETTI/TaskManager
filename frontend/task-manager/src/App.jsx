import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import MasterTrainerDashboard from "./pages/MasterTrainer/MasterTrainerDashboard";
import MasterTrainerDayPlans from "./pages/MasterTrainer/DayPlans";
import Assignments from "./pages/MasterTrainer/Assignments";
import MasterTrainerObservations from "./pages/MasterTrainer/Observations";

// BOA pages
import BOADashboard from "./pages/BOA/BOADashboard";
import NewJoiners from "./pages/BOA/NewJoiners";
import AssignTrainees from "./pages/BOA/AssignTrainees";
import UploadResults from "./pages/BOA/UploadResults";
import ReportsStats from "./pages/BOA/ReportsStats";
import BOASettings from "./pages/BOA/Settings";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";

import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";

// Trainer pages
import TrainerDashboard from "./pages/Trainer/TrainerDashboard";
import DayPlans from "./pages/Trainer/DayPlans";
import Observations from "./pages/Trainer/Observations";
import LoggedHoursDashboard from "./pages/Trainer/LoggedHoursDashboard";
import WeeklyOffDashboard from "./pages/Trainer/WeeklyOffDashboard";
import LateByDashboard from "./pages/Trainer/LateByDashboard";
import AbsentDashboard from "./pages/Trainer/AbsentDashboard";

// Trainee pages
import TraineeMainDashboard from "./pages/Trainee/TraineeMainDashboard";
import ProfileSettings from "./pages/Trainee/ProfileSettings";

// Common pages
import Unauthorized from "./pages/Common/Unauthorized";

import PrivateRoute from "./routes/PrivateRoute";
import UserProvider, { UserContext } from "./context/userContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Master Trainer Routes */}
            <Route element={<PrivateRoute allowedRoles={["master_trainer"]} />}>
              <Route path="/master-trainer/dashboard" element={<MasterTrainerDashboard />} />
              <Route path="/master-trainer/day-plans" element={<MasterTrainerDayPlans />} />
              <Route path="/master-trainer/observations" element={<MasterTrainerObservations />} />
              <Route path="/master-trainer/assignments" element={<Assignments />} />
              <Route path="/master-trainer/reports" element={<CreateTask />} />
              <Route path="/master-trainer/users" element={<ManageUsers />} />
            </Route>

            {/* BOA Routes */}
            <Route element={<PrivateRoute allowedRoles={["boa"]} />}>
              <Route path="/boa/dashboard" element={<BOADashboard />} />
              <Route path="/boa/new-joiners" element={<NewJoiners />} />
              <Route path="/boa/assign-trainees" element={<AssignTrainees />} />
              <Route path="/boa/upload-results" element={<UploadResults />} />
              <Route path="/boa/reports-stats" element={<ReportsStats />} />
              <Route path="/boa/settings" element={<BOASettings />} />
            </Route>

            {/* Trainer Routes */}
            <Route element={<PrivateRoute allowedRoles={["trainer"]} />}>
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
              <Route path="/trainer/day-plans" element={<DayPlans />} />
              <Route path="/trainer/observations" element={<Observations />} />
              <Route path="/trainer/logged-hours-dashboard" element={<LoggedHoursDashboard />} />
              <Route path="/trainer/weekly-off-dashboard" element={<WeeklyOffDashboard />} />
              <Route path="/trainer/late-by-dashboard" element={<LateByDashboard />} />
              <Route path="/trainer/absent-dashboard" element={<AbsentDashboard />} />
            </Route>

            {/* Trainee Routes */}
            <Route element={<PrivateRoute allowedRoles={["trainee"]} />}>
              <Route path="/trainee/dashboard" element={<TraineeMainDashboard />} />
              <Route path="/trainee/day-plans" element={<MyTasks />} />
              <Route path="/trainee/attendance" element={<ViewTaskDetails />} />
              <Route path="/trainee/profile-settings" element={<ProfileSettings />} />
            </Route>

            {/* Legacy Admin Routes (keeping for backward compatibility) */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/tasks" element={<ManageTasks />} />
              <Route path="/admin/create-task" element={<CreateTask />} />
              <Route path="/admin/users" element={<ManageUsers />} />
            </Route>

            {/* Legacy User Routes (keeping for backward compatibility) */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/tasks" element={<MyTasks />} />
              <Route
                path="/user/task-details/:id"
                element={<ViewTaskDetails />}
              />
            </Route>

             {/* Default Route */}
            <Route path="/" element={<Root />} />
          </Routes>
        </Router>
      </div>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </UserProvider>
  );
};

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if(loading) return <Outlet />
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Route based on user role
  if (user.role === "master_trainer") {
    return <Navigate to="/master-trainer/dashboard" />;
  } else if (user.role === "boa") {
    return <Navigate to="/boa/dashboard" />;
  } else if (user.role === "trainer") {
    return <Navigate to="/trainer/dashboard" />;
  } else if (user.role === "trainee") {
    return <Navigate to="/trainee/dashboard" />;
  } else if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <Navigate to="/user/dashboard" />;
  }
};