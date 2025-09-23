import React, { useEffect, useState, useContext } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import { LuArrowRight } from "react-icons/lu";
import TaskListTable from "../../components/TaskListTable";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";
import { toast } from "react-hot-toast";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"]; 

const UserDashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const [traineeData, setTraineeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prepare Chart Data (legacy admin/user)
  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevels = data?.taskPriorityLevels || null;

    const taskDistributionData = [
      { status: "Pending", count: taskDistribution?.Pending || 0 },
      { status: "In Progress", count: taskDistribution?.InProgress || 0 },
      { status: "Completed", count: taskDistribution?.Completed || 0 },
    ];

    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      { priority: "Low", count: taskPriorityLevels?.Low || 0 },
      { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
      { priority: "High", count: taskPriorityLevels?.High || 0 },
    ];

    setBarChartData(PriorityLevelData);
  };

  // Fetch legacy dashboard data (non-trainee)
  const getLegacyDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_USER_DASHBOARD_DATA
      );
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  };

  // Fetch trainee dashboard
  const getTraineeDashboard = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DASHBOARD.TRAINEE);
      setTraineeData(res.data);
    } catch (err) {
      console.error("Error loading trainee dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const onSeeMore = () => {
    navigate('/admin/tasks')
  }

  const handleClockOut = async () => {
    try {
      // Enforce 1-hour minimum
      const today = traineeData?.todayAttendance || null;
      const clockIn = today?.clockInTime ? new Date(today.clockInTime) : null;
      if (!clockIn) {
        toast.error('You must clock in first');
        return;
      }
      const diffHours = (Date.now() - clockIn.getTime()) / (1000 * 60 * 60);
      if (diffHours < 1) {
        toast.error('You should clock out after one hour.');
        return;
      }

      const res = await axiosInstance.post(API_PATHS.ATTENDANCE.CLOCK_OUT, {});
      const t = res?.data?.clockOutTime
        ? new Date(res.data.clockOutTime).toLocaleTimeString()
        : new Date().toLocaleTimeString();
      toast.success(`Clocked out at ${t}`);
      // refresh dashboard
      await getTraineeDashboard();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Clock-out failed';
      toast.error(msg);
    }
  };

  const handleClockIn = async () => {
    try {
      const res = await axiosInstance.post(API_PATHS.ATTENDANCE.CLOCK_IN, {});
      const t = res?.data?.clockInTime
        ? new Date(res.data.clockInTime).toLocaleTimeString()
        : new Date().toLocaleTimeString();
      toast.success(`You have successfully clocked in at ${t}`);
      await getTraineeDashboard();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Clock-in failed';
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role === "trainee") {
      getTraineeDashboard();
    } else {
      getLegacyDashboardData();
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="my-6">Loading...</div>
      </DashboardLayout>
    );
  }

  // Trainee Dashboard UI
  if (user?.role === "trainee") {
    const overview = traineeData?.overview || {};
    const today = traineeData?.todayAttendance || null;
    const recentPlans = traineeData?.recentDayPlans || [];
    const recentObservations = traineeData?.recentObservations || [];

    const isClockedIn = !!today?.clockInTime;
    const isClockedOut = !!today?.clockOutTime;

    return (
      <DashboardLayout activeMenu="Dashboard">
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
              label="Today's Clock In"
              value={today?.clockInTime ? moment(today.clockInTime).format('h:mm A') : '-'}
              color="bg-primary"
            />
            <InfoCard
              label="Today's Clock Out"
              value={today?.clockOutTime ? moment(today.clockOutTime).format('h:mm A') : '-'}
              color="bg-violet-500"
            />
            <InfoCard
              label="Total Hours"
              value={(today?.totalHours || 0).toFixed(2)}
              color="bg-cyan-500"
            />
            <InfoCard
              label="Unread Notifications"
              value={addThousandsSeparator(overview?.unreadNotifications || 0)}
              color="bg-lime-500"
            />
          </div>

          <div className="mt-5 flex gap-3">
            {!isClockedIn && (
              <button className="btn-primary" onClick={handleClockIn}>Clock In</button>
            )}
            {isClockedIn && !isClockedOut && (
              <button className="btn-primary" onClick={handleClockOut}>Clock Out</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Recent Day Plans</h5>
            </div>
            <div className="mt-4 space-y-3">
              {recentPlans.length === 0 && (
                <p className="text-sm text-gray-500">No day plans assigned yet.</p>
              )}
              {recentPlans.map((p) => (
                <div key={p._id} className="p-3 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-gray-500">{moment(p.date).format('DD MMM YYYY')} • Trainer: {p?.trainer?.name}</p>
                    </div>
                    <span className="text-xs uppercase">{p.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Tasks: {p.tasks?.filter(t => t.status === 'completed').length || 0}/{p.tasks?.length || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Recent Observations</h5>
            </div>
            <div className="mt-4 space-y-3">
              {recentObservations.length === 0 && (
                <p className="text-sm text-gray-500">No observations yet.</p>
              )}
              {recentObservations.map((o) => (
                <div key={o._id} className="p-3 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{moment(o.date).format('DD MMM YYYY')}</p>
                      <p className="text-xs text-gray-500">Trainer: {o?.trainer?.name}</p>
                    </div>
                    <span className="text-xs uppercase">{o.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">Overall Rating: {o.overallRating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Default/legacy dashboard UI
  return (
    <DashboardLayout activeMenu="Dashboard">
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
            label="Total Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.All || 0
            )}
            color="bg-primary"
          />

          <InfoCard
            label="Pending Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Pending || 0
            )}
            color="bg-violet-500"
          />

          <InfoCard
            label="In Progress Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />

          <InfoCard
            label="Completed Tasks"
            value={addThousandsSeparator(
              dashboardData?.charts?.taskDistribution?.Completed || 0
            )}
            color="bg-lime-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Distribution</h5>
            </div>

            <CustomPieChart
              data={pieChartData}
              colors={COLORS}
            />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Priority Levels</h5>
            </div>

            <CustomBarChart
              data={barChartData}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between ">
              <h5 className="text-lg">Recent Tasks</h5>

              <button className="card-btn" onClick={onSeeMore}>
                See All <LuArrowRight className="text-base" />
              </button>
            </div>

            <TaskListTable tableData={dashboardData?.recentTasks || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
