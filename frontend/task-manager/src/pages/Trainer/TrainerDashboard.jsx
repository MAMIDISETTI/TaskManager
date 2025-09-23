import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight, LuClock, LuUsers, LuCalendar, LuEye, LuLogIn } from "react-icons/lu";
import { toast } from "react-hot-toast";
import TraineesPopup from "../../components/TraineesPopup";

const TrainerDashboard = () => {
  const { user } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [showTraineesPopup, setShowTraineesPopup] = useState(false);

  // Fetch trainer dashboard data
  const getTrainerDashboard = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DASHBOARD.TRAINER);
      console.log("Trainer Dashboard Response:", res.data);
      setDashboardData(res.data);
      
      // Check today's attendance status
      const today = res.data?.overview?.todayClockIn;
      setIsClockedIn(!!today);
      setIsClockedOut(!!res.data?.overview?.todayClockOut);
    } catch (err) {
      console.error("Error loading trainer dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto clock-in on login
  const handleAutoClockIn = async () => {
    try {
      const res = await axiosInstance.post(API_PATHS.ATTENDANCE.CLOCK_IN, {});
      const t = res?.data?.clockInTime
        ? new Date(res.data.clockInTime).toLocaleTimeString()
        : new Date().toLocaleTimeString();
      toast.success(`Clocked in at ${t}`);
      setIsClockedIn(true);
      await getTrainerDashboard();
    } catch (err) {
      console.error("Error clocking in", err);
      toast.error("Failed to clock in");
    }
  };

  // Auto clock-out on logout
  const handleAutoClockOut = async () => {
    try {
      const res = await axiosInstance.post(API_PATHS.ATTENDANCE.CLOCK_OUT, {});
      const t = res?.data?.clockOutTime
        ? new Date(res.data.clockOutTime).toLocaleTimeString()
        : new Date().toLocaleTimeString();
      toast.success(`Clocked out at ${t}`);
      setIsClockedOut(true);
      await getTrainerDashboard();
    } catch (err) {
      console.error("Error clocking out", err);
      toast.error("Failed to clock out");
    }
  };

  useEffect(() => {
    getTrainerDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const overview = dashboardData?.overview || {};
  const stats = dashboardData?.stats || {};

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trainer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Manage your trainees and track progress.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setShowTraineesPopup(true)}
            className="card-btn"
          >
            <LuUsers className="text-base" />
            <span>Assigned Trainees</span>
            <LuArrowRight className="text-base" />
          </button>
          
          <button
            onClick={() => window.location.href = '/trainer/day-plans'}
            className="card-btn"
          >
            <LuCalendar className="text-base" />
            <span>Create Day Plan</span>
            <LuArrowRight className="text-base" />
          </button>
          
          <button
            onClick={() => window.location.href = '/trainer/observations'}
            className="card-btn"
          >
            <LuEye className="text-base" />
            <span>Record Observation</span>
            <LuArrowRight className="text-base" />
          </button>
          
          <button
            onClick={() => window.location.href = '/trainer/attendance-overview'}
            className="card-btn"
          >
            <LuClock className="text-base" />
            <span>View Attendance</span>
            <LuArrowRight className="text-base" />
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <InfoCard
            title="Total Trainees"
            value={stats.totalTrainees || 0}
            icon={LuUsers}
            color="blue"
          />
          <InfoCard
            title="Total Day Plans"
            value={stats.totalDayPlans || 0}
            icon={LuCalendar}
            color="green"
          />
          <InfoCard
            title="Total Observations"
            value={stats.totalObservations || 0}
            icon={LuEye}
            color="purple"
          />
          <InfoCard
            title="Today's Clock In"
            value={overview.todayClockIn ? moment(overview.todayClockIn).format('h:mm A') : 'Not clocked in'}
            icon={LuLogIn}
            color="orange"
          />
        </div>

        {/* Recent Activity or Additional Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Trainees Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Assigned Trainees</h5>
              <button 
                className="card-btn" 
                onClick={() => setShowTraineesPopup(true)}
              >
                View All <LuArrowRight className="text-base" />
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData?.assignedTrainees?.length > 0 ? (
                dashboardData.assignedTrainees.slice(0, 5).map((trainee) => (
                  <div key={trainee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{trainee.name}</p>
                      <p className="text-xs text-gray-500">{trainee.email}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <LuUsers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No assigned trainees</p>
                  <p className="text-xs text-gray-400 mt-1">Contact admin to assign trainees to you</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Day Plans Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Recent Day Plans</h5>
              <button 
                className="card-btn" 
                onClick={() => window.location.href = '/trainer/day-plans'}
              >
                View All <LuArrowRight className="text-base" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">No recent day plans</p>
            </div>
          </div>
        </div>

        {/* Trainees Popup */}
        {showTraineesPopup && (
          <TraineesPopup
            isOpen={showTraineesPopup}
            onClose={() => setShowTraineesPopup(false)}
            trainees={dashboardData?.assignedTrainees || []}
            title="Assigned Trainees"
            showAssignmentStatus={true}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;