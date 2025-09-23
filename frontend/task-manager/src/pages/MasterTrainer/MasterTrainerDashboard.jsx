import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import TrainersPopup from "../../components/TrainersPopup";
import TraineesPopup from "../../components/TraineesPopup";
import NotificationDropdown from "../../components/NotificationDropdown";
import { LuUsers, LuUserCheck, LuCalendar, LuEye, LuTrendingUp, LuFileText, LuBell } from "react-icons/lu";
import { toast } from "react-hot-toast";

const MasterTrainerDashboard = () => {
  const { user } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrainersPopup, setShowTrainersPopup] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [showTraineesPopup, setShowTraineesPopup] = useState(false);
  const [trainees, setTrainees] = useState([]);
  const [showUnassignedTraineesPopup, setShowUnassignedTraineesPopup] = useState(false);
  const [unassignedTrainees, setUnassignedTrainees] = useState([]);
  const [showAssignedTraineesPopup, setShowAssignedTraineesPopup] = useState(false);
  const [assignedTrainees, setAssignedTrainees] = useState([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Fetch master trainer dashboard data
  const getMasterTrainerDashboard = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DASHBOARD.MASTER_TRAINER);
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error loading master trainer dashboard", err);
    } finally {
      setLoading(false);
    }
  };


  // Fetch trainers data
  const getTrainers = async () => {
    try {
      console.log("Fetching trainers...");
      const res = await axiosInstance.get(API_PATHS.USERS.LIST, {
        params: { role: 'trainer' }
      });
      console.log("Trainers API response:", res.data);
      setTrainers(res.data.users || res.data || []);
    } catch (err) {
      console.error("Error fetching trainers:", err);
      toast.error("Failed to fetch trainers data");
    }
  };

  // Fetch trainees data
  const getTrainees = async () => {
    try {
      console.log("Fetching trainees...");
      const res = await axiosInstance.get(API_PATHS.USERS.LIST, {
        params: { role: 'trainee' }
      });
      console.log("Trainees API response:", res.data);
      setTrainees(res.data.users || res.data || []);
    } catch (err) {
      console.error("Error fetching trainees:", err);
      toast.error("Failed to fetch trainees data");
    }
  };

  // Fetch unassigned trainees data
  const getUnassignedTrainees = async () => {
    try {
      console.log("Fetching unassigned trainees...");
      
      // First, let's check all trainees to see what we have
      const allTraineesRes = await axiosInstance.get(API_PATHS.USERS.LIST, {
        params: { role: 'trainee' }
      });
      console.log("All trainees:", allTraineesRes.data);
      
      // Then get unassigned trainees
      const res = await axiosInstance.get(API_PATHS.USERS.LIST, {
        params: { role: 'trainee', unassigned: 'true' }
      });
      console.log("Unassigned trainees API response:", res.data);
      console.log("Unassigned trainees count:", res.data?.users?.length || 0);
      setUnassignedTrainees(res.data.users || res.data || []);
    } catch (err) {
      console.error("Error fetching unassigned trainees:", err);
      console.error("Error details:", err.response?.data);
      toast.error("Failed to fetch unassigned trainees data");
    }
  };

  // Fetch assigned trainees data
  const getAssignedTrainees = async () => {
    try {
      console.log("Fetching assigned trainees...");
      
      // Get all trainees and filter for assigned ones
      const res = await axiosInstance.get(API_PATHS.USERS.LIST, {
        params: { role: 'trainee' }
      });
      
      // Filter for assigned trainees (those with assignedTrainer)
      const assignedTraineesData = (res.data.users || res.data || []).filter(trainee => trainee.assignedTrainer);
      console.log("Assigned trainees:", assignedTraineesData);
      console.log("Assigned trainees count:", assignedTraineesData.length);
      setAssignedTrainees(assignedTraineesData);
    } catch (err) {
      console.error("Error fetching assigned trainees:", err);
      console.error("Error details:", err.response?.data);
      toast.error("Failed to fetch assigned trainees data");
    }
  };

  // Fetch unread notification count
  const getUnreadNotificationCount = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.NOTIFICATIONS.UNREAD_COUNT);
      setUnreadNotificationCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
    }
  };

  // Handle trainers popup
  const handleTrainersClick = () => {
    setShowTrainersPopup(true);
    if (trainers.length === 0) {
      getTrainers();
    }
  };

  // Handle trainees popup
  const handleTraineesClick = () => {
    setShowTraineesPopup(true);
    if (trainees.length === 0) {
      getTrainees();
    }
  };

  // Handle unassigned trainees popup
  const handleUnassignedTraineesClick = () => {
    setShowUnassignedTraineesPopup(true);
    if (unassignedTrainees.length === 0) {
      getUnassignedTrainees();
    }
  };

  const handleAssignedTraineesClick = () => {
    setShowAssignedTraineesPopup(true);
    if (assignedTrainees.length === 0) {
      getAssignedTrainees();
    }
  };


  useEffect(() => {
    getMasterTrainerDashboard();
    getUnassignedTrainees(); // Fetch unassigned trainees on component load
    getAssignedTrainees(); // Fetch assigned trainees on component load
    getUnreadNotificationCount(); // Fetch unread notification count
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      {/* Welcome Section */}
      <div className="card my-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl font-medium">Welcome, {user?.name}</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
          
          {/* Clock In/Out Section */}
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationDropdown(true)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LuBell className="w-6 h-6" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Trainers"
            value={addThousandsSeparator(dashboardData?.overview?.totalTrainers || 0)}
            color="bg-blue-500"
            icon={<LuUsers className="w-5 h-5" />}
            onClick={handleTrainersClick}
            clickable={true}
          />

          <InfoCard
            label="Total Trainees"
            value={addThousandsSeparator(dashboardData?.overview?.totalTrainees || 0)}
            color="bg-green-500"
            icon={<LuUserCheck className="w-5 h-5" />}
            onClick={handleTraineesClick}
            clickable={true}
          />

          <InfoCard
            label="Assigned Trainees"
            value={addThousandsSeparator(dashboardData?.overview?.assignedTrainees || 0)}
            color="bg-emerald-500"
            icon={<LuUserCheck className="w-5 h-5" />}
            onClick={handleAssignedTraineesClick}
            clickable={true}
          />

          <InfoCard
            label="Unassigned Trainees"
            value={addThousandsSeparator(dashboardData?.overview?.unassignedTrainees || 0)}
            color="bg-orange-500"
            icon={<LuUsers className="w-5 h-5" />}
            onClick={handleUnassignedTraineesClick}
            clickable={true}
          />

          <InfoCard
            label="Active Assignments"
            value={addThousandsSeparator(dashboardData?.overview?.activeAssignments || 0)}
            color="bg-purple-500"
            icon={<LuCalendar className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4 md:my-6">

        {/* Day Plans Statistics */}
        <div 
          className="card cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => window.location.href = '/master-trainer/day-plans'}
        >
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-gray-700">Day Plans</h5>
            <LuCalendar className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Plans</span>
              <span className="font-semibold text-gray-800">
                {dashboardData?.dayPlans?.totalPlans || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Published</span>
              <span className="font-semibold text-green-600">
                {dashboardData?.dayPlans?.publishedPlans || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-blue-600">
                {dashboardData?.dayPlans?.completedPlans || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Draft</span>
              <span className="font-semibold text-orange-600">
                {dashboardData?.dayPlans?.draftPlans || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Observations Statistics */}
        <div 
          className="card cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => window.location.href = '/master-trainer/observations'}
        >
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-gray-700">Observations</h5>
            <LuEye className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-gray-800">
                {dashboardData?.observations?.totalObservations || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Submitted</span>
              <span className="font-semibold text-blue-600">
                {dashboardData?.observations?.submittedObservations || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Reviewed</span>
              <span className="font-semibold text-green-600">
                {dashboardData?.observations?.reviewedObservations || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Rating</span>
              <span className="font-semibold text-purple-600">
                {dashboardData?.observations?.averageRating?.toFixed(1) || 0}/4
              </span>
            </div>
          </div>
        </div>

        {/* Assignments Statistics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-gray-700">Assignments</h5>
            <LuFileText className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-gray-800">
                {dashboardData?.assignments?.totalAssignments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active</span>
              <span className="font-semibold text-green-600">
                {dashboardData?.assignments?.activeAssignments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-semibold text-blue-600">
                {dashboardData?.assignments?.completedAssignments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trainees Assigned</span>
              <span className="font-semibold text-purple-600">
                {dashboardData?.assignments?.totalTraineesAssigned || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trainers and Trainees Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4 md:my-6">
        {/* Trainers List */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-medium">Trainers</h5>
            <span className="text-sm text-gray-500">
              {dashboardData?.trainers?.length || 0} total
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData?.trainers?.length > 0 ? (
              dashboardData.trainers.map((trainer, index) => (
                <div key={trainer._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h6 className="font-medium text-sm">{trainer.name}</h6>
                    <p className="text-xs text-gray-600">{trainer.email}</p>
                    <p className="text-xs text-gray-500">
                      {trainer.assignedTrainees?.length || 0} trainees assigned
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {trainer.department || 'No department'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No trainers found</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-medium">Recent Activities</h5>
            <LuTrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData?.recentActivities?.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div key={activity._id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {moment(activity.createdAt).format('MMM DD, YYYY HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Trainers Popup */}
      <TrainersPopup
        isOpen={showTrainersPopup}
        onClose={() => setShowTrainersPopup(false)}
        trainers={trainers}
      />

      {/* Trainees Popup */}
      <TraineesPopup
        isOpen={showTraineesPopup}
        onClose={() => setShowTraineesPopup(false)}
        trainees={trainees}
        title="Total Trainees"
      />

      {/* Unassigned Trainees Popup */}
      <TraineesPopup
        isOpen={showUnassignedTraineesPopup}
        onClose={() => setShowUnassignedTraineesPopup(false)}
        trainees={unassignedTrainees}
        title="Unassigned Trainees"
      />

      {/* Assigned Trainees Popup */}
      <TraineesPopup
        isOpen={showAssignedTraineesPopup}
        onClose={() => setShowAssignedTraineesPopup(false)}
        trainees={assignedTrainees}
        title="Assigned Trainees"
      />

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={showNotificationDropdown}
        onClose={() => setShowNotificationDropdown(false)}
      />
    </DashboardLayout>
  );
};

export default MasterTrainerDashboard;
