import {
    LuLayoutDashboard,
    LuUsers,
    LuUser,
    LuClipboardCheck,
    LuSquarePlus,
    LuLogOut,
    LuCalendar,
    LuEye,
    LuClock,
    LuChevronDown,
    LuUserPlus,
    LuFileSpreadsheet,
    LuTrendingUp,
    LuSettings,
    LuChevronRight,
    LuFileText,
    LuTarget
  } from "react-icons/lu";
  
  
  export const SIDE_MENU_DATA = [
    {
      id: "01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      id: "02",
      label: "Manage Tasks",
      icon: LuClipboardCheck,
      path: "/admin/tasks",
    },
    {
      id: "03",
      label: "Create Task",
      icon: LuSquarePlus,
      path: "/admin/create-task",
    },
    {
      id: "04",
      label: "Team Members",
      icon: LuUsers,
      path: "/admin/users",
    },
    {
      id: "05",
      label: "Logout",
      icon: LuLogOut,
      path: "logout",
    },
  ];
  
  export const SIDE_MENU_USER_DATA = [
    {
      id: "01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/user/dashboard",
    },
    {
      id: "02",
      label: "My Tasks",
      icon: LuClipboardCheck,
      path: "/user/tasks",
    },
    {
      id: "05",
      label: "Logout",
      icon: LuLogOut,
      path: "logout",
    },
  ];
  
  export const SIDE_MENU_TRAINER_DATA = [
    {
      id: "t01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/trainer/dashboard",
    },
    {
      id: "t03",
      label: "Day Plans",
      icon: LuCalendar,
      path: "/trainer/day-plans",
    },
    {
      id: "t04",
      label: "Observations",
      icon: LuEye,
      path: "/trainer/observations",
    },
    {
      id: "t99",
      label: "Logout",
      icon: LuLogOut,
      path: "logout",
    },
  ];
  
  export const SIDE_MENU_TRAINEE_DATA = [
    {
      id: "u01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/trainee/dashboard",
    },
    {
      id: "u03",
      label: "My Day Plans",
      icon: LuCalendar,
      path: "/trainee/day-plans",
    },
    {
      id: "u04",
      label: "Profile & Settings",
      icon: LuUser,
      path: "/trainee/profile-settings",
    },
    {
      id: "u99",
      label: "Logout",
      icon: LuLogOut,
      path: "logout",
    },
  ];

  export const SIDE_MENU_MASTER_TRAINER_DATA = [
    {
      id: "mt01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/master-trainer/dashboard",
    },
    {
      id: "mt03",
      label: "Plan & Progress",
      icon: LuTarget,
      hasSubmenu: true,
      submenu: [
        {
          id: "mt03-1",
          label: "Day Plans",
          path: "/master-trainer/day-plans",
        },
        {
          id: "mt03-2",
          label: "Observations",
          path: "/master-trainer/observations",
        },
        {
          id: "mt03-3",
          label: "Assignments",
          path: "/master-trainer/assignments",
        },
      ],
    },
    {
      id: "mt04",
      label: "Reports",
      icon: LuEye,
      path: "/master-trainer/reports",
    },
    {
      id: "mt05",
      label: "Team Members",
      icon: LuUsers,
      path: "/master-trainer/users",
    },
    {
      id: "mt99",
      label: "Logout",
      icon: LuLogOut,
      path: "logout",
    },
  ];

  // BOA Sidebar Menu Data
  export const SIDE_MENU_BOA_DATA = [
    {
      id: "boa01",
      label: "Dashboard",
      icon: LuLayoutDashboard,
      path: "/boa/dashboard",
    },
    {
      id: "boa02",
      label: "Assign Trainees",
      icon: LuUsers,
      path: "/boa/assign-trainees",
    },
    {
      id: "boa03",
      label: "Upload Results",
      icon: LuFileSpreadsheet,
      path: "/boa/upload-results",
    },
    {
      id: "boa04",
      label: "Reports & Stats",
      icon: LuTrendingUp,
      path: "/boa/reports-stats",
    },
    {
      id: "boa05",
      label: "Settings",
      icon: LuSettings,
      path: "/boa/settings",
    },
    {
      id: "boa99",
      label: "Logout",
      icon: LuLogOut,
      path: "logout",
    },
  ];
  
  export const PRIORITY_DATA = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ]
  
  export const STATUS_DATA = [
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
  ]
  