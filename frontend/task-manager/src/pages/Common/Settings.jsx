import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { LuSettings, LuConstruction, LuClock, LuWrench, LuUser, LuBell, LuShield } from 'react-icons/lu';

const Settings = ({ activeMenu = "Settings" }) => {
  return (
    <DashboardLayout activeMenu={activeMenu}>
      <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <LuSettings className="text-blue-600" />
            Settings
          </h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>

        {/* Under Construction Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            {/* Construction Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                <LuConstruction className="w-10 h-10 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Construction</h2>
              <p className="text-gray-600 mb-6">
                We're working hard to bring you amazing settings features. 
                This section will be available soon!
              </p>
            </div>

            {/* Coming Soon Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3 mx-auto">
                  <LuUser className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Profile Settings</h3>
                <p className="text-sm text-gray-600">
                  Update your personal information, profile picture, and contact details
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3 mx-auto">
                  <LuShield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Security & Privacy</h3>
                <p className="text-sm text-gray-600">
                  Manage your password, two-factor authentication, and privacy settings
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3 mx-auto">
                  <LuBell className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
                <p className="text-sm text-gray-600">
                  Customize your notification preferences, email alerts, and reminders
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3 mx-auto">
                  <LuWrench className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Preferences</h3>
                <p className="text-sm text-gray-600">
                  Configure your application preferences, themes, and display options
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-3 mx-auto">
                  <LuSettings className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">System Settings</h3>
                <p className="text-sm text-gray-600">
                  Manage system-wide settings and configuration options
                </p>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg mb-3 mx-auto">
                  <LuClock className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Time & Date</h3>
                <p className="text-sm text-gray-600">
                  Set your timezone, date format, and time-related preferences
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Development Progress</span>
                <span className="text-sm text-gray-500">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Expected completion: <span className="font-medium text-gray-700">Q2 2025</span>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
