import React, { useState, useEffect } from "react";
import { 
  LuCalendar, 
  LuTrendingUp,
  LuClock,
  LuUsers,
  LuChevronDown,
  LuInfo
} from "react-icons/lu";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Overview = () => {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState("week"); // week, month
  const [selectedWeek, setSelectedWeek] = useState(moment().format("YYYY-[W]WW"));
  const [selectedMonth, setSelectedMonth] = useState(moment().format("YYYY-MM"));
  const [activeFilter, setActiveFilter] = useState("all"); // all, loggedHours, weeklyOff, lateBy, absent

  // Mock data for weekly view
  const weeklyData = [
    { day: "11 Sep", loggedHours: 8.5, weeklyOff: 0, lateBy: 0, absent: 0 },
    { day: "12", loggedHours: 8.0, weeklyOff: 0, lateBy: 0.5, absent: 0 },
    { day: "13", loggedHours: 8.5, weeklyOff: 0, lateBy: 0, absent: 0 },
    { day: "14", loggedHours: 0, weeklyOff: 8.5, lateBy: 0, absent: 0 },
    { day: "15", loggedHours: 8.0, weeklyOff: 0, lateBy: 0, absent: 0 },
    { day: "16", loggedHours: 8.5, weeklyOff: 0, lateBy: 0, absent: 0 },
    { day: "17", loggedHours: 0, weeklyOff: 8.5, lateBy: 0, absent: 0 }
  ];

  // Mock data for monthly view
  const monthlyData = [
    { week: "11 - 17 Aug", loggedHours: 40, weeklyOff: 15, lateBy: 2, absent: 0 },
    { week: "18 - 24 Aug", loggedHours: 42, weeklyOff: 8, lateBy: 1, absent: 0 },
    { week: "25 - 31 Aug", loggedHours: 38, weeklyOff: 12, lateBy: 3, absent: 0 },
    { week: "01 - 07 Sep", loggedHours: 40, weeklyOff: 10, lateBy: 1, absent: 0 },
    { week: "08 - 14 Sep", loggedHours: 35, weeklyOff: 15, lateBy: 0, absent: 0 }
  ];

  const getChartData = () => {
    const data = timePeriod === "week" ? weeklyData : monthlyData;
    
    if (activeFilter === "all") {
      return data;
    }
    
    // Filter data to show only the selected category
    return data.map(item => {
      const filteredItem = { ...item };
      if (activeFilter !== "loggedHours") filteredItem.loggedHours = 0;
      if (activeFilter !== "weeklyOff") filteredItem.weeklyOff = 0;
      if (activeFilter !== "lateBy") filteredItem.lateBy = 0;
      if (activeFilter !== "absent") filteredItem.absent = 0;
      return filteredItem;
    });
  };

  const getXAxisKey = () => {
    return timePeriod === "week" ? "day" : "week";
  };

  const getMetrics = () => {
    const data = getChartData();
    const totalLoggedHours = data.reduce((sum, item) => sum + item.loggedHours, 0);
    const totalWeeklyOff = data.reduce((sum, item) => sum + item.weeklyOff, 0);
    const totalLateBy = data.reduce((sum, item) => sum + item.lateBy, 0);
    const totalAbsent = data.reduce((sum, item) => sum + item.absent, 0);
    
    return {
      totalLoggedHours: totalLoggedHours.toFixed(1),
      totalWeeklyOff: totalWeeklyOff.toFixed(1),
      totalLateBy: totalLateBy.toFixed(1),
      totalAbsent: totalAbsent.toFixed(1)
    };
  };

  const handleLegendClick = (dataKey) => {
    if (activeFilter === dataKey) {
      // If clicking the same filter, show all data
      setActiveFilter("all");
    } else {
      // Filter to show only the selected category
      setActiveFilter(dataKey);
    }
  };

  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => {
          const isActive = activeFilter === entry.dataKey;
          const isAllActive = activeFilter === "all";
          return (
            <div
              key={`item-${index}`}
              className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "bg-blue-100 px-3 py-1 rounded-lg border-2 border-blue-300" 
                  : isAllActive 
                    ? "hover:bg-gray-100 px-3 py-1 rounded-lg" 
                    : "hover:bg-gray-100 px-3 py-1 rounded-lg opacity-60"
              }`}
              onClick={() => handleLegendClick(entry.dataKey)}
            >
              <div
                className={`w-3 h-3 rounded ${
                  isActive ? "ring-2 ring-blue-500" : ""
                }`}
                style={{ backgroundColor: entry.color }}
              />
              <span className={`text-sm font-medium ${
                isActive ? "text-blue-700" : "text-gray-600"
              }`}>
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const metrics = getMetrics();

  return (
    <DashboardLayout activeMenu="Overview">
      <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">My Overview</h1>
          <p className="text-sm md:text-base text-gray-600">Track your personal attendance metrics and performance</p>
        </div>

        {/* Attendance Metrics Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LuTrendingUp className="text-blue-600 text-lg md:text-xl" />
                Attendance Metrics
              </h2>
              {activeFilter !== "all" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Filtered by:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {activeFilter === "loggedHours" && "Logged Hours"}
                    {activeFilter === "weeklyOff" && "Weekly Off / Holiday / Leave"}
                    {activeFilter === "lateBy" && "Late By"}
                    {activeFilter === "absent" && "Absent"}
                  </span>
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
              
            </div>
          </div>

          {/* Chart */}
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={getXAxisKey()} 
                  tick={{ fontSize: 12 }}
                  angle={timePeriod === "month" ? -45 : 0}
                  textAnchor={timePeriod === "month" ? "end" : "middle"}
                  height={timePeriod === "month" ? 80 : 40}
                />
                <YAxis 
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                  domain={[0, 18]}
                  ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="loggedHours" stackId="a" fill="#3b82f6" name="Logged Hours" maxBarSize={60} />
                <Bar dataKey="weeklyOff" stackId="a" fill="#d1d5db" name="Weekly Off / Holiday / Leave" maxBarSize={60} />
                <Bar dataKey="lateBy" stackId="a" fill="#f97316" name="Late By" maxBarSize={60} />
                <Bar dataKey="absent" stackId="a" fill="#dc2626" name="Absent" maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                <LuClock className="text-blue-600 text-lg md:text-xl" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Logged Hours</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{metrics.totalLoggedHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-gray-100 rounded-lg">
                <LuCalendar className="text-gray-600 text-lg md:text-xl" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Weekly Off / Leave</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{metrics.totalWeeklyOff}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-orange-100 rounded-lg">
                <LuTrendingUp className="text-orange-600 text-lg md:text-xl" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Late By</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{metrics.totalLateBy}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 bg-red-100 rounded-lg">
                <LuUsers className="text-red-600 text-lg md:text-xl" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600">Total Absent</p>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{metrics.totalAbsent}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <LuInfo className="text-blue-600 text-lg mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Personal Attendance Overview</h3>
              <p className="text-sm text-blue-700">
                This overview shows your personal attendance metrics. 
                Use the dropdown to switch between weekly and monthly views. 
                Track your logged hours, leave time, late arrivals, and absences to maintain good attendance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
