import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import { 
  LuVideo, 
  LuCheck, 
  LuX, 
  LuClock, 
  LuStar, 
  LuCalendar,
  LuUser,
  LuFileText,
  LuDownload,
  LuUpload,
  LuMessageSquare,
  LuPencil,
  LuTrash2,
  LuTarget,
  LuPlus,
  LuMapPin
} from 'react-icons/lu';

const MasterTrainerDemoManagement = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('final-reviews');
  const [offlineRequests, setOfflineRequests] = useState([]);
  const [demoSessions, setDemoSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [newFeedback, setNewFeedback] = useState({
    demoId: '',
    traineeId: '',
    technicalSkills: 0,
    presentationSkills: 0,
    communicationSkills: 0,
    creativity: 0,
    overallRating: 0,
    feedback: '',
    recommendations: ''
  });
  const [trainerApprovedDemos, setTrainerApprovedDemos] = useState([]);
  const [showFinalReviewModal, setShowFinalReviewModal] = useState(false);
  const [selectedFinalReviewDemo, setSelectedFinalReviewDemo] = useState(null);
  const [finalReviewData, setFinalReviewData] = useState({
    action: 'approve', // 'approve' or 'reject'
    feedback: '',
    rating: 0
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  useEffect(() => {
    // fetchOfflineRequests(); // Disabled - focusing on online demos
    fetchDemoSessions();
    fetchTrainerApprovedDemos();
  }, []);

  const fetchOfflineRequests = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DEMO.OFFLINE_REQUESTS);
      if (response.data.success) {
        setOfflineRequests(response.data.requests);
      } else {
        // Mock data for development
        setOfflineRequests([
          {
            id: '1',
            traineeName: 'John Smith',
            traineeId: 'T001',
            department: 'Software Development',
            courseTag: 'React',
            requestedDate: new Date().toISOString(),
            preferredTime: '10:00 AM - 11:00 AM',
            location: 'Conference Room A',
            description: 'React component development demonstration',
            status: 'pending',
            priority: 'high'
          },
          {
            id: '2',
            traineeName: 'Sarah Johnson',
            traineeId: 'T002',
            department: 'Software Development',
            courseTag: 'Node.js',
            requestedDate: new Date(Date.now() + 86400000).toISOString(),
            preferredTime: '2:00 PM - 3:00 PM',
            location: 'Training Hall B',
            description: 'Node.js API development demonstration',
            status: 'pending',
            priority: 'medium'
          },
          {
            id: '3',
            traineeName: 'Mike Wilson',
            traineeId: 'T003',
            department: 'Software Development',
            courseTag: 'Full Stack',
            requestedDate: new Date(Date.now() + 172800000).toISOString(),
            preferredTime: '11:00 AM - 12:00 PM',
            location: 'Lab Room C',
            description: 'Full-stack project presentation',
            status: 'approved',
            priority: 'high'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching offline requests:', error);
      setOfflineRequests([]);
    }
  };

  const fetchDemoSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DEMO.GET_ALL);
      if (response.data.success) {
        setDemoSessions(response.data.demos);
      } else {
        // Mock data for development
        setDemoSessions([
          {
            id: '1',
            traineeName: 'Emily Davis',
            traineeId: 'T004',
            courseTag: 'React',
            sessionDate: new Date().toISOString(),
            duration: '60 minutes',
            location: 'Conference Room A',
            status: 'completed',
            recordingUrl: '/recordings/demo1.mp4',
            feedback: 'Excellent presentation skills and technical knowledge',
            rating: 4.5,
            reviewedAt: new Date().toISOString()
          },
          {
            id: '2',
            traineeName: 'Alex Brown',
            traineeId: 'T005',
            courseTag: 'Node.js',
            sessionDate: new Date(Date.now() - 86400000).toISOString(),
            duration: '45 minutes',
            location: 'Training Hall B',
            status: 'completed',
            recordingUrl: '/recordings/demo2.mp4',
            feedback: 'Good understanding of backend concepts',
            rating: 4.0,
            reviewedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching demo sessions:', error);
      setDemoSessions([]);
    }
  };

  const fetchTrainerApprovedDemos = async () => {
    try {
      console.log('Fetching trainer-approved demos for master trainer');
      
      // Fetch all demos and filter for trainer-approved ones
      const response = await axiosInstance.get(API_PATHS.DEMO.GET_ALL, {
        params: {
          // Don't filter by status - we want all demos to check trainerStatus
        }
      });
      
      if (response.data.success && response.data.demos) {
        console.log('Fetched all demos for master trainer filtering:', response.data.demos);
        
        // Filter demos that have been approved by trainers but not yet by master trainer
        const approvedDemos = response.data.demos.filter(demo => 
          demo.trainerStatus === 'approved' && demo.masterTrainerStatus !== 'approved'
        );
        
        // For demos without reviewedByName, try to fetch trainer name
        const demosWithTrainerNames = await Promise.all(approvedDemos.map(async (demo) => {
          if (!demo.reviewedByName && demo.reviewedBy) {
            try {
              // Try to fetch trainer name from the reviewedBy ID
              const trainerResponse = await axiosInstance.get(API_PATHS.USERS.GET_USER_BY_ID(demo.reviewedBy));
              if (trainerResponse.data.success) {
                demo.reviewedByName = trainerResponse.data.user.name;
              }
            } catch (error) {
              console.error('Error fetching trainer name:', error);
              demo.reviewedByName = 'Unknown Trainer';
            }
          }
          return demo;
        }));
        
        console.log('Filtered trainer-approved demos with names:', demosWithTrainerNames);
        setTrainerApprovedDemos(demosWithTrainerNames);
      } else {
        console.log('No demos found, using empty array');
        setTrainerApprovedDemos([]);
      }
    } catch (error) {
      console.error('Error fetching trainer-approved demos:', error);
      setTrainerApprovedDemos([]);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await axiosInstance.put(API_PATHS.DEMO.REVIEW_SLOT(requestId), {
        action: action // 'approve' or 'reject'
      });
      
      if (response.data.success) {
        fetchOfflineRequests();
        setShowRequestModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  const handleFeedbackSubmit = async (sessionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.DEMO.FEEDBACK(sessionId), {
        feedback: feedback,
        rating: rating
      });
      
      if (response.data.success) {
        setFeedback('');
        setRating(0);
        fetchDemoSessions();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const closeModal = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
  };

  const openFinalReviewModal = (demo) => {
    setSelectedFinalReviewDemo(demo);
    setFinalReviewData({
      action: 'approve',
      feedback: '',
      rating: 0
    });
    setShowFinalReviewModal(true);
  };

  const closeFinalReviewModal = () => {
    setShowFinalReviewModal(false);
    setSelectedFinalReviewDemo(null);
  };

  const openVideoModal = (demo) => {
    console.log('Opening video modal for demo:', demo);
    setSelectedDemo(demo);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedDemo(null);
  };

  const handleFinalReviewSubmit = async () => {
    if (!selectedFinalReviewDemo) return;

    if (finalReviewData.action === 'approve' && finalReviewData.rating === 0) {
      toast.error('Please provide a rating for approved demos');
      return;
    }

    if (finalReviewData.action === 'reject' && !finalReviewData.feedback.trim()) {
      toast.error('Please provide feedback for rejected demos');
      return;
    }

    try {
      console.log('Submitting final review:', {
        demoId: selectedFinalReviewDemo.demoId || selectedFinalReviewDemo.id,
        action: finalReviewData.action,
        rating: finalReviewData.rating,
        feedback: finalReviewData.feedback,
        masterTrainerId: user?.author_id || user?.id
      });

      // Make API call to update demo with master trainer review
      const reviewPayload = {
        action: finalReviewData.action,
        rating: finalReviewData.rating,
        feedback: finalReviewData.feedback,
        reviewedBy: user?.author_id || user?.id,
        reviewedAt: new Date().toISOString()
      };

      const response = await axiosInstance.put(
        `${API_PATHS.DEMO.UPDATE(selectedFinalReviewDemo.demoId || selectedFinalReviewDemo.id)}/master-review`,
        reviewPayload
      );

      if (response.data.success) {
        console.log('Final review submitted successfully:', response.data);
        
        // Refresh data for both Final Reviews and All Demos tabs
        await Promise.all([
          fetchTrainerApprovedDemos(),
          fetchDemoSessions()
        ]);

        toast.success(`Demo ${finalReviewData.action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        closeFinalReviewModal();
      } else {
        throw new Error(response.data.message || 'Failed to submit final review');
      }
    } catch (error) {
      console.error('Error submitting final review:', error);
      toast.error('Failed to submit final review. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch campus allocations
  const fetchCampusAllocations = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ALLOCATION.GET_ALL);
      if (response.data.success) {
        setCampusAllocations(response.data.allocations);
      } else {
        // Mock data for development
        setCampusAllocations([
          {
            id: '1',
            traineeName: 'John Smith',
            traineeId: 'T001',
            campusName: 'Mumbai Campus',
            campusId: 'C001',
            startDate: '2024-02-01',
            endDate: '2024-08-01',
            status: 'active',
            notes: 'Excellent performance in React development'
          },
          {
            id: '2',
            traineeName: 'Sarah Johnson',
            traineeId: 'T002',
            campusName: 'Delhi Campus',
            campusId: 'C002',
            startDate: '2024-03-01',
            endDate: '2024-09-01',
            status: 'active',
            notes: 'Strong teaching skills and communication'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching campus allocations:', error);
      // Mock data for development
      setCampusAllocations([
        {
          id: '1',
          traineeName: 'John Smith',
          traineeId: 'T001',
          campusName: 'Mumbai Campus',
          campusId: 'C001',
          startDate: '2024-02-01',
          endDate: '2024-08-01',
          status: 'active',
          notes: 'Excellent performance in React development'
        }
      ]);
    }
  };

  // Fetch observations
  const fetchObservations = async () => {
    try {
      const response = await axiosInstance.get('/api/observations');
      if (response.data.success) {
        setObservations(response.data.observations);
      } else {
        // Mock data for development
        setObservations([
          {
            id: '1',
            traineeName: 'John Smith',
            traineeId: 'T001',
            category: 'communication',
            observation: 'Excellent presentation skills and clear communication',
            rating: 4.5,
            notes: 'Very confident in explaining complex concepts',
            date: new Date().toISOString(),
            trainerName: user.name
          },
          {
            id: '2',
            traineeName: 'Sarah Johnson',
            traineeId: 'T002',
            category: 'professionalism',
            observation: 'Good punctuality and professional attitude',
            rating: 4.0,
            notes: 'Always prepared and ready for sessions',
            date: new Date(Date.now() - 86400000).toISOString(),
            trainerName: user.name
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching observations:', error);
      // Mock data for development
      setObservations([
        {
          id: '1',
          traineeName: 'John Smith',
          traineeId: 'T001',
          category: 'communication',
          observation: 'Excellent presentation skills and clear communication',
          rating: 4.5,
          notes: 'Very confident in explaining complex concepts',
          date: new Date().toISOString(),
          trainerName: user.name
        }
      ]);
    }
  };

  // Handle request approval
  const handleApproveRequest = async (requestId) => {
    try {
      const response = await axiosInstance.put(API_PATHS.DEMO.REVIEW_SLOT(requestId), {
        status: 'approved',
        approvedBy: user.id,
        approvedAt: new Date().toISOString()
      });
      
      if (response.data.success) {
        toast.success('Request approved successfully!');
        fetchOfflineRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request. Please try again.');
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId) => {
    try {
      const response = await axiosInstance.put(API_PATHS.DEMO.REVIEW_SLOT(requestId), {
        status: 'rejected',
        rejectedBy: user.id,
        rejectedAt: new Date().toISOString()
      });
      
      if (response.data.success) {
        toast.success('Request rejected successfully!');
        fetchOfflineRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request. Please try again.');
    }
  };

  // Submit observation
  const handleSubmitObservation = async () => {
    if (!newObservation.traineeId || !newObservation.observation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/observations', {
        ...newObservation,
        trainerId: user.id,
        trainerName: user.name,
        date: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Observation recorded successfully!');
        setNewObservation({
          traineeId: '',
          category: 'communication',
          observation: '',
          rating: 0,
          notes: ''
        });
        setShowObservationModal(false);
        fetchObservations();
      }
    } catch (error) {
      console.error('Error submitting observation:', error);
      toast.error('Failed to record observation. Please try again.');
    }
  };

  // Submit campus allocation
  const handleSubmitCampusAllocation = async () => {
    if (!newCampusAllocation.traineeId || !newCampusAllocation.campusId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.ALLOCATION.CREATE, {
        ...newCampusAllocation,
        allocatedBy: user.id,
        allocatedAt: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Campus allocation created successfully!');
        setNewCampusAllocation({
          traineeId: '',
          campusId: '',
          startDate: '',
          endDate: '',
          notes: ''
        });
        setShowCampusModal(false);
        fetchCampusAllocations();
      }
    } catch (error) {
      console.error('Error creating campus allocation:', error);
      toast.error('Failed to create campus allocation. Please try again.');
    }
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!newFeedback.demoId || !newFeedback.traineeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.DEMO.FEEDBACK, {
        ...newFeedback,
        trainerId: user.id,
        trainerName: user.name,
        submittedAt: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success('Feedback submitted successfully!');
        setNewFeedback({
          demoId: '',
          traineeId: '',
          technicalSkills: 0,
          presentationSkills: 0,
          communicationSkills: 0,
          creativity: 0,
          overallRating: 0,
          feedback: '',
          recommendations: ''
        });
        setShowFeedbackModal(false);
        fetchDemoSessions();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  // Open modals
  const openObservationModal = (trainee = null) => {
    setSelectedTrainee(trainee);
    setNewObservation({
      traineeId: trainee?.id || '',
      category: 'communication',
      observation: '',
      rating: 0,
      notes: ''
    });
    setShowObservationModal(true);
  };

  const openCampusModal = (trainee = null) => {
    setSelectedTrainee(trainee);
    setNewCampusAllocation({
      traineeId: trainee?.id || '',
      campusId: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setShowCampusModal(true);
  };

  const openFeedbackModal = (demo) => {
    setSelectedDemo(demo);
    setNewFeedback({
      demoId: demo.id,
      traineeId: demo.traineeId,
      technicalSkills: 0,
      presentationSkills: 0,
      communicationSkills: 0,
      creativity: 0,
      overallRating: 0,
      feedback: '',
      recommendations: ''
    });
    setShowFeedbackModal(true);
  };

  return (
    <DashboardLayout activeMenu="Demo Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Demo Management</h1>
              <p className="text-gray-600 mt-1">Manage offline demo requests and sessions</p>
            </div>
            <div className="flex items-center gap-2">
              <LuVideo className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <LuVideo className="w-4 h-4" />
                <span>All Demos</span>
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'feedback'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <LuStar className="w-4 h-4" />
                <span>Feedback & Ratings</span>
              </button>
              <button
                onClick={() => setActiveTab('final-reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'final-reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <LuCheck className="w-4 h-4" />
                <span>Final Reviews</span>
              </button>
            </nav>
          </div>

          <div className="p-6">

            {/* All Demos Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">All Demos</h2>
                  <p className="text-sm text-gray-500">
                    View all demos from all trainees
                  </p>
                </div>

                {demoSessions.length > 0 ? (
                  <div className="space-y-4">
                    {demoSessions.map((session) => (
                      <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{session.traineeName}</h3>
                              <span className="text-sm text-gray-500">({session.traineeId})</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                {session.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{session.courseTag}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <LuCalendar className="w-4 h-4" />
                                {session.uploadedAt ? new Date(session.uploadedAt).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <LuClock className="w-4 h-4" />
                                {session.duration || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <LuMapPin className="w-4 h-4" />
                                {session.location || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                              <LuDownload className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-1 text-green-600 hover:text-green-800 text-sm font-medium">
                              <LuStar className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <LuVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No demo sessions found</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback & Ratings Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Provide Feedback</h2>
                
                {demoSessions.filter(s => s.status === 'completed').length > 0 ? (
                  <div className="space-y-4">
                    {demoSessions.filter(s => s.status === 'completed').map((session) => (
                      <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{session.traineeName}</h3>
                            <p className="text-sm text-gray-600">{session.courseTag} - {new Date(session.sessionDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`w-6 h-6 ${
                                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                <LuStar className="w-full h-full fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Feedback
                            </label>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={3}
                              placeholder="Provide detailed feedback..."
                            />
                          </div>
                          <button
                            onClick={() => handleFeedbackSubmit(session.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                            Submit Feedback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <LuFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No completed sessions to provide feedback</p>
                  </div>
                )}
              </div>
            )}

            {/* Final Reviews Tab */}
            {activeTab === 'final-reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Final Reviews</h2>
                  <p className="text-sm text-gray-500">
                    Review demos approved by trainers
                  </p>
                </div>

                {trainerApprovedDemos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainerApprovedDemos.map((demo) => (
                      <div key={demo.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <LuVideo className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{demo.title}</h3>
                              <p className="text-sm text-gray-600">by {demo.traineeName}</p>
                              <p className="text-xs text-gray-500">{demo.courseTag}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              Trainer Approved
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">Trainer Feedback:</h4>
                            {demo.reviewedByName && (
                              <span className="text-sm text-gray-600">
                                by <span className="font-medium text-blue-600">{demo.reviewedByName}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{demo.feedback}</p>
                          {demo.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-600">Rating:</span>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <LuStar
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= demo.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => openFinalReviewModal(demo)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => openVideoModal(demo)}
                            className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <LuCheck className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No demos pending final review</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      All trainer-approved demos have been reviewed or there are no demos awaiting your review.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Request Details Modal */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Trainee Name</label>
                      <p className="text-gray-900">{selectedRequest.traineeName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Trainee ID</label>
                      <p className="text-gray-900">{selectedRequest.traineeId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Department</label>
                      <p className="text-gray-900">{selectedRequest.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Course Tag</label>
                      <p className="text-gray-900">{selectedRequest.courseTag}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Requested Date</label>
                      <p className="text-gray-900">{new Date(selectedRequest.requestedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Preferred Time</label>
                      <p className="text-gray-900">{selectedRequest.preferredTime}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{selectedRequest.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-900">{selectedRequest.description}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleRequestAction(selectedRequest.id, 'reject')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observation Modal - REMOVED */}
        {false && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Record Observation</h3>
                  <button
                    onClick={() => setShowObservationModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trainee</label>
                    <select
                      value={newObservation.traineeId}
                      onChange={(e) => setNewObservation(prev => ({ ...prev, traineeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a trainee...</option>
                      <option value="T001">John Smith (T001)</option>
                      <option value="T002">Sarah Johnson (T002)</option>
                      <option value="T003">Mike Wilson (T003)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newObservation.category}
                      onChange={(e) => setNewObservation(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="communication">Communication Skills</option>
                      <option value="professionalism">Professionalism</option>
                      <option value="leadership">Leadership</option>
                      <option value="teamwork">Teamwork</option>
                      <option value="creativity">Creativity</option>
                      <option value="punctuality">Punctuality</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewObservation(prev => ({ ...prev, rating: star }))}
                          className={`p-1 ${
                            star <= newObservation.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        >
                          <LuStar className="w-6 h-6" />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {newObservation.rating > 0 ? `${newObservation.rating}/5` : 'Rate this observation'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observation</label>
                    <textarea
                      value={newObservation.observation}
                      onChange={(e) => setNewObservation(prev => ({ ...prev, observation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Describe your observation..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      value={newObservation.notes}
                      onChange={(e) => setNewObservation(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Any additional notes or recommendations..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowObservationModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitObservation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Record Observation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campus Allocation Modal - REMOVED */}
        {false && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Allocate Campus</h3>
                  <button
                    onClick={() => setShowCampusModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trainee</label>
                    <select
                      value={newCampusAllocation.traineeId}
                      onChange={(e) => setNewCampusAllocation(prev => ({ ...prev, traineeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a trainee...</option>
                      <option value="T001">John Smith (T001)</option>
                      <option value="T002">Sarah Johnson (T002)</option>
                      <option value="T003">Mike Wilson (T003)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
                    <select
                      value={newCampusAllocation.campusId}
                      onChange={(e) => setNewCampusAllocation(prev => ({ ...prev, campusId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a campus...</option>
                      <option value="C001">Mumbai Campus</option>
                      <option value="C002">Delhi Campus</option>
                      <option value="C003">Bangalore Campus</option>
                      <option value="C004">Chennai Campus</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="date"
                        value={newCampusAllocation.startDate}
                        onChange={(e) => setNewCampusAllocation(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={newCampusAllocation.endDate}
                        onChange={(e) => setNewCampusAllocation(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={newCampusAllocation.notes}
                      onChange={(e) => setNewCampusAllocation(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      placeholder="Any notes about this allocation..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCampusModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitCampusAllocation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Allocate Campus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Provide Feedback</h3>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Demo Session</label>
                    <input
                      type="text"
                      value={selectedDemo?.title || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewFeedback(prev => ({ ...prev, technicalSkills: star }))}
                            className={`p-1 ${
                              star <= newFeedback.technicalSkills
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <LuStar className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Presentation Skills</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewFeedback(prev => ({ ...prev, presentationSkills: star }))}
                            className={`p-1 ${
                              star <= newFeedback.presentationSkills
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <LuStar className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Communication Skills</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewFeedback(prev => ({ ...prev, communicationSkills: star }))}
                            className={`p-1 ${
                              star <= newFeedback.communicationSkills
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <LuStar className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Creativity</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewFeedback(prev => ({ ...prev, creativity: star }))}
                            className={`p-1 ${
                              star <= newFeedback.creativity
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <LuStar className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewFeedback(prev => ({ ...prev, overallRating: star }))}
                          className={`p-1 ${
                            star <= newFeedback.overallRating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        >
                          <LuStar className="w-6 h-6" />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {newFeedback.overallRating > 0 ? `${newFeedback.overallRating}/5` : 'Rate overall performance'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Feedback</label>
                    <textarea
                      value={newFeedback.feedback}
                      onChange={(e) => setNewFeedback(prev => ({ ...prev, feedback: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Provide detailed feedback on the demo session..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                    <textarea
                      value={newFeedback.recommendations}
                      onChange={(e) => setNewFeedback(prev => ({ ...prev, recommendations: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Any recommendations for improvement..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Review Modal */}
        {showFinalReviewModal && selectedFinalReviewDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Final Review</h3>
                  <button
                    onClick={closeFinalReviewModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Demo Details</h4>
                    <p className="text-sm text-gray-600"><strong>Title:</strong> {selectedFinalReviewDemo.title}</p>
                    <p className="text-sm text-gray-600"><strong>Trainee:</strong> {selectedFinalReviewDemo.traineeName}</p>
                    <p className="text-sm text-gray-600"><strong>Course:</strong> {selectedFinalReviewDemo.courseTag}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Trainer Review</h4>
                    <p className="text-sm text-gray-700 mb-2">{selectedFinalReviewDemo.feedback}</p>
                    {selectedFinalReviewDemo.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <LuStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= selectedFinalReviewDemo.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="approve"
                          checked={finalReviewData.action === 'approve'}
                          onChange={(e) => setFinalReviewData(prev => ({ ...prev, action: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Approve</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="reject"
                          checked={finalReviewData.action === 'reject'}
                          onChange={(e) => setFinalReviewData(prev => ({ ...prev, action: e.target.value }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Reject</span>
                      </label>
                    </div>
                  </div>

                  {finalReviewData.action === 'approve' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFinalReviewData(prev => ({ ...prev, rating: star }))}
                            className={`w-8 h-8 rounded-full transition-colors ${
                              star <= finalReviewData.rating
                                ? 'text-yellow-400 bg-yellow-100'
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          >
                            <LuStar className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                    <textarea
                      value={finalReviewData.feedback}
                      onChange={(e) => setFinalReviewData(prev => ({ ...prev, feedback: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide your final feedback..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeFinalReviewModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFinalReviewSubmit}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${
                        finalReviewData.action === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {finalReviewData.action === 'approve' ? 'Approve Demo' : 'Reject Demo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Demo Video</h3>
                  <button
                    onClick={closeVideoModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedDemo.title}</h4>
                    <p className="text-sm text-gray-600">by {selectedDemo.traineeName}</p>
                  </div>

                  <div className="bg-black rounded-lg overflow-hidden">
                    {selectedDemo.fileUrl ? (
                      <video
                        controls
                        className="w-full h-auto"
                        onError={(e) => console.error('Video error:', e)}
                        onLoadStart={() => console.log('Video loading started')}
                        onCanPlay={() => console.log('Video can play')}
                      >
                        <source src={selectedDemo.fileUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-white">
                        <div className="text-center">
                          <LuVideo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>Video not available</p>
                        </div>
                      </div>
                    )}
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

export default MasterTrainerDemoManagement;
