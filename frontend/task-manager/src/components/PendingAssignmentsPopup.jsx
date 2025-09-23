import React, { useState, useEffect } from 'react';
import { LuX, LuUser } from 'react-icons/lu';
import moment from 'moment';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { toast } from 'react-hot-toast';
import JoinerWorkflowPopup from './JoinerWorkflowPopup';

const PendingAssignmentsPopup = ({ isOpen, onClose, onSuccess }) => {
  const [pendingJoiners, setPendingJoiners] = useState([]);
  const [selectedJoiner, setSelectedJoiner] = useState(null);
  const [showWorkflowPopup, setShowWorkflowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJoiners, setSelectedJoiners] = useState([]);
  const [showBulkWorkflow, setShowBulkWorkflow] = useState(false);
  const [currentStep, setCurrentStep] = useState('select'); // 'select', 'details', 'assign'

  // Step 1: Fetch pending joiners
  useEffect(() => {
    if (isOpen) {
      fetchPendingJoiners();
    }
  }, [isOpen]);

  const fetchPendingJoiners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_PATHS.JOINERS.GET_ALL}?status=pending&sortBy=joiningDate&sortOrder=asc&limit=1000`);
      // console.log('Pending joiners API response:', response.data);
      const allJoiners = response.data.joiners || [];
      
      // Filter out joiners who already have user accounts
      const pendingJoiners = allJoiners.filter(joiner => !joiner.accountCreated);
      setPendingJoiners(pendingJoiners);
    } catch (error) {
      console.error('Error fetching pending joiners:', error);
      toast.error('Failed to fetch pending joiners');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinerSelect = async (joiner) => {
    // Check if this joiner already has a user account and is assigned
    try {
      const emailToCheck = joiner.candidate_personal_mail_id || joiner.email;
      const response = await axiosInstance.get(`${API_PATHS.USERS.LIST}?email=${emailToCheck}`);
      const users = response.data.users || [];
      
      if (users.length > 0) {
        const user = users[0];
        if (user.assignedTrainer) {
          toast.error('This trainee is already assigned to a trainer and cannot be reassigned.');
          return;
        }
      }
      
      setSelectedJoiner(joiner);
      setShowWorkflowPopup(true);
    } catch (error) {
      console.error('Error checking existing user:', error);
      // If there's an error checking, still allow the workflow to proceed
      setSelectedJoiner(joiner);
      setShowWorkflowPopup(true);
    }
  };

  const handleBulkJoinerSelect = (joiner) => {
    setSelectedJoiners(prev => {
      if (prev.some(j => j.author_id === joiner.author_id)) {
        return prev.filter(j => j.author_id !== joiner.author_id);
      } else {
        return [...prev, joiner];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedJoiners.length === filteredJoiners.length) {
      setSelectedJoiners([]);
    } else {
      setSelectedJoiners([...filteredJoiners]);
    }
  };

  const handleBulkActivate = () => {
    if (selectedJoiners.length === 0) {
      toast.error('Please select at least one joiner to activate');
      return;
    }
    setCurrentStep('details');
  };

  // Filter joiners based on search term
  const filteredJoiners = pendingJoiners.filter(joiner =>
    joiner.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    joiner.candidate_personal_mail_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    joiner.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWorkflowSuccess = () => {
    setShowWorkflowPopup(false);
    setSelectedJoiner(null);
    fetchPendingJoiners(); // Refresh the list
    onSuccess(); // Notify parent component
  };

  const handleWorkflowClose = () => {
    setShowWorkflowPopup(false);
    setSelectedJoiner(null);
  };


  // Debug logging
  // console.log('Pending joiners state:', pendingJoiners);
  // console.log('Filtered joiners:', filteredJoiners);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Account Activation</h2>
            <p className="text-sm text-gray-600">Total: {pendingJoiners.length} accounts awaiting activation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search accounts by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <LuUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Joiners List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ minHeight: 0 }}>
          <div className="p-4">
            {currentStep === 'select' && (
              <>
                {/* Bulk Selection Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedJoiners.length === filteredJoiners.length && filteredJoiners.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({selectedJoiners.length}/{filteredJoiners.length})
                    </span>
                  </div>
                  {selectedJoiners.length > 0 && (
                    <button
                      onClick={handleBulkActivate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Activate Selected ({selectedJoiners.length})
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading joiners...</p>
                  </div>
                ) : filteredJoiners.length > 0 ? (
                  <div className="space-y-3">
                    {filteredJoiners.map((joiner) => (
                      <div
                        key={joiner.author_id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                          selectedJoiners.some(j => j.author_id === joiner.author_id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedJoiners.some(j => j.author_id === joiner.author_id)}
                            onChange={() => handleBulkJoinerSelect(joiner)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <LuUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{joiner.name || joiner.candidate_name}</h3>
                            <p className="text-sm text-gray-500">{joiner.email || joiner.candidate_personal_mail_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            {joiner.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {moment(joiner.joiningDate || joiner.date_of_joining).format('MMM D, YYYY')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <LuUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No accounts awaiting activation</p>
                  </div>
                )}
              </>
            )}

            {currentStep === 'details' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Selected Joiners ({selectedJoiners.length})
                  </h3>
                  <button
                    onClick={() => setCurrentStep('select')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to Selection
                  </button>
                </div>
                
                <div className="space-y-3">
                  {selectedJoiners.map((joiner) => (
                    <div key={joiner.author_id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <LuUser className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{joiner.name || joiner.candidate_name}</h4>
                          <p className="text-sm text-gray-500">{joiner.email || joiner.candidate_personal_mail_id}</p>
                          <p className="text-xs text-gray-400">
                            Employee ID: {joiner.employee_id} | Department: {joiner.department || joiner.top_department_name_as_per_darwinbox}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            {joiner.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {moment(joiner.joiningDate || joiner.date_of_joining).format('MMM D, YYYY')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setCurrentStep('assign');
                    setShowBulkWorkflow(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Proceed to Assignment
                </button>
                <button
                  onClick={() => setCurrentStep('select')}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
              </div>
            )}

            {currentStep === 'assign' && !showBulkWorkflow && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Assign Trainees to Trainer
                  </h3>
                  <button
                    onClick={() => {
                      setCurrentStep('details');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Back to Details
                  </button>
                </div>
                
                <div className="text-center py-8">
                  <LuUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Opening assignment workflow...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    This will open the JoinerWorkflowPopup for bulk assignment
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Joiner Workflow Popup */}
      {showBulkWorkflow && (
        <JoinerWorkflowPopup
          isOpen={showBulkWorkflow}
          onClose={() => {
            setShowBulkWorkflow(false);
            setCurrentStep('select');
          }}
          joiner={null}
          joiners={selectedJoiners}
          onSuccess={handleWorkflowSuccess}
        />
      )}
      
      <JoinerWorkflowPopup
        isOpen={showWorkflowPopup}
        onClose={handleWorkflowClose}
        joiner={selectedJoiner}
        joiners={[]}
        onSuccess={handleWorkflowSuccess}
      />
    </div>
  );
};

export default PendingAssignmentsPopup;
