import React, { useContext, useState } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import { LuMenu, LuX } from "react-icons/lu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="">
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div className="flex relative">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed top-20 left-4 z-30 p-2 bg-white border border-gray-200 rounded-lg shadow-md"
          >
            {sidebarOpen ? <LuX className="text-xl" /> : <LuMenu className="text-xl" />}
          </button>

          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static top-[61px] left-0 z-20 transition-transform duration-300 ease-in-out`}>
            <SideMenu activeMenu={activeMenu} onMenuClick={() => setSidebarOpen(false)} />
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="grow mx-5 lg:ml-0">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
