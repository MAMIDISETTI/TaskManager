import React, { useState, useContext, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { 
  LuDownload,
  LuVideo,
  LuFileText,
  LuStar,
  LuX,
  LuEye,
  LuUser,
  LuMessageSquare,
  LuPlay,
  LuCheck
} from 'react-icons/lu';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';

const TrainerDemoManagement = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('reviews');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewedDemos, setReviewedDemos] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    feedback: '',
    action: 'approve' // 'approve' or 'reject'
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Load data on component mount
  useEffect(() => {
    fetchPendingReviews();
    fetchReviewedDemos();
  }, []);

  // Refresh data when switching tabs
  useEffect(() => {
    if (activeTab === 'manage') {
      fetchReviewedDemos();
    } else if (activeTab === 'reviews') {
      fetchPendingReviews();
    }
  }, [activeTab]);

  const fetchPendingReviews = async () => {
    try {
      console.log('Fetching pending reviews for trainer:', user);
      
      // Fetch demos from assigned trainees that are under review
      console.log('Fetching pending reviews with user:', user);
      console.log('Using trainerId:', user?.author_id || user?.id);
      
      // Try without trainerId first, let the backend determine from authenticated user
      const demosResponse = await axiosInstance.get(API_PATHS.DEMO.GET_ALL, {
        params: { 
          status: 'under_review'
        }
      });
      
      if (demosResponse.data.success && demosResponse.data.demos) {
        console.log('Fetched pending demos:', demosResponse.data.demos);
        setPendingReviews(demosResponse.data.demos);
      } else {
        console.log('No pending demos found, using empty array');
        setPendingReviews([]);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      toast.error('Failed to fetch pending reviews. Please try again.');
      setPendingReviews([]);
    }
  };

  const fetchReviewedDemos = async () => {
    try {
      console.log('Fetching reviewed demos for trainer:', user);
      
      // Fetch demos from assigned trainees that have been reviewed by this trainer
      // We need to get all demos and filter by trainerStatus on the frontend
      const demosResponse = await axiosInstance.get(API_PATHS.DEMO.GET_ALL, {
        params: { 
          // Don't filter by status - we want all demos to check trainerStatus
        }
      });
      
      if (demosResponse.data.success && demosResponse.data.demos) {
        console.log('Fetched all demos for filtering:', demosResponse.data.demos);
        
        // Log each demo's trainerStatus for debugging
        demosResponse.data.demos.forEach((demo, index) => {
          console.log(`Demo ${index}:`, {
            id: demo.id,
            title: demo.title,
            status: demo.status,
            trainerStatus: demo.trainerStatus,
            masterTrainerStatus: demo.masterTrainerStatus
          });
        });
        
        // Filter demos that have been reviewed by this trainer
        const reviewedDemos = demosResponse.data.demos.filter(demo => {
          const hasTrainerStatus = demo.trainerStatus === 'approved' || demo.trainerStatus === 'rejected';
          console.log(`Demo ${demo.id} (${demo.title}): trainerStatus=${demo.trainerStatus}, hasTrainerStatus=${hasTrainerStatus}`);
          return hasTrainerStatus;
        });
        
        console.log('Filtered reviewed demos:', reviewedDemos);
        console.log('Number of reviewed demos:', reviewedDemos.length);
        setReviewedDemos(reviewedDemos);
      } else {
        console.log('No reviewed demos found, using empty array');
        setReviewedDemos([]);
      }
    } catch (error) {
      console.error('Error fetching reviewed demos:', error);
      toast.error('Failed to fetch reviewed demos. Please try again.');
      setReviewedDemos([]);
    }
  };

  const openReviewModal = (demo) => {
    setSelectedDemo(demo);
    setReviewData({
      rating: 0,
      feedback: '',
      action: 'approve'
    });
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedDemo(null);
  };

  const handleReviewSubmit = async () => {
    if (!selectedDemo) return;

    if (reviewData.action === 'approve' && reviewData.rating === 0) {
      toast.error('Please provide a rating for approved demos');
      return;
    }

    if (reviewData.action === 'reject' && !reviewData.feedback.trim()) {
      toast.error('Please provide feedback for rejected demos');
      return;
    }

    try {
      console.log('Submitting review:', {
        demoId: selectedDemo.demoId || selectedDemo.id,
        action: reviewData.action,
        rating: reviewData.rating,
        feedback: reviewData.feedback,
        trainerId: user?.author_id || user?.id
      });

      // Make API call to update demo status
      const reviewPayload = {
        action: reviewData.action,
        rating: reviewData.rating,
        feedback: reviewData.feedback,
        reviewedBy: user?.author_id || user?.id,
        reviewedAt: new Date().toISOString()
      };

      const response = await axiosInstance.put(
        `${API_PATHS.DEMO.UPDATE(selectedDemo.demoId || selectedDemo.id)}/review`,
        reviewPayload
      );

      if (response.data.success) {
        console.log('Review submitted successfully:', response.data);
        
        // Refresh data from server instead of local state manipulation
        await fetchPendingReviews();
        await fetchReviewedDemos();

        toast.success(`Demo ${reviewData.action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        closeReviewModal();
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  // Video viewing functions
  const openVideoModal = (demo) => {
    console.log('Opening video modal for demo:', demo);
    console.log('Video fileUrl:', demo.fileUrl);
    setSelectedVideo(demo);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  return (
    <DashboardLayout activeMenu="Demo Management">
      <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Management</h1>
          <p className="text-gray-600">Review trainee demos and manage your reviewed demos</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <LuEye className="w-4 h-4" />
                <span>Pending Reviews</span>
                {pendingReviews.length > 0 && (
                  <span className="ml-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <LuVideo className="w-4 h-4" />
                <span>My Demos</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Pending Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <LuEye className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Pending Reviews</h2>
                        <p className="text-sm text-gray-500">Review trainee demos awaiting your feedback</p>
                      </div>
                    </div>
                  </div>

                  {pendingReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <LuEye className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending reviews</h3>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">
                        All trainee demos have been reviewed. New demos will appear here when trainees upload them.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingReviews.map((demo) => (
                        <div key={demo.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 rounded-lg bg-yellow-100">
                                <LuVideo className="w-4 h-4 text-yellow-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{demo.title}</h3>
                                <p className="text-xs text-gray-500">{demo.courseTag}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                Under Review
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Trainee:</strong> {demo.traineeName}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">{demo.description}</p>
                          </div>
                          
                          <div className="mb-3 p-2 bg-yellow-100 rounded text-xs">
                            <p className="text-yellow-800 font-medium">⏳ Awaiting your review</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(demo.uploadedAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openVideoModal(demo)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="View Video"
                              >
                                <LuPlay className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openReviewModal(demo)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Demos Tab */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <LuVideo className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">My Demos</h2>
                        <p className="text-sm text-gray-500">Demos you have reviewed</p>
                      </div>
                    </div>
                  </div>

                  {reviewedDemos.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <LuVideo className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviewed demos yet</h3>
                      <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Reviewed demos will appear here once you start reviewing trainee submissions.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {reviewedDemos.map((demo) => (
                        <div key={demo.id} className={`rounded-lg border p-4 hover:shadow-md transition-all duration-200 ${
                          demo.trainerStatus === 'approved' ? 'bg-green-50 border-green-200' :
                          demo.trainerStatus === 'rejected' ? 'bg-red-50 border-red-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg ${
                                demo.trainerStatus === 'approved' ? 'bg-green-100' :
                                demo.trainerStatus === 'rejected' ? 'bg-red-100' :
                                'bg-blue-100'
                              }`}>
                                <LuVideo className={`w-4 h-4 ${
                                  demo.trainerStatus === 'approved' ? 'text-green-600' :
                                  demo.trainerStatus === 'rejected' ? 'text-red-600' :
                                  'text-blue-600'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{demo.title}</h3>
                                <p className="text-xs text-gray-500">{demo.courseTag}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                demo.trainerStatus === 'approved' ? 
                                  (demo.masterTrainerStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                   demo.masterTrainerStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                   'bg-yellow-100 text-yellow-800') :
                                demo.trainerStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {demo.trainerStatus === 'approved' ? 
                                  (demo.masterTrainerStatus === 'approved' ? 'Approved' :
                                   demo.masterTrainerStatus === 'rejected' ? 'Rejected' :
                                   'Under Review') :
                                 demo.trainerStatus === 'rejected' ? 'Rejected' :
                                 'Unknown'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Trainee:</strong> {demo.traineeName}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">{demo.description}</p>
                          </div>
                          
                          {/* Status-specific information */}
                          {demo.trainerStatus === 'approved' && (
                            <div className="mb-3 p-2 bg-green-100 rounded text-xs">
                              <p className="text-green-800 font-medium">
                                ✓ Approved by you - {
                                  demo.masterTrainerStatus === 'approved' ? 'Approved by Master Trainer' :
                                  demo.masterTrainerStatus === 'rejected' ? 'Rejected by Master Trainer' :
                                  'Under Review by Master Trainer'
                                }
                              </p>
                              {demo.feedback && (
                                <p className="text-green-700 mt-1">Feedback: {demo.feedback}</p>
                              )}
                              {demo.rating > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-green-700 text-xs">Rating:</span>
                                  <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <LuStar
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= demo.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              <p className="text-green-600 text-xs mt-1">
                                Master Trainer Status: {demo.masterTrainerStatus === 'pending' ? 'Pending' : 
                                 demo.masterTrainerStatus === 'approved' ? 'Approved' : 
                                 demo.masterTrainerStatus === 'rejected' ? 'Rejected' : 'N/A'}
                              </p>
                            </div>
                          )}
                          
                          {demo.status === 'trainer_rejected' && (
                            <div className="mb-3 p-2 bg-red-100 rounded text-xs">
                              <p className="text-red-800 font-medium">✗ Rejected by you</p>
                              {demo.rejectionReason && (
                                <p className="text-red-700 mt-1">Reason: {demo.rejectionReason}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Reviewed: {new Date(demo.reviewedAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openVideoModal(demo)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="View Video"
                              >
                                <LuPlay className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = demo.fileUrl;
                                  link.download = demo.fileName || 'demo-video.mp4';
                                  link.click();
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Download"
                              >
                                <LuDownload className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Review Demo</h3>
                  <button
                    onClick={closeReviewModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Demo Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Title:</span>
                        <span className="ml-2 text-gray-900">{selectedDemo.title}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Trainee:</span>
                        <span className="ml-2 text-gray-900">{selectedDemo.traineeName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Course:</span>
                        <span className="ml-2 text-gray-900">{selectedDemo.courseTag}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Uploaded:</span>
                        <span className="ml-2 text-gray-900">{moment(selectedDemo.uploadedAt).format('MMM DD, YYYY HH:mm')}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-900">{selectedDemo.description}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review Action</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="action"
                          value="approve"
                          checked={reviewData.action === 'approve'}
                          onChange={(e) => setReviewData(prev => ({ ...prev, action: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 flex items-center">
                          <LuCheck className="w-4 h-4 mr-1 text-green-600" />
                          Approve
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="action"
                          value="reject"
                          checked={reviewData.action === 'reject'}
                          onChange={(e) => setReviewData(prev => ({ ...prev, action: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 flex items-center">
                          <LuX className="w-4 h-4 mr-1 text-red-600" />
                          Reject
                        </span>
                      </label>
                    </div>
                  </div>

                  {reviewData.action === 'approve' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating (Required)</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <LuStar
                              className={`w-6 h-6 ${
                                star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {reviewData.rating > 0 ? `${reviewData.rating} star${reviewData.rating > 1 ? 's' : ''}` : 'Select a rating'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {reviewData.action === 'approve' ? 'Feedback (Optional)' : 'Rejection Reason (Required)'}
                    </label>
                    <textarea
                      value={reviewData.feedback}
                      onChange={(e) => setReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder={reviewData.action === 'approve' ? 'Provide feedback to help the trainee improve...' : 'Explain why this demo is being rejected...'}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                  <button
                    onClick={closeReviewModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                      reviewData.action === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {reviewData.action === 'approve' ? (
                      <>
                        <LuCheck className="w-4 h-4" />
                        <span>Approve Demo</span>
                      </>
                    ) : (
                      <>
                        <LuX className="w-4 h-4" />
                        <span>Reject Demo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h3>
                  <button
                    onClick={closeVideoModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="bg-gray-100 rounded-lg p-4">
                    {selectedVideo.fileUrl ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Video URL: {selectedVideo.fileUrl}</p>
                        <video
                          controls
                          className="w-full h-auto rounded-lg"
                          src={selectedVideo.fileUrl}
                          onError={(e) => {
                            console.error('Video load error:', e);
                            console.error('Video src:', selectedVideo.fileUrl);
                          }}
                          onLoadStart={() => {
                            console.log('Video loading started:', selectedVideo.fileUrl);
                          }}
                          onCanPlay={() => {
                            console.log('Video can play:', selectedVideo.fileUrl);
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
                        <div className="text-center">
                          <LuVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Video file not available</p>
                          <p className="text-sm text-gray-400">File: {selectedVideo.fileName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Demo Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Course:</span>
                        <span className="ml-2 text-gray-900">{selectedVideo.courseTag}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Trainee:</span>
                        <span className="ml-2 text-gray-900">{selectedVideo.traineeName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Uploaded:</span>
                        <span className="ml-2 text-gray-900">{moment(selectedVideo.uploadedAt).format('MMM DD, YYYY HH:mm')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">File:</span>
                        <span className="ml-2 text-gray-900">{selectedVideo.fileName}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-900">{selectedVideo.description}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                  <button
                    onClick={closeVideoModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  {selectedVideo.fileUrl && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedVideo.fileUrl;
                        link.download = selectedVideo.fileName || 'demo-video.mp4';
                        link.click();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <LuDownload className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrainerDemoManagement;
