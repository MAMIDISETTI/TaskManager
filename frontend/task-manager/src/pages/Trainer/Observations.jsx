import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { toast } from "react-hot-toast";
import { LuPlus, LuPencil, LuEye, LuUsers, LuCalendar } from "react-icons/lu";

const Observations = () => {
  const { user } = useContext(UserContext);
  const [observations, setObservations] = useState([]);
  const [assignedTrainees, setAssignedTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingObservation, setEditingObservation] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    traineeId: "",
    date: moment().format('YYYY-MM-DD'),
    culture: {
      communication: "good",
      teamwork: "good",
      discipline: "good",
      attitude: "good",
      notes: ""
    },
    grooming: {
      dressCode: "good",
      neatness: "good",
      punctuality: "good",
      notes: ""
    },
    overallRating: "good",
    strengths: [],
    areasForImprovement: [],
    recommendations: ""
  });

  // State to track selected trainee's gender
  const [selectedTraineeGender, setSelectedTraineeGender] = useState(null);

  // Handle trainee selection and update gender
  const handleTraineeChange = (traineeId) => {
    const selectedTrainee = assignedTrainees.find(trainee => trainee._id === traineeId);
    console.log('Selected trainee:', selectedTrainee);
    console.log('Trainee genre:', selectedTrainee?.genre);
    setSelectedTraineeGender(selectedTrainee?.genre || null);
    setFormData({...formData, traineeId: traineeId});
  };

  // Fetch observations
  const getObservations = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.OBSERVATIONS.GET_ALL);
      setObservations(res.data.observations || []);
    } catch (err) {
      console.error("Error loading observations", err);
      toast.error("Failed to load observations");
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned trainees
  const getAssignedTrainees = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ASSIGNMENTS.GET_TRAINER);
      console.log('Assigned trainees response:', res.data);
      console.log('Trainees data:', res.data?.trainees);
      setAssignedTrainees(res.data?.trainees || []);
    } catch (err) {
      console.error("Error loading trainees", err);
    }
  };

  // Create/Update observation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.traineeId) {
      toast.error("Please select a trainee");
      return;
    }

    try {
      if (editingObservation) {
        await axiosInstance.put(API_PATHS.OBSERVATIONS.UPDATE(editingObservation._id), formData);
        toast.success("Observation updated successfully");
      } else {
        await axiosInstance.post(API_PATHS.OBSERVATIONS.CREATE, formData);
        toast.success("Observation created successfully");
      }
      
      setShowCreateForm(false);
      setEditingObservation(null);
      resetForm();
      getObservations();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save observation";
      toast.error(msg);
    }
  };

  // Submit observation
  const handleSubmitObservation = async (obsId) => {
    try {
      await axiosInstance.put(API_PATHS.OBSERVATIONS.SUBMIT(obsId));
      toast.success("Observation submitted successfully");
      getObservations();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit observation";
      toast.error(msg);
    }
  };

  // Add strength
  const addStrength = () => {
    setFormData({
      ...formData,
      strengths: [...formData.strengths, ""]
    });
  };

  // Update strength
  const updateStrength = (index, value) => {
    const newStrengths = [...formData.strengths];
    newStrengths[index] = value;
    setFormData({ ...formData, strengths: newStrengths });
  };

  // Remove strength
  const removeStrength = (index) => {
    const newStrengths = formData.strengths.filter((_, i) => i !== index);
    setFormData({ ...formData, strengths: newStrengths });
  };

  // Add area for improvement
  const addAreaForImprovement = () => {
    setFormData({
      ...formData,
      areasForImprovement: [...formData.areasForImprovement, ""]
    });
  };

  // Update area for improvement
  const updateAreaForImprovement = (index, value) => {
    const newAreas = [...formData.areasForImprovement];
    newAreas[index] = value;
    setFormData({ ...formData, areasForImprovement: newAreas });
  };

  // Remove area for improvement
  const removeAreaForImprovement = (index) => {
    const newAreas = formData.areasForImprovement.filter((_, i) => i !== index);
    setFormData({ ...formData, areasForImprovement: newAreas });
  };

  // Edit observation
  const handleEdit = (obs) => {
    setEditingObservation(obs);
    setFormData({
      traineeId: obs.trainee._id,
      date: moment(obs.date).format('YYYY-MM-DD'),
      culture: obs.culture || {
        communication: "good",
        teamwork: "good",
        discipline: "good",
        attitude: "good",
        notes: ""
      },
      grooming: obs.grooming || {
        dressCode: "good",
        neatness: "good",
        punctuality: "good",
        notes: ""
      },
      overallRating: obs.overallRating || "good",
      strengths: obs.strengths || [],
      areasForImprovement: obs.areasForImprovement || [],
      recommendations: obs.recommendations || ""
    });
    // Set the gender for the selected trainee
    setSelectedTraineeGender(obs.trainee?.genre || null);
    setShowCreateForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      traineeId: "",
      date: moment().format('YYYY-MM-DD'),
      culture: {
        communication: "good",
        teamwork: "good",
        discipline: "good",
        attitude: "good",
        notes: ""
      },
      grooming: {
        dressCode: "good",
        neatness: "good",
        punctuality: "good",
        notes: ""
      },
      overallRating: "good",
      strengths: [],
      areasForImprovement: [],
      recommendations: ""
    });
    setSelectedTraineeGender(null);
  };

  useEffect(() => {
    getObservations();
    getAssignedTrainees();
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Observations">
        <div className="my-6">Loading...</div>
      </DashboardLayout>
    );
  }

  const ratingOptions = [
    { value: "excellent", label: "Excellent", color: "text-green-600" },
    { value: "good", label: "Good", color: "text-blue-600" },
    { value: "average", label: "Average", color: "text-yellow-600" },
    { value: "needs_improvement", label: "Needs Improvement", color: "text-red-600" }
  ];

  return (
    <DashboardLayout activeMenu="Observations">
      <div className="card my-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Trainee Observations</h2>
          <button 
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
            onClick={() => {
              setEditingObservation(null);
              setShowCreateForm(true);
            }}
          >
            <LuPlus className="w-5 h-5" />
            <span>Record Observation</span>
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card my-5">
          <h3 className="text-lg font-medium mb-4">
            {editingObservation ? "Edit Observation" : "Record New Observation"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Trainee *</label>
                <select
                  value={formData.traineeId}
                  onChange={(e) => handleTraineeChange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select a trainee</option>
                  {assignedTrainees.map((trainee) => (
                    <option key={trainee._id} value={trainee._id}>
                      {trainee.name} ({trainee.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>

            {/* Culture & Behavior */}
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-3">Culture & Behavior</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Communication</label>
                  <select
                    value={formData.culture.communication}
                    onChange={(e) => setFormData({
                      ...formData,
                      culture: {...formData.culture, communication: e.target.value}
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Teamwork</label>
                  <select
                    value={formData.culture.teamwork}
                    onChange={(e) => setFormData({
                      ...formData,
                      culture: {...formData.culture, teamwork: e.target.value}
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Discipline</label>
                  <select
                    value={formData.culture.discipline}
                    onChange={(e) => setFormData({
                      ...formData,
                      culture: {...formData.culture, discipline: e.target.value}
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Attitude</label>
                  <select
                    value={formData.culture.attitude}
                    onChange={(e) => setFormData({
                      ...formData,
                      culture: {...formData.culture, attitude: e.target.value}
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Culture Notes</label>
                <textarea
                  value={formData.culture.notes}
                  onChange={(e) => setFormData({
                    ...formData,
                    culture: {...formData.culture, notes: e.target.value}
                  })}
                  className="w-full p-2 border rounded-md"
                  rows="2"
                  placeholder="Additional notes about culture and behavior"
                />
              </div>
            </div>

            {/* Grooming & Professional Appearance */}
            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-3">
                Grooming & Professional Appearance
                {selectedTraineeGender && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({selectedTraineeGender === 'Female' ? 'Female' : 'Male'} Details)
                  </span>
                )}
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-1">
                  Debug: Gender = {selectedTraineeGender || 'null'}
                </div>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dress Code</label>
                  <select
                    value={formData.grooming.dressCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      grooming: {...formData.grooming, dressCode: e.target.value}
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Neatness</label>
                  <select
                    value={formData.grooming.neatness}
                    onChange={(e) => setFormData({
                      ...formData,
                      grooming: {...formData.grooming, neatness: e.target.value}
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Punctuality</label>
                  <select
                    value={formData.grooming.punctuality}
                    onChange={(e) => setFormData({
                      ...formData,
                      grooming: {...formData.grooming, punctuality: e.target.value}
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Grooming Notes
                  {selectedTraineeGender && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({selectedTraineeGender === 'Female' ? 'Female' : 'Male'} specific observations)
                    </span>
                  )}
                </label>
                <textarea
                  value={formData.grooming.notes}
                  onChange={(e) => setFormData({
                    ...formData,
                    grooming: {...formData.grooming, notes: e.target.value}
                  })}
                  className="w-full p-2 border rounded-md"
                  rows="2"
                  placeholder={
                    selectedTraineeGender === 'Female' 
                      ? "Additional notes about female grooming and professional appearance (e.g., hair styling, makeup appropriateness, jewelry, etc.)"
                      : selectedTraineeGender === 'Male'
                      ? "Additional notes about male grooming and professional appearance (e.g., facial hair, hair styling, accessories, etc.)"
                      : "Additional notes about grooming and appearance"
                  }
                />
              </div>
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium mb-2">Overall Rating</label>
              <select
                value={formData.overallRating}
                onChange={(e) => setFormData({...formData, overallRating: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Strengths */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Strengths</label>
                <button
                  type="button"
                  onClick={addStrength}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Strength
                </button>
              </div>
              
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={strength}
                    onChange={(e) => updateStrength(index, e.target.value)}
                    placeholder="Enter strength"
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeStrength(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Areas for Improvement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Areas for Improvement</label>
                <button
                  type="button"
                  onClick={addAreaForImprovement}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Area
                </button>
              </div>
              
              {formData.areasForImprovement.map((area, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => updateAreaForImprovement(index, e.target.value)}
                    placeholder="Enter area for improvement"
                    className="flex-1 p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeAreaForImprovement(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium mb-2">Recommendations</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                className="w-full p-2 border rounded-md"
                rows="3"
                placeholder="Enter recommendations for the trainee"
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                <span>{editingObservation ? "Update" : "Create"} Observation</span>
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingObservation(null);
                  resetForm();
                }}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Observations List */}
      <div className="card my-5">
        <h3 className="text-lg font-medium mb-4">All Observations</h3>
        
        {observations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No observations recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {observations.map((obs) => (
              <div key={obs._id} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="font-medium">{obs.trainee?.name}</h4>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <LuCalendar />
                        {moment(obs.date).format('DD MMM YYYY')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Communication:</span>
                        <span className={`ml-2 ${ratingOptions.find(r => r.value === obs.culture?.communication)?.color || 'text-gray-600'}`}>
                          {obs.culture?.communication || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Teamwork:</span>
                        <span className={`ml-2 ${ratingOptions.find(r => r.value === obs.culture?.teamwork)?.color || 'text-gray-600'}`}>
                          {obs.culture?.teamwork || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Dress Code:</span>
                        <span className={`ml-2 ${ratingOptions.find(r => r.value === obs.grooming?.dressCode)?.color || 'text-gray-600'}`}>
                          {obs.grooming?.dressCode || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Overall:</span>
                        <span className={`ml-2 ${ratingOptions.find(r => r.value === obs.overallRating)?.color || 'text-gray-600'}`}>
                          {obs.overallRating || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      obs.status === 'submitted' ? 'bg-green-100 text-green-800' :
                      obs.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {obs.status}
                    </span>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(obs)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <LuPencil />
                      </button>
                      
                      {obs.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitObservation(obs._id)}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Submit"
                        >
                          <LuEye />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Observations;
