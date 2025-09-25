import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/userContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  LuEye, 
  LuPlus, 
  LuPencil, 
  LuTrash2, 
  LuSearch,
  LuFilter,
  LuCalendar,
  LuUser,
  LuStar,
  LuFileText,
  LuCheck,
  LuX
} from 'react-icons/lu';

const MasterTrainerObservations = () => {
  const { user } = useContext(UserContext);
  const [observations, setObservations] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [editingObservation, setEditingObservation] = useState(null);
  const [observationForm, setObservationForm] = useState({
    traineeId: '',
    category: 'cultural',
    title: '',
    description: '',
    behaviorType: 'positive',
    severity: 'low',
    impact: 'low',
    recommendations: '',
    followUpRequired: false,
    followUpDate: ''
  });

  const categories = [
    { value: 'cultural', label: 'Cultural Adaptation', color: 'bg-blue-100 text-blue-800' },
    { value: 'behavioral', label: 'Behavioral', color: 'bg-green-100 text-green-800' },
    { value: 'professional', label: 'Professional', color: 'bg-purple-100 text-purple-800' },
    { value: 'technical', label: 'Technical', color: 'bg-orange-100 text-orange-800' },
    { value: 'communication', label: 'Communication', color: 'bg-pink-100 text-pink-800' }
  ];

  const behaviorTypes = [
    { value: 'positive', label: 'Positive', color: 'bg-green-100 text-green-800' },
    { value: 'negative', label: 'Negative', color: 'bg-red-100 text-red-800' },
    { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-800' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const impactLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchObservations();
    fetchTrainees();
  }, []);

  const fetchObservations = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.OBSERVATIONS.GET_ALL, {
        params: { role: 'master_trainer' }
      });
      if (response.data.success) {
        setObservations(response.data.observations);
      } else {
        // Mock data for development
        setObservations([
          {
            id: '1',
            traineeId: '1',
            traineeName: 'John Smith',
            traineeEmail: 'john.smith@example.com',
            category: 'cultural',
            title: 'Excellent team collaboration',
            description: 'Demonstrated strong cultural adaptation skills during team projects. Showed respect for diverse perspectives and actively contributed to group discussions.',
            behaviorType: 'positive',
            severity: 'low',
            impact: 'high',
            recommendations: 'Continue fostering inclusive team environment. Consider for leadership roles.',
            followUpRequired: false,
            followUpDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            traineeId: '2',
            traineeName: 'Sarah Johnson',
            traineeEmail: 'sarah.johnson@example.com',
            category: 'behavioral',
            title: 'Punctuality concerns',
            description: 'Consistently late for meetings and training sessions. This behavior affects team productivity and project timelines.',
            behaviorType: 'negative',
            severity: 'medium',
            impact: 'medium',
            recommendations: 'Schedule one-on-one meeting to discuss time management. Provide resources for improving punctuality.',
            followUpRequired: true,
            followUpDate: new Date(Date.now() + 604800000).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            traineeId: '3',
            traineeName: 'Mike Wilson',
            traineeEmail: 'mike.wilson@example.com',
            category: 'professional',
            title: 'Strong technical leadership',
            description: 'Took initiative in mentoring junior trainees and provided excellent technical guidance during code reviews.',
            behaviorType: 'positive',
            severity: 'low',
            impact: 'high',
            recommendations: 'Consider for senior technical roles. Continue mentoring activities.',
            followUpRequired: false,
            followUpDate: null,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching observations:', error);
      setObservations([]);
    }
  };

  const fetchTrainees = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL, {
        params: { role: 'trainee' }
      });
      if (response.data.success) {
        setTrainees(response.data.users);
      } else {
        // Mock data for development
        setTrainees([
          { id: '1', name: 'John Smith', email: 'john.smith@example.com', employeeId: 'T001' },
          { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', employeeId: 'T002' },
          { id: '3', name: 'Mike Wilson', email: 'mike.wilson@example.com', employeeId: 'T003' },
          { id: '4', name: 'Emily Davis', email: 'emily.davis@example.com', employeeId: 'T004' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching trainees:', error);
      setTrainees([]);
    }
  };

  const handleSubmitObservation = async (e) => {
    e.preventDefault();
    try {
      const response = editingObservation 
        ? await axiosInstance.put(API_PATHS.OBSERVATIONS.UPDATE(editingObservation.id), observationForm)
        : await axiosInstance.post(API_PATHS.OBSERVATIONS.CREATE, observationForm);

      if (response.data.success) {
        fetchObservations();
        resetForm();
        setShowObservationModal(false);
      }
    } catch (error) {
      console.error('Error saving observation:', error);
    }
  };

  const handleEditObservation = (observation) => {
    setEditingObservation(observation);
    setObservationForm({
      traineeId: observation.traineeId,
      category: observation.category,
      title: observation.title,
      description: observation.description,
      behaviorType: observation.behaviorType,
      severity: observation.severity,
      impact: observation.impact,
      recommendations: observation.recommendations,
      followUpRequired: observation.followUpRequired,
      followUpDate: observation.followUpDate ? new Date(observation.followUpDate).toISOString().split('T')[0] : ''
    });
    setShowObservationModal(true);
  };

  const handleDeleteObservation = async (observationId) => {
    if (window.confirm('Are you sure you want to delete this observation?')) {
      try {
        const response = await axiosInstance.delete(API_PATHS.OBSERVATIONS.DELETE(observationId));
        if (response.data.success) {
          fetchObservations();
        }
      } catch (error) {
        console.error('Error deleting observation:', error);
      }
    }
  };

  const resetForm = () => {
    setObservationForm({
      traineeId: '',
      category: 'cultural',
      title: '',
      description: '',
      behaviorType: 'positive',
      severity: 'low',
      impact: 'low',
      recommendations: '',
      followUpRequired: false,
      followUpDate: ''
    });
    setEditingObservation(null);
  };

  const filteredObservations = observations.filter(observation => {
    const matchesSearch = observation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         observation.traineeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || observation.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getBehaviorTypeInfo = (behaviorType) => {
    return behaviorTypes.find(b => b.value === behaviorType) || behaviorTypes[0];
  };

  return (
    <DashboardLayout activeMenu="Observations">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cultural & Behavioral Observations</h1>
              <p className="text-gray-600 mt-1">Track and manage trainee cultural adaptation and behavioral patterns</p>
            </div>
            <button
              onClick={() => setShowObservationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              <LuPlus className="w-4 h-4 mr-2" />
              New Observation
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const count = observations.filter(o => o.category === category.value).length;
            return (
              <div key={category.value} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{category.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <LuEye className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search observations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Observations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Observations ({filteredObservations.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredObservations.map((observation) => {
              const categoryInfo = getCategoryInfo(observation.category);
              const behaviorInfo = getBehaviorTypeInfo(observation.behaviorType);
              
              return (
                <div key={observation.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{observation.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${behaviorInfo.color}`}>
                          {behaviorInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <LuUser className="w-4 h-4" />
                          {observation.traineeName}
                        </span>
                        <span className="flex items-center gap-1">
                          <LuCalendar className="w-4 h-4" />
                          {new Date(observation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{observation.description}</p>
                      {observation.recommendations && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-blue-800">
                            <strong>Recommendations:</strong> {observation.recommendations}
                          </p>
                        </div>
                      )}
                      {observation.followUpRequired && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Follow-up Required:</strong> {new Date(observation.followUpDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditObservation(observation)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <LuPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteObservation(observation.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observation Modal */}
        {showObservationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingObservation ? 'Edit Observation' : 'New Observation'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowObservationModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <LuX className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitObservation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trainee
                      </label>
                      <select
                        value={observationForm.traineeId}
                        onChange={(e) => setObservationForm({ ...observationForm, traineeId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Trainee</option>
                        {trainees.map((trainee) => (
                          <option key={trainee.id} value={trainee.id}>
                            {trainee.name} ({trainee.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={observationForm.category}
                        onChange={(e) => setObservationForm({ ...observationForm, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={observationForm.title}
                      onChange={(e) => setObservationForm({ ...observationForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief title for the observation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={observationForm.description}
                      onChange={(e) => setObservationForm({ ...observationForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Detailed description of the observation"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Behavior Type
                      </label>
                      <select
                        value={observationForm.behaviorType}
                        onChange={(e) => setObservationForm({ ...observationForm, behaviorType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {behaviorTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity
                      </label>
                      <select
                        value={observationForm.severity}
                        onChange={(e) => setObservationForm({ ...observationForm, severity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {severityLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Impact
                      </label>
                      <select
                        value={observationForm.impact}
                        onChange={(e) => setObservationForm({ ...observationForm, impact: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {impactLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recommendations
                    </label>
                    <textarea
                      value={observationForm.recommendations}
                      onChange={(e) => setObservationForm({ ...observationForm, recommendations: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Recommendations for improvement or continuation"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={observationForm.followUpRequired}
                        onChange={(e) => setObservationForm({ ...observationForm, followUpRequired: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Follow-up Required</span>
                    </label>
                  </div>

                  {observationForm.followUpRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={observationForm.followUpDate}
                        onChange={(e) => setObservationForm({ ...observationForm, followUpDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowObservationModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingObservation ? 'Update' : 'Create'} Observation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MasterTrainerObservations;