import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight, LuClock, LuUsers, LuCalendar, LuEye,LuLogIn } from "react-icons/lu";
import { toast } from "react-hot-toast";
import TraineesPopup from "../../components/TraineesPopup";

const TrainerDashboard = () => {
  const { user } = useContext(UserContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [showTraineesPopup, setShowTraineesPopup] = useState(false);
  const [eodReviews, setEodReviews] = useState([]);
  const [loadingEodReviews, setLoadingEodReviews] = useState(false);

  // Fetch trainer dashboard data
  const getTrainerDashboard = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DASHBOARD.TRAINER);
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
      const msg = err?.response?.data?.message || 'Clock-in failed';
      if (msg.toLowerCase().includes('already')) {
        toast(msg, { icon: "ℹ️" });
        setIsClockedIn(true);
      } else {
        toast.error(msg);
      }
    }
  };

  // Clock out
  const handleClockOut = async () => {
    try {
      const res = await axiosInstance.post(API_PATHS.ATTENDANCE.CLOCK_OUT, {});
      const t = res?.data?.clockOutTime
        ? new Date(res.data.clockOutTime).toLocaleTimeString()
        : new Date().toLocaleTimeString();
      toast.success(`Clocked out at ${t}`);
      setIsClockedOut(true);
      await getTrainerDashboard();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Clock-out failed';
      toast.error(msg);
    }
  };

  // Fetch EOD reviews
  const getEodReviews = async () => {
    try {
      setLoadingEodReviews(true);
      const response = await axiosInstance.get('/api/trainee-dayplans?status=pending');
      setEodReviews(response.data.dayPlans || []);
    } catch (error) {
      console.error('Error fetching EOD reviews:', error);
    } finally {
      setLoadingEodReviews(false);
    }
  };

  // Handle EOD review
  const handleEodReview = async (dayPlanId, status, reviewComments = '') => {
    try {
      const response = await axiosInstance.put(`/api/trainee-dayplans/${dayPlanId}/eod-review`, {
        status,
        reviewComments
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
        getEodReviews(); // Refresh the list
      }
    } catch (error) {
      console.error('Error reviewing EOD update:', error);
      toast.error(error.response?.data?.message || 'Failed to review EOD update');
    }
  };

  useEffect(() => {
    getTrainerDashboard();
    getEodReviews();
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="my-6">Loading...</div>
      </DashboardLayout>
    );
  }

  const overview = dashboardData?.overview || {};
  const assignedTrainees = dashboardData?.assignedTrainees || [];
  const recentDayPlans = dashboardData?.recentDayPlans || [];
  const recentObservations = dashboardData?.recentObservations || [];
  const notifications = dashboardData?.notifications || [];

  return (
    <DashboardLayout activeMenu="Dashboard">
      {/* Auto Clock-in on first load if not already clocked in */}
      {!isClockedIn && !isClockedOut && (
        <div className="card my-5 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">Welcome, {user?.name}!</h3>
              <p className="text-sm text-blue-700">You need to clock in to start your day.</p>
            </div>

            <button
                  onClick={handleAutoClockIn} 
                  className="flex items-center cursor-pointer space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <LuLogIn className="w-6 h-6" />
                  <span className="text-base font-medium">Clock In</span>
                </button>
          </div>
        </div>
      )}

      {/* Clock Out Button */}
      {isClockedIn && !isClockedOut && (
        <div className="card my-5 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-900">You're clocked in!</h3>
              <p className="text-sm text-green-700">Remember to clock out at the end of your day.</p>
            </div>
            <button 
              className="btn-primary bg-green-600 hover:bg-green-700"
              onClick={handleClockOut}
            >
              <LuClock className="mr-2" />
              Clock Out
            </button>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="card my-5">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl font-medium">{user?.name}</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Assigned Trainees"
            value={addThousandsSeparator(overview?.assignedTrainees || 0)}
            color="bg-primary"
            icon={<LuUsers className="text-2xl" />}
          />

          <InfoCard
            label="Total Day Plans"
            value={addThousandsSeparator(overview?.totalDayPlans || 0)}
            color="bg-violet-500"
            icon={<LuCalendar className="text-2xl" />}
          />

          <InfoCard
            label="Total Observations"
            value={addThousandsSeparator(overview?.totalObservations || 0)}
            color="bg-cyan-500"
            icon={<LuEye className="text-2xl" />}
          />

          <InfoCard
            label="Unread Notifications"
            value={addThousandsSeparator(overview?.unreadNotifications || 0)}
            color="bg-lime-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4 md:my-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium">Quick Actions</h5>
          </div>
          <div className="space-y-3">
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              onClick={() => window.location.href = '/trainer/day-plans'}
            >
              <LuCalendar className="w-5 h-5" />
              <span>Create Day Plan</span>
            </button>
            <button 
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              onClick={() => window.location.href = '/trainer/observations'}
            >
              <LuEye className="w-5 h-5" />
              <span>Record Observation</span>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium">Assigned Trainees</h5>
            <button className="card-btn" onClick={() => setShowTraineesPopup(true)}>
              See All <LuArrowRight className="text-base" />
            </button>
          </div>
          <div className="space-y-3">
            {assignedTrainees.length === 0 ? (
              <p className="text-sm text-gray-500">No trainees assigned yet.</p>
            ) : (
              assignedTrainees.slice(0, 5).map((trainee) => (
                <div key={trainee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">{trainee.name}</p>
                    <p className="text-xs text-gray-500">{trainee.email}</p>
                  </div>
                  <div className="text-xs">
                    {trainee.lastClockIn ? (
                      <span className="text-green-600">Clocked In</span>
                    ) : (
                      <span className="text-red-600">Not Clocked In</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium">Recent Day Plans</h5>
            <button className="card-btn" onClick={() => window.location.href = '/trainer/day-plans'}>
              See All <LuArrowRight className="text-base" />
            </button>
          </div>
          <div className="space-y-3">
            {recentDayPlans.length === 0 ? (
              <p className="text-sm text-gray-500">No day plans created yet.</p>
            ) : (
              recentDayPlans.slice(0, 5).map((plan) => (
                <div key={plan._id} className="p-3 bg-gray-50 rounded-md w-64">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{plan.title}</p>
                      <p className="text-xs text-gray-500">{moment(plan.date).format('DD MMM YYYY')}</p>
                    </div>
                    <span className="text-xs uppercase px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {plan.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Tasks: {plan.tasks?.filter(t => t.status === 'completed').length || 0}/{plan.tasks?.length || 0}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Observations */}
      <div className="card my-4">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-medium">Recent Observations</h5>
          <button className="card-btn" onClick={() => window.location.href = '/trainer/observations'}>
            See All <LuArrowRight className="text-base" />
          </button>
        </div>
        <div className="space-y-3">
          {recentObservations.length === 0 ? (
            <p className="text-sm text-gray-500">No observations recorded yet.</p>
          ) : (
            recentObservations.slice(0, 5).map((obs) => (
              <div key={obs._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-sm">{obs.trainee?.name}</p>
                  <p className="text-xs text-gray-500">{moment(obs.date).format('DD MMM YYYY')}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase px-2 py-1 bg-green-100 text-green-800 rounded">
                    {obs.overallRating}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{obs.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="card my-4">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-medium">Recent Notifications</h5>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif._id} className={`p-3 rounded-md ${notif.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-gray-500">{notif.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {moment(notif.createdAt).format('DD MMM')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EOD Reviews */}
      <div className="card my-4">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-lg font-medium">EOD Reviews</h5>
          <span className="text-sm text-gray-500">
            {eodReviews.length} pending review{eodReviews.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="space-y-3">
          {loadingEodReviews ? (
            <p className="text-sm text-gray-500">Loading EOD reviews...</p>
          ) : eodReviews.length === 0 ? (
            <p className="text-sm text-gray-500">No EOD updates pending review.</p>
          ) : (
            eodReviews.map((dayPlan) => (
              <div key={dayPlan._id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{dayPlan.trainee?.name}</p>
                    <p className="text-xs text-gray-500">{moment(dayPlan.date).format('DD MMM YYYY')}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                </div>
                
                {dayPlan.eodUpdate?.overallRemarks && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Overall Remarks:</p>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                      {dayPlan.eodUpdate.overallRemarks}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEodReview(dayPlan._id, 'approved')}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const comments = prompt('Enter rejection comments (optional):');
                      if (comments !== null) {
                        handleEodReview(dayPlan._id, 'rejected', comments);
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      // Show detailed view
                      console.log('View details for day plan:', dayPlan);
                    }}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trainees Popup */}
      <TraineesPopup
        isOpen={showTraineesPopup}
        onClose={() => setShowTraineesPopup(false)}
        trainees={assignedTrainees}
        title="Assigned Trainees"
      />
    </DashboardLayout>
  );
};

export default TrainerDashboard;
