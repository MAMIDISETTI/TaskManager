import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import { 
  LuArrowRight, 
  LuUsers, 
  LuCalendar, 
  LuEye, 
  LuTrendingUp,
  LuActivity,
  LuTarget,
  LuStar,
  LuPlus,
  LuChevronRight,
  LuUserCheck,
  LuFileText
} from "react-icons/lu";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-6 py-12 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Welcome back, {user?.name}! 👋
                  </h1>
                  <p className="text-xl text-blue-100 mb-6">
                    Manage your trainees and track their progress effectively
                  </p>
                  <div className="flex items-center space-x-6 text-blue-100">
                    <div className="flex items-center space-x-2">
                      <LuUsers className="w-5 h-5" />
                      <span>{stats.totalTrainees || 0} Trainees</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LuCalendar className="w-5 h-5" />
                      <span>{stats.totalDayPlans || 0} Day Plans</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LuEye className="w-5 h-5" />
                      <span>{stats.totalObservations || 0} Observations</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <LuActivity className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setShowTraineesPopup(true)}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <LuUsers className="w-6 h-6 text-blue-600" />
                    </div>
                    <LuChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Trainees</h3>
                  <p className="text-sm text-gray-600 mb-4">View and manage your assigned trainees</p>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTrainees || 0}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button
                onClick={() => window.location.href = '/trainer/day-plans'}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <LuCalendar className="w-6 h-6 text-green-600" />
                    </div>
                    <LuChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Day Plan</h3>
                  <p className="text-sm text-gray-600 mb-4">Plan and schedule training activities</p>
                  <div className="text-2xl font-bold text-green-600">{stats.totalDayPlans || 0}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              
              <button
                onClick={() => window.location.href = '/trainer/observations'}
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <LuEye className="w-6 h-6 text-purple-600" />
                    </div>
                    <LuChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Record Observation</h3>
                  <p className="text-sm text-gray-600 mb-4">Document trainee progress and insights</p>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalObservations || 0}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assigned Trainees Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <LuUsers className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Assigned Trainees</h3>
                        <p className="text-sm text-gray-600">Manage your trainee assignments</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowTraineesPopup(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View All
                      <LuChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {dashboardData?.assignedTrainees?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.assignedTrainees.slice(0, 5).map((trainee, index) => (
                        <div key={trainee._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {trainee.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{trainee.name}</p>
                              <p className="text-sm text-gray-500">{trainee.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Active
                            </span>
                            <LuChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LuUsers className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No assigned trainees</h4>
                      <p className="text-gray-500 mb-4">Contact your administrator to get trainees assigned to you</p>
                      <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        <LuPlus className="w-4 h-4 mr-2" />
                        Request Assignment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Day Plans Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <LuCalendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Recent Day Plans</h3>
                      <p className="text-sm text-gray-600">Your latest training plans</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LuFileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">No recent day plans</h4>
                    <p className="text-xs text-gray-500 mb-4">Create your first day plan to get started</p>
                    <button 
                      onClick={() => window.location.href = '/trainer/day-plans'}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <LuPlus className="w-3 h-3 mr-1" />
                      Create Plan
                    </button>
                  </div>
                </div>
              </div>
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