import React, { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { LuEye, LuUser, LuCalendar, LuStar, LuFilter, LuSearch, LuCheck, LuClock } from 'react-icons/lu';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import { toast } from 'react-hot-toast';
import moment from 'moment';

const MasterTrainerObservations = () => {
  const { user } = useContext(UserContext);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [trainerFilter, setTrainerFilter] = useState('all');
  const [filteredObservations, setFilteredObservations] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [trainers, setTrainers] = useState([]);

  // Fetch observations
  const fetchObservations = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.OBSERVATIONS.GET_MASTER_TRAINER);
      setObservations(res.data.observations || []);
    } catch (error) {
      console.error('Error fetching observations:', error);
      toast.error('Failed to fetch observations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch trainers for filter
  const fetchTrainers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.USERS.LIST, { params: { role: 'trainer' } });
      setTrainers(res.data.users || []);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  useEffect(() => {
    fetchObservations();
    fetchTrainers();
  }, []);

  // Filter observations
  useEffect(() => {
    let filtered = observations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(obs => 
        obs.trainee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.trainee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.trainer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(obs => obs.status === statusFilter);
    }

    // Trainer filter
    if (trainerFilter !== 'all') {
      filtered = filtered.filter(obs => obs.trainer?._id === trainerFilter);
    }

    setFilteredObservations(filtered);
  }, [observations, searchTerm, statusFilter, trainerFilter]);

  // Handle review observation
  const handleReviewObservation = async (observationId) => {
    try {
      await axiosInstance.put(API_PATHS.OBSERVATIONS.REVIEW(observationId), {
        masterTrainerNotes: reviewNotes
      });
      
      toast.success('Observation reviewed successfully');
      setShowReviewModal(false);
      setReviewNotes('');
      setSelectedObservation(null);
      fetchObservations(); // Refresh the list
    } catch (error) {
      console.error('Error reviewing observation:', error);
      toast.error('Failed to review observation');
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get rating color
  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'needs_improvement': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get rating icon
  const getRatingIcon = (rating) => {
    switch (rating) {
      case 'excellent': return '⭐⭐⭐⭐';
      case 'good': return '⭐⭐⭐';
      case 'average': return '⭐⭐';
      case 'needs_improvement': return '⭐';
      default: return '⭐';
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Observations">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Observations">
      <div className="my-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Observations</h1>
            <p className="text-gray-600">Review and manage trainee observations</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {filteredObservations.length} observations
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
            </select>

            {/* Trainer Filter */}
            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Trainers</option>
              {trainers.map(trainer => (
                <option key={trainer._id} value={trainer._id}>
                  {trainer.name}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTrainerFilter('all');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Observations List */}
        <div className="space-y-4">
          {filteredObservations.length === 0 ? (
            <div className="card text-center py-12">
              <LuEye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Observations Found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || trainerFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No observations have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            filteredObservations.map((observation) => (
              <div key={observation._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <LuUser className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {observation.trainee?.name || 'Unknown Trainee'}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({observation.trainee?.employeeId || 'N/A'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LuCalendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {moment(observation.date).format('MMM DD, YYYY')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">by</span>
                        <span className="font-medium text-gray-900">
                          {observation.trainer?.name || 'Unknown Trainer'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Overall Rating */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Overall Rating</label>
                        <div className={`flex items-center gap-2 ${getRatingColor(observation.overallRating)}`}>
                          <span className="text-lg">{getRatingIcon(observation.overallRating)}</span>
                          <span className="capitalize font-medium">{observation.overallRating.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Culture Rating */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Culture</label>
                        <div className="text-sm text-gray-600">
                          <div>Communication: <span className="capitalize">{observation.culture?.communication}</span></div>
                          <div>Teamwork: <span className="capitalize">{observation.culture?.teamwork}</span></div>
                        </div>
                      </div>

                      {/* Grooming Rating */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Grooming</label>
                        <div className="text-sm text-gray-600">
                          <div>Dress Code: <span className="capitalize">{observation.grooming?.dressCode}</span></div>
                          <div>Punctuality: <span className="capitalize">{observation.grooming?.punctuality}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Strengths and Areas for Improvement */}
                    {(observation.strengths?.length > 0 || observation.areasForImprovement?.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {observation.strengths?.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Strengths</label>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {observation.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {observation.areasForImprovement?.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">Areas for Improvement</label>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {observation.areasForImprovement.map((area, index) => (
                                <li key={index}>{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    {observation.recommendations && (
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700">Recommendations</label>
                        <p className="text-sm text-gray-600 mt-1">{observation.recommendations}</p>
                      </div>
                    )}

                    {/* Master Trainer Notes */}
                    {observation.masterTrainerNotes && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <label className="text-sm font-medium text-blue-700">Master Trainer Notes</label>
                        <p className="text-sm text-blue-600 mt-1">{observation.masterTrainerNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(observation.status)}`}>
                      {observation.status.charAt(0).toUpperCase() + observation.status.slice(1)}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {observation.status === 'submitted' && (
                        <button
                          onClick={() => {
                            setSelectedObservation(observation);
                            setShowReviewModal(true);
                          }}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <LuCheck className="w-3 h-3" />
                          Review
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedObservation(observation);
                          // You can add a view details modal here
                        }}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <LuEye className="w-3 h-3" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedObservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Observation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Trainee: <span className="font-medium">{selectedObservation.trainee?.name}</span>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Master Trainer Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your review notes..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewNotes('');
                    setSelectedObservation(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewObservation(selectedObservation._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Mark as Reviewed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MasterTrainerObservations;
