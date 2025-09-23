import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuCalendar, LuCheck, LuClock, LuUsers, LuUserCheck } from 'react-icons/lu';
import { addThousandsSeparator } from '../../utils/helper';

const MasterTrainerDayPlans = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('trainee'); // 'trainee' or 'trainer'
  const [loading, setLoading] = useState(true);
  const [traineeStats, setTraineeStats] = useState({
    totalPlans: 0,
    completed: 0,
    inProgress: 0
  });
  const [trainerStats, setTrainerStats] = useState({
    totalPlans: 0
  });

  // Fetch trainee day plan statistics
  const getTraineeStats = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DAY_PLANS.LIST, {
        params: { 
          role: 'trainee',
          stats: true 
        }
      });
      
      const data = res.data;
      setTraineeStats({
        totalPlans: data.totalPlans || 0,
        completed: data.completed || 0,
        inProgress: data.inProgress || 0
      });
    } catch (err) {
      console.error("Error fetching trainee day plan stats:", err);
    }
  };

  // Fetch trainer day plan statistics
  const getTrainerStats = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.DAY_PLANS.LIST, {
        params: { 
          role: 'trainer',
          stats: true 
        }
      });
      
      const data = res.data;
      setTrainerStats({
        totalPlans: data.totalPlans || 0
      });
    } catch (err) {
      console.error("Error fetching trainer day plan stats:", err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        getTraineeStats(),
        getTrainerStats()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Day Plans">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Day Plans">
      <div className="my-5">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Day Plans Management</h1>
            <p className="text-gray-600 mt-1">Monitor and track day plans for trainers and trainees</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('trainee')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trainee'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LuUserCheck className="w-4 h-4" />
                Trainee Day Plans
              </div>
            </button>
            <button
              onClick={() => setActiveTab('trainer')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'trainer'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LuUsers className="w-4 h-4" />
                Trainer Day Plans
              </div>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'trainee' && (
          <div className="space-y-6">
            {/* Trainee Day Plans Overview */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trainee Day Plans Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Plans */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <LuCalendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Plans</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {addThousandsSeparator(traineeStats.totalPlans)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Completed Plans */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-500 rounded-full">
                      <LuCheck className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Completed</p>
                      <p className="text-2xl font-bold text-green-900">
                        {addThousandsSeparator(traineeStats.completed)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* In Progress Plans */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-500 rounded-full">
                      <LuClock className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">In Progress</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {addThousandsSeparator(traineeStats.inProgress)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {traineeStats.totalPlans > 0 
                      ? Math.round((traineeStats.completed / traineeStats.totalPlans) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: traineeStats.totalPlans > 0 
                        ? `${(traineeStats.completed / traineeStats.totalPlans) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>


            {/* Additional Trainee Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Plans created today</span>
                    <span className="text-sm font-medium text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Plans completed today</span>
                    <span className="text-sm font-medium text-gray-900">8</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Average completion time</span>
                    <span className="text-sm font-medium text-gray-900">2.5 days</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Most active trainee</span>
                    <span className="text-sm font-medium text-gray-900">John Smith</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Highest completion rate</span>
                    <span className="text-sm font-medium text-gray-900">Sarah Johnson</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Most plans created</span>
                    <span className="text-sm font-medium text-gray-900">Mike Wilson</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trainer' && (
          <div className="space-y-6">
            {/* Trainer Day Plans Overview */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trainer Day Plans Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Total Plans */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <LuCalendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Plans</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {addThousandsSeparator(trainerStats.totalPlans)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Placeholder cards for future metrics */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-400 rounded-full">
                      <LuUsers className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Trainers</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-400 rounded-full">
                      <LuClock className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg. Plans/Trainer</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Trainer Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Trainer Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Plans created this week</span>
                    <span className="text-sm font-medium text-gray-900">45</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Most active trainer</span>
                    <span className="text-sm font-medium text-gray-900">Dr. Smith</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Average plans per trainer</span>
                    <span className="text-sm font-medium text-gray-900">15</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Morning sessions</span>
                    <span className="text-sm font-medium text-gray-900">60%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Afternoon sessions</span>
                    <span className="text-sm font-medium text-gray-900">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Evening sessions</span>
                    <span className="text-sm font-medium text-gray-900">5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MasterTrainerDayPlans;
