import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { LuConstruction, LuClock, LuRocket, LuMail } from 'react-icons/lu';

const Assignments = () => {
  return (
    <DashboardLayout activeMenu="Assignments">
      <div className="my-5">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Assignments Management</h1>
          <p className="text-gray-600 text-lg">Coming Soon - We're Building Something Amazing!</p>
        </div>

        {/* Under Construction Content */}
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-16">
            {/* Construction Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
                <LuConstruction className="w-12 h-12 text-orange-600" />
              </div>
            </div>

            {/* Main Message */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚧 Under Construction 🚧
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We're working hard to bring you an amazing assignments management system!
              </p>
              <p className="text-gray-500 mb-8">
                This feature will allow you to efficiently manage trainee assignments, track progress, 
                and coordinate training activities across your organization.
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <LuRocket className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Smart Assignment</h3>
                <p className="text-sm text-gray-600">
                  Automatically assign trainees to the most suitable trainers based on skills and availability.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <LuClock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                <p className="text-sm text-gray-600">
                  Monitor assignment progress in real-time with detailed analytics and reporting.
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <LuMail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
                <p className="text-sm text-gray-600">
                  Stay updated with automated notifications for assignments, updates, and milestones.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Expected Launch Timeline</h3>
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                    1
                  </div>
                  <p className="text-sm text-gray-600">Planning</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                    2
                  </div>
                  <p className="text-sm text-gray-600">Development</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
                    3
                  </div>
                  <p className="text-sm text-gray-600">Testing</p>
                  <p className="text-xs text-gray-500">Upcoming</p>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
                    4
                  </div>
                  <p className="text-sm text-gray-600">Launch</p>
                  <p className="text-xs text-gray-500">Soon</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Have questions or suggestions? We'd love to hear from you!
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Contact Support
                </button>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                  Request Feature
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Animation */}
        <div className="text-center mt-8">
          <div className="inline-block animate-bounce">
            <span className="text-2xl">🚀</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
