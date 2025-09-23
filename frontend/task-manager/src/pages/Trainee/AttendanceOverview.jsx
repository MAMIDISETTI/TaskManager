import React, { useState, useEffect } from "react";
import { 
  LuCalendar, 
  LuList, 
  LuEllipsis, 
  LuSearch, 
  LuFilter, 
  LuSettings,
  LuChevronLeft,
  LuChevronRight,
  LuInfo,
  LuTrendingUp,
  LuClock,
  LuChevronDown,
  LuChevronUp
} from "react-icons/lu";
import moment from "moment";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AttendanceOverview = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [viewMode, setViewMode] = useState("calendar"); // calendar, list
  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // New state for chart filtering

  // Mock data for demonstration
  const mockAttendanceData = [
    {
      date: "01-09-2025",
      status: "Present",
      requestStatus: null,
      timeIn: "08:29:12",
      timeOut: "18:54:10",
      workDuration: "10:24:58"
    },
    {
      date: "02-09-2025",
      status: "Present",
      requestStatus: "Attendance Request",
      timeIn: "12:38:35",
      timeOut: "18:00:00",
      workDuration: "05:21:25"
    },
    {
      date: "03-09-2025",
      status: "Present",
      requestStatus: null,
      timeIn: "09:15:20",
      timeOut: "17:45:30",
      workDuration: "08:30:10"
    },
    {
      date: "04-09-2025",
      status: "Present",
      requestStatus: null,
      timeIn: "08:45:15",
      timeOut: "18:15:45",
      workDuration: "09:30:30"
    },
    {
      date: "05-09-2025",
      status: "Present",
      requestStatus: null,
      timeIn: "09:00:00",
      timeOut: "17:30:00",
      workDuration: "08:30:00"
    },
    {
      date: "06-09-2025",
      status: "Present",
      requestStatus: null,
      timeIn: "08:30:00",
      timeOut: "18:00:00",
      workDuration: "09:30:00"
    },
    {
      date: "07-09-2025",
      status: "Weekly Off",
      requestStatus: null,
      timeIn: null,
      timeOut: null,
      workDuration: "00:00:00"
    }
  ];

  useEffect(() => {
    setAttendanceData(mockAttendanceData);
  }, []);

  // Close date picker and dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
      if (openDropdownIndex !== null && !event.target.closest('.dropdown-container')) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, openDropdownIndex]);

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      setCurrentDate(currentDate.clone().subtract(1, "month"));
    } else {
      setCurrentDate(currentDate.clone().add(1, "month"));
    }
  };

  const navigateYear = (direction) => {
    if (direction === "prev") {
      setCurrentDate(currentDate.clone().subtract(1, "year"));
    } else {
      setCurrentDate(currentDate.clone().add(1, "year"));
    }
  };

  const selectMonth = (month) => {
    setCurrentDate(currentDate.clone().month(month));
    setShowDatePicker(false);
  };

  const generateMonthPicker = () => {
    const months = moment.months();
    return months.map((month, index) => (
      <button
        key={index}
        onClick={() => selectMonth(index)}
        className={`p-3 text-sm font-medium rounded-lg transition-colors ${
          currentDate.month() === index
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {month}
      </button>
    ));
  };

  const toggleDropdown = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const handleAttendanceRequest = (index) => {
    console.log(`Attendance request for row ${index}`);
    setOpenDropdownIndex(null);
  };

  const generateCalendarDays = () => {
    const startOfMonth = currentDate.clone().startOf("month");
    const endOfMonth = currentDate.clone().endOf("month");
    const startOfCalendar = startOfMonth.clone().startOf("week");
    const endOfCalendar = endOfMonth.clone().endOf("week");

    const days = [];
    const day = startOfCalendar.clone();

    while (day.isSameOrBefore(endOfCalendar)) {
      days.push(day.clone());
      day.add(1, "day");
    }

    return days;
  };

  const getAttendanceForDate = (date) => {
    const dateStr = date.format("DD-MM-YYYY");
    return attendanceData.find(att => att.date === dateStr);
  };

  const getMetrics = () => {
    const presentDays = attendanceData.filter(att => att.status === "Present");
    const totalWorkHours = presentDays.reduce((total, att) => {
      const [hours, minutes] = att.workDuration.split(":").map(Number);
      return total + hours + minutes / 60;
    }, 0);
    
    const avgWorkDuration = presentDays.length > 0 ? totalWorkHours / presentDays.length : 0;
    const avgLateBy = 1.38; // Mock data

    return {
      avgWorkDuration: avgWorkDuration.toFixed(2),
      avgLateBy: avgLateBy.toFixed(2)
    };
  };

  // Chart data for the metrics section
  const getChartData = () => {
    const days = [];
    const startOfMonth = currentDate.clone().startOf("month");
    const endOfMonth = currentDate.clone().endOf("month");
    
    for (let day = startOfMonth.clone(); day.isSameOrBefore(endOfMonth); day.add(1, 'day')) {
      const attendance = getAttendanceForDate(day);
      const dayData = {
        day: day.format("DD"),
        date: day.format("DD MMM"),
        loggedHours: 0,
        weeklyOff: 0,
        lateBy: 0,
        absent: 0
      };

      if (attendance) {
        if (attendance.status === "Present") {
          const [hours, minutes] = attendance.workDuration.split(":").map(Number);
          dayData.loggedHours = hours + minutes / 60;
          // Check if late (assuming late if timeIn after 9:00 AM)
          const timeIn = moment(attendance.timeIn, "HH:mm:ss");
          const expectedTime = moment("09:00:00", "HH:mm:ss");
          if (timeIn.isAfter(expectedTime)) {
            dayData.lateBy = timeIn.diff(expectedTime, 'hours', true);
          }
        } else if (attendance.status === "Weekly Off" || attendance.status === "Holiday" || attendance.status === "Leave") {
          dayData.weeklyOff = 8.5;
        } else if (attendance.status === "Absent") {
          dayData.absent = 8.5;
        }
      }

      days.push(dayData);
    }

    // Apply filtering
    if (activeFilter === "all") {
      return days;
    }
    
    // Filter data to show only the selected category
    return days.map(item => {
      const filteredItem = { ...item };
      if (activeFilter !== "loggedHours") filteredItem.loggedHours = 0;
      if (activeFilter !== "weeklyOff") filteredItem.weeklyOff = 0;
      if (activeFilter !== "lateBy") filteredItem.lateBy = 0;
      if (activeFilter !== "absent") filteredItem.absent = 0;
      return filteredItem;
    });
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
    <DashboardLayout activeMenu="Attendance">
      <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">My Attendance</h1>
          <p className="text-sm md:text-base text-gray-600">Track your attendance and work hours</p>
        </div>

      {/* Metrics Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <LuTrendingUp className="text-blue-600 text-lg md:text-xl" />
            My Metrics
          </h2>
          <div className="flex items-center gap-2">
            <LuInfo className="text-gray-400 cursor-pointer text-lg md:text-xl" />
            <button
              onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMetricsExpanded ? (
                <LuChevronUp className="text-gray-600 text-lg" />
              ) : (
                <LuChevronDown className="text-gray-600 text-lg" />
              )}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
              <LuTrendingUp className="text-blue-600 text-lg md:text-xl" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Avg. Work Duration</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{metrics.avgWorkDuration} Hrs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-orange-100 rounded-lg">
              <LuClock className="text-orange-600 text-lg md:text-xl" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Avg. Late By</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{metrics.avgLateBy} Hrs</p>
            </div>
          </div>
        </div>

        {/* Collapsible Chart Section */}
        {isMetricsExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Monthly Attendance Overview</h3>
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
            <div className="h-80 w-full">
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
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0] && payload[0].payload) {
                        return payload[0].payload.date;
                      }
                      return value;
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
        )}
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-center justify-between lg:justify-start gap-2 lg:gap-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LuChevronLeft className="text-gray-600 text-lg md:text-xl" />
            </button>
            
            <div className="relative date-picker-container">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  {currentDate.format("MMMM YYYY")}
                </h3>
                <LuChevronRight className="text-gray-600 text-sm rotate-90" />
              </button>
              
              {showDatePicker && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[280px] md:min-w-[300px]">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateYear("prev")}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <LuChevronLeft className="text-gray-600" />
                    </button>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900">
                      {currentDate.format("YYYY")}
                    </h4>
                    <button
                      onClick={() => navigateYear("next")}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <LuChevronRight className="text-gray-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {generateMonthPicker()}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LuChevronRight className="text-gray-600 text-lg md:text-xl" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium flex items-center gap-2">
              <LuInfo className="text-red-600 text-sm" />
              <span className="hidden sm:inline">System Triggered Leave (1)</span>
              <span className="sm:hidden">Leave (1)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "calendar" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LuCalendar className="text-lg" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LuList className="text-lg" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <LuEllipsis className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <div className="grid grid-cols-7 gap-1">
            {/* Days of week header */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
            
            {/* Calendar days */}
            {generateCalendarDays().map((day, index) => {
              const attendance = getAttendanceForDate(day);
              const isCurrentMonth = day.isSame(currentDate, "month");
              const isToday = day.isSame(moment(), "day");
              
              return (
                <div
                  key={index}
                  className={`p-2 md:p-3 min-h-[60px] md:min-h-[80px] border rounded-lg cursor-pointer transition-colors ${
                    isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50 text-gray-400"
                  } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="text-xs md:text-sm font-medium">{day.format("D")}</span>
                    {attendance && attendance.status === "Present" && (
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  
                  {attendance && (
                    <div className="space-y-1">
                      {attendance.requestStatus && (
                        <div className="bg-green-100 text-green-800 text-xs px-1 md:px-2 py-0.5 md:py-1 rounded">
                          <span className="hidden sm:inline">{attendance.requestStatus}</span>
                          <span className="sm:hidden">Request</span>
                        </div>
                      )}
                      {attendance.status === "Weekly Off" && (
                        <div className="bg-gray-100 text-gray-600 text-xs px-1 md:px-2 py-0.5 md:py-1 rounded flex items-center gap-1">
                          <LuCalendar className="text-xs" />
                          <span className="hidden sm:inline">Weekly Off</span>
                          <span className="sm:hidden">Off</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <LuFilter className="text-lg" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <LuSettings className="text-lg" />
                </button>
              </div>
            </div>

            {/* Attendance Table - Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {attendanceData.map((attendance, index) => (
                <div key={index} className="bg-white rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm font-medium text-gray-900">{attendance.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">{attendance.status}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Time In:</span>
                      <span className="ml-2 text-gray-900">{attendance.timeIn || "-"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time Out:</span>
                      <span className="ml-2 text-gray-900">{attendance.timeOut || "-"}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {attendance.requestStatus ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {attendance.requestStatus}
                        </span>
                        <div className="relative dropdown-container">
                          <button
                            onClick={() => toggleDropdown(index)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <LuEllipsis className="text-gray-400 cursor-pointer" />
                          </button>
                          {openDropdownIndex === index && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px] py-1">
                              <button
                                onClick={() => handleAttendanceRequest(index)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Attendance Request
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => toggleDropdown(index)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <LuEllipsis className="text-gray-400 cursor-pointer" />
                        </button>
                        {openDropdownIndex === index && (
                          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px] py-1">
                            <button
                              onClick={() => handleAttendanceRequest(index)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Attendance Request
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Table - Desktop View */}
            <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Out
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.map((attendance, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.date}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-900">{attendance.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {attendance.requestStatus ? (
                            <div className="flex items-center gap-2">
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {attendance.requestStatus}
                              </span>
                              <div className="relative dropdown-container">
                                <button
                                  onClick={() => toggleDropdown(index)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <LuEllipsis className="text-gray-400 cursor-pointer" />
                                </button>
                                {openDropdownIndex === index && (
                                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px] py-1">
                                    <button
                                      onClick={() => handleAttendanceRequest(index)}
                                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      Attendance Request
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="relative dropdown-container">
                              <button
                                onClick={() => toggleDropdown(index)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <LuEllipsis className="text-gray-400 cursor-pointer" />
                              </button>
                              {openDropdownIndex === index && (
                                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px] py-1">
                                  <button
                                    onClick={() => handleAttendanceRequest(index)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    Attendance Request
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.timeIn || "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.timeOut || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceOverview;