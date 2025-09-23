import React, { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { 
  LuCalendar, 
  LuCheck, 
  LuVideo, 
  LuUser, 
  LuClock, 
  LuPlus, 
  LuSave, 
  LuEye, 
  LuUpload, 
  LuDownload,
  LuStar,
  LuFileText,
  LuX,
  LuClock3,
  LuPencil
} from 'react-icons/lu';
import { UserContext } from '../../context/userContext';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const TraineeMainDashboard = () => {
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('day-plan');
  const [dayPlan, setDayPlan] = useState({
    tasks: [{ id: 1, title: '', timeAllocation: '', description: '' }],
    date: moment().format('YYYY-MM-DD'),
    status: 'draft' // draft, submitted
  });

  const [dynamicCheckboxes, setDynamicCheckboxes] = useState({});
  const [submittedDayPlans, setSubmittedDayPlans] = useState([]);
  const [selectedDayPlan, setSelectedDayPlan] = useState(null);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [eodStatus, setEodStatus] = useState({
    tasks: [],
    remarks: '',
    submitted: false
  });
  const [isEditingEod, setIsEditingEod] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [taskStatuses, setTaskStatuses] = useState({});
  const [taskRemarks, setTaskRemarks] = useState({});
  const [demoUpload, setDemoUpload] = useState({
    title: '',
    description: '',
    file: null,
    type: 'online', // online, offline
    courseTag: ''
  });


  // Load submitted day plans from backend
  useEffect(() => {
    const fetchSubmittedDayPlans = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.TRAINEE_DAY_PLANS.GET_ALL);
        if (response.data.dayPlans) {
          const formattedPlans = response.data.dayPlans.map(plan => ({
            id: plan._id,
            date: plan.date,
            tasks: plan.tasks,
            checkboxes: plan.checkboxes || {},
            submittedAt: plan.submittedAt,
            status: plan.status,
            createdBy: plan.createdBy || 'trainee' // Include who created the plan
          }));
          setSubmittedDayPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Error fetching submitted day plans:', error);
        // Don't show error to user as this is background loading
      }
    };

    fetchSubmittedDayPlans();
  }, []);

  // Load draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('traineeDayPlanDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setDayPlan({
          tasks: draftData.tasks,
          date: draftData.date,
          status: 'draft'
        });
        setDynamicCheckboxes(draftData.checkboxes || {});
        toast.success('Draft loaded from previous session');
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('traineeDayPlanDraft');
      }
    }
  }, []);

  const handleAddTask = () => {
    setDayPlan(prev => ({
      ...prev,
      tasks: [...prev.tasks, { 
        id: Date.now(), 
        title: '', 
        timeAllocation: '', 
        description: '' 
      }]
    }));
  };

  const handleTaskChange = (taskId, field, value) => {
    setDayPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        task.id === taskId ? { ...task, [field]: value } : task
      )
    }));
  };

  const handleRemoveTask = (taskId) => {
    setDayPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  // Handle adding a new checkbox
  const handleAddCheckbox = (taskId) => {
    const checkboxId = `checkbox_${Date.now()}`;
    setDynamicCheckboxes(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [checkboxId]: {
          id: checkboxId,
          label: '',
          checked: false,
          timeAllocation: ''
        }
      }
    }));
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (taskId, checkboxId) => {
    setDynamicCheckboxes(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [checkboxId]: {
          ...prev[taskId][checkboxId],
          checked: !prev[taskId][checkboxId].checked
        }
      }
    }));
  };

  // Handle checkbox label change
  const handleCheckboxLabelChange = (taskId, checkboxId, label) => {
    setDynamicCheckboxes(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [checkboxId]: {
          ...prev[taskId][checkboxId],
          label: label
        }
      }
    }));
  };

  // Handle checkbox time allocation change
  const handleCheckboxTimeChange = (taskId, checkboxId, timeAllocation) => {
    setDynamicCheckboxes(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [checkboxId]: {
          ...prev[taskId][checkboxId],
          timeAllocation: timeAllocation
        }
      }
    }));
  };

  // Remove a checkbox
  const handleRemoveCheckbox = (taskId, checkboxId) => {
    setDynamicCheckboxes(prev => {
      const newCheckboxes = { ...prev };
      if (newCheckboxes[taskId]) {
        delete newCheckboxes[taskId][checkboxId];
        // If no checkboxes left for this task, remove the task entry
        if (Object.keys(newCheckboxes[taskId]).length === 0) {
          delete newCheckboxes[taskId];
        }
      }
      return newCheckboxes;
    });
  };


  // Helper function to validate time range format
  const isValidTimeRange = (timeString) => {
    if (!timeString || !timeString.trim()) return false;
    
    // Basic regex pattern for time range format: 9:05am–12:20pm or 09:05am–12:20pm
    // Accepts both en dash (–) and regular hyphen (-)
    const timeRangePattern = /^(\d{1,2}:\d{2}(am|pm))[–-](\d{1,2}:\d{2}(am|pm))$/i;
    return timeRangePattern.test(timeString.trim());
  };

  // Helper function to reset the form
  const resetForm = () => {
    setDayPlan({
      tasks: [{ id: 1, title: '', timeAllocation: '', description: '' }],
      date: moment().format('YYYY-MM-DD'),
      status: 'draft'
    });
    setDynamicCheckboxes({});
    setIsEditing(false);
  };

  const handleViewDayPlan = (plan) => {
    setSelectedDayPlan(plan);
    setShowViewPopup(true);
  };

  const handleEditDayPlan = (plan) => {
    // Close the view popup if it's open
    setShowViewPopup(false);
    
    // console.log('=== EDIT DAY PLAN DEBUG START ===');
    // console.log('Original plan received:', plan);
    // console.log('Plan tasks:', plan.tasks);
    // console.log('Plan checkboxes:', plan.checkboxes);
    
    // Ensure tasks have proper IDs for checkbox mapping
    const tasksWithIds = plan.tasks.map((task, index) => {
      // Preserve the original task ID if it exists, otherwise generate one
      const taskWithId = {
        ...task,
        id: task.id || `task_${Date.now()}_${index}` // Generate ID if missing
      };
      console.log(`Task ${index}:`, { original: task, withId: taskWithId });
      return taskWithId;
    });
    
   // console.log('Tasks with IDs:', tasksWithIds);
    
    // Load the plan data into the form for editing
    setDayPlan({
      tasks: tasksWithIds,
      date: plan.date,
      status: 'draft'
    });
    
    // Map checkboxes to use the task IDs
    const mappedCheckboxes = {};
    if (plan.checkboxes) {
      // console.log('Original checkboxes structure:', plan.checkboxes);
      // console.log('Available checkbox keys:', Object.keys(plan.checkboxes));
      
      // For each task, map its checkboxes using the task ID
      tasksWithIds.forEach((task, index) => {
        const taskId = task.id;
        
        // Try multiple possible keys for the checkboxes
        const possibleKeys = [
          String(taskId),     // Task ID as string (e.g., "1")
          taskId,             // Task ID as number (e.g., 1)
          String(index),      // Task index as string (e.g., "0")
          index               // Task index as number (e.g., 0)
        ];
        
      //  console.log(`Task ${index} (ID: ${taskId}): Trying possible keys:`, possibleKeys);
        
        let found = false;
        for (const key of possibleKeys) {
          if (plan.checkboxes[key]) {
           // console.log(`Found checkboxes for task ${index} with key "${key}", mapping to task ID: ${taskId}`);
            mappedCheckboxes[taskId] = plan.checkboxes[key];
            found = true;
            break;
          }
        }
        
        if (!found) {
          console.log(`No checkboxes found for task ${index} with any key`);
        }
      });
    }
    
    // console.log('Final mapped checkboxes before setting:', mappedCheckboxes);
    // console.log('Mapped checkbox keys:', Object.keys(mappedCheckboxes));
    
    setDynamicCheckboxes(mappedCheckboxes);
    
    // Set editing state
    setIsEditing(true);
    
    // Remove the plan from submitted plans since we're editing it
    setSubmittedDayPlans(prev => prev.filter(p => p.id !== plan.id));
    
    // console.log('Edit day plan - Original plan:', plan);
    // console.log('Edit day plan - Tasks with IDs:', tasksWithIds);
    // console.log('Edit day plan - Mapped checkboxes:', mappedCheckboxes);
    // console.log('=== EDIT DAY PLAN DEBUG END ===');
    
    // Add a small delay to check if dynamicCheckboxes state is updated
    setTimeout(() => {
      console.log('Dynamic checkboxes state after setting:', dynamicCheckboxes);
    }, 100);
    
    toast.success('Day plan loaded for editing');
  };

  const handleCancelEdit = () => {
    // Reset form to default state
    resetForm();
    
    // Clear editing state
    setIsEditing(false);
    
    // Refresh submitted day plans to show the original plan
    const fetchSubmittedDayPlans = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.TRAINEE_DAY_PLANS.GET_ALL);
        if (response.data.dayPlans) {
          const formattedPlans = response.data.dayPlans.map(plan => ({
            id: plan._id,
            date: plan.date,
            tasks: plan.tasks,
            checkboxes: plan.checkboxes || {},
            submittedAt: plan.submittedAt,
            status: plan.status
          }));
          setSubmittedDayPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Error fetching submitted day plans:', error);
      }
    };
    fetchSubmittedDayPlans();
    
    toast.success('Edit cancelled');
  };

  const handleSaveDayPlan = () => {
    // Validate regular tasks
    const hasEmptyTasks = dayPlan.tasks.some(task => 
      !task.title.trim() || !task.timeAllocation || !isValidTimeRange(task.timeAllocation)
    );
    
    // Validate dynamic checkboxes
    const hasEmptyCheckboxes = Object.values(dynamicCheckboxes).some(taskCheckboxes => 
      Object.values(taskCheckboxes).some(checkbox => 
        checkbox.checked && (!checkbox.label.trim() || !checkbox.timeAllocation || !isValidTimeRange(checkbox.timeAllocation))
      )
    );
    
    if (hasEmptyTasks || hasEmptyCheckboxes) {
      toast.error('Please fill in all task and checkbox details with valid time ranges (e.g., 9:05am-12:20pm)');
      return;
    }

    // Save to localStorage only
    const draftData = {
      date: dayPlan.date,
      tasks: dayPlan.tasks,
      checkboxes: dynamicCheckboxes,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('traineeDayPlanDraft', JSON.stringify(draftData));
    
    // Reset form after successful save
    resetForm();
    
    toast.success('Day plan saved as draft');
  };

  const handleSubmitDayPlan = async () => {
    // Validate regular tasks
    const hasEmptyTasks = dayPlan.tasks.some(task => 
      !task.title.trim() || !task.timeAllocation || !isValidTimeRange(task.timeAllocation)
    );
    
    // Validate dynamic checkboxes
    const hasEmptyCheckboxes = Object.values(dynamicCheckboxes).some(taskCheckboxes => 
      Object.values(taskCheckboxes).some(checkbox => 
        checkbox.checked && (!checkbox.label.trim() || !checkbox.timeAllocation || !isValidTimeRange(checkbox.timeAllocation))
      )
    );
    
    if (hasEmptyTasks || hasEmptyCheckboxes) {
      toast.error('Please fill in all task and checkbox details with valid time ranges (e.g., 9:05am-12:20pm)');
      return;
    }

    try {
      // Submit to backend
      const response = await axiosInstance.post(API_PATHS.TRAINEE_DAY_PLANS.CREATE, {
        date: dayPlan.date,
        tasks: dayPlan.tasks,
        checkboxes: dynamicCheckboxes,
        status: 'submitted'
      });

      if (response.data.success !== false) {
        // Add to submitted day plans for immediate UI update
        const submittedPlan = {
          id: response.data.dayPlan._id,
          date: dayPlan.date,
          tasks: dayPlan.tasks,
          checkboxes: dynamicCheckboxes,
          submittedAt: new Date().toISOString(),
          status: 'in_progress'
        };

        setSubmittedDayPlans(prev => [submittedPlan, ...prev]);

        // Clear localStorage draft
        localStorage.removeItem('traineeDayPlanDraft');

        // Reset form after successful submission
        resetForm();
        
        toast.success(isEditing ? 'Day plan updated successfully' : 'Day plan submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting day plan:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit day plan. Please try again.');
      }
    }
  };

  const handleTaskStatusChange = (planId, taskIndex, status, remarks) => {
    const key = `${planId}-${taskIndex}`;
    setTaskStatuses(prev => ({
      ...prev,
      [key]: status
    }));
    
    // Clear remarks if status is completed
    if (status === 'completed') {
      setTaskRemarks(prev => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const handleTaskRemarksChange = (planId, taskIndex, remarks) => {
    const key = `${planId}-${taskIndex}`;
    setTaskRemarks(prev => ({
      ...prev,
      [key]: remarks
    }));
  };

  const toggleTaskExpansion = (planId, taskIndex) => {
    const key = `${planId}-${taskIndex}`;
    setExpandedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  const handleEodUpdate = async () => {
    // Validate that all tasks have status selected
    const todayPlans = submittedDayPlans.filter(plan => 
      moment(plan.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
    );
    
    let hasValidationError = false;
    const validationErrors = [];

    todayPlans.forEach(plan => {
      plan.tasks.forEach((task, index) => {
        const key = `${plan.id}-${index}`;
        const status = taskStatuses[key];
        const remarks = taskRemarks[key] || '';

        if (!status) {
          hasValidationError = true;
          validationErrors.push(`Task "${task.title}" - Please select a status`);
        } else if ((status === 'in_progress' || status === 'pending') && !remarks.trim()) {
          hasValidationError = true;
          validationErrors.push(`Task "${task.title}" - Remarks are required for In Progress and Pending status`);
        }
      });
    });

    if (hasValidationError) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    try {
      // Prepare task updates
      const taskUpdates = [];
      todayPlans.forEach(plan => {
        plan.tasks.forEach((task, index) => {
          const key = `${plan.id}-${index}`;
          const status = taskStatuses[key];
          const remarks = taskRemarks[key] || '';

          taskUpdates.push({
            planId: plan.id,
            taskIndex: index,
            taskTitle: task.title,
            status: status,
            remarks: remarks,
            timeAllocation: task.timeAllocation
          });
        });
      });

      // Send EOD update to backend
      const requestData = {
        date: moment().format('YYYY-MM-DD'),
        tasks: taskUpdates,
        overallRemarks: eodStatus.remarks
      };
      
      //console.log("Sending EOD update request:", requestData);
      
      const response = await axiosInstance.post('/api/trainee-dayplans/eod-update', requestData);

      if (response.data.success !== false) {
    setEodStatus(prev => ({ ...prev, submitted: true }));
    toast.success('EOD status updated successfully');
        
        // Send notification to trainer
        // This will be handled by the backend
      }
    } catch (error) {
     // console.error('Error updating EOD status:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update EOD status. Please try again.');
      }
    }
  };

  const handleDemoUpload = () => {
    if (!demoUpload.title || !demoUpload.description) {
      toast.error('Please fill in demo title and description');
      return;
    }
    toast.success('Demo uploaded successfully');
  };


  const renderDayPlan = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Day Plan Submission</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Date: {moment(dayPlan.date).format('MMM DD, YYYY')}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              dayPlan.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {dayPlan.status === 'submitted' ? 'Submitted' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {dayPlan.tasks.map((task, index) => (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Task {index + 1}</h3>
                {dayPlan.tasks.length > 1 && (
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <LuX className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTaskChange(task.id, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Allocation</label>
                  <input
                    type="text"
                    value={task.timeAllocation}
                    onChange={(e) => handleTaskChange(task.id, 'timeAllocation', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      task.timeAllocation && !isValidTimeRange(task.timeAllocation)
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g., 9:05am-12:20pm or 9:05am–12:20pm"
                  />
                  {task.timeAllocation && !isValidTimeRange(task.timeAllocation) && (
                    <p className="text-xs text-red-500 mt-1">Please use format: 9:05am-12:20pm or 9:05am–12:20pm</p>
                  )}
                </div>
              </div>

              {/* Dynamic Checkboxes Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Checkboxes</label>
                  <button
                    onClick={() => handleAddCheckbox(task.id)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                  >
                    <LuPlus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
                
                {/* Display checkboxes for this task */}
                {(() => {
                  // console.log(`=== CHECKBOX RENDERING DEBUG ===`);
                  // console.log(`Task ID: ${task.id}`);
                  // console.log(`Dynamic checkboxes keys:`, Object.keys(dynamicCheckboxes));
                  // console.log(`Dynamic checkboxes for task ${task.id}:`, dynamicCheckboxes[task.id]);
                  // console.log(`All dynamic checkboxes:`, dynamicCheckboxes);
                  
                  if (!dynamicCheckboxes[task.id] || Object.keys(dynamicCheckboxes[task.id]).length === 0) {
                   // console.log(`No checkboxes found for task ${task.id}`);
                    return (
                      <div className="text-sm text-gray-500 italic mb-3">
                        No checkboxes added for this task
                      </div>
                    );
                  }
                  return Object.values(dynamicCheckboxes[task.id]).map((checkbox) => (
                  <div key={checkbox.id} className="mb-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3 mb-2">
                      <input
                        type="checkbox"
                        checked={checkbox.checked}
                        onChange={() => handleCheckboxToggle(task.id, checkbox.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={checkbox.label}
                        onChange={(e) => handleCheckboxLabelChange(task.id, checkbox.id, e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter checkbox label"
                      />
                      <div className="relative">
                        <input
                          type="text"
                          value={checkbox.timeAllocation}
                          onChange={(e) => handleCheckboxTimeChange(task.id, checkbox.id, e.target.value)}
                          className={`w-32 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            checkbox.timeAllocation && !isValidTimeRange(checkbox.timeAllocation)
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder="9:05am-12:20pm"
                        />
                        {checkbox.timeAllocation && !isValidTimeRange(checkbox.timeAllocation) && (
                          <div className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap">
                            Invalid format
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveCheckbox(task.id, checkbox.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <LuX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ));
                })()}
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={task.description}
                  onChange={(e) => handleTaskChange(task.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Describe the task in detail"
                />
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddTask}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
          >
            <LuPlus className="w-4 h-4" />
            <span>Add Another Task</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <LuX className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
          
          <button
            onClick={handleSaveDayPlan}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <LuSave className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>
          
          <button
            onClick={handleSubmitDayPlan}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <LuCheck className="w-4 h-4" />
            <span>{isEditing ? 'Update Day Plan' : 'Submit Day Plan'}</span>
          </button>
        </div>
      </div>

      {/* Previous Day Plans */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Day Plans</h3>
        {submittedDayPlans.length > 0 ? (
        <div className="space-y-2">
            {submittedDayPlans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                    {moment(plan.date).format('MMM DD, YYYY')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {plan.tasks.length} task{plan.tasks.length !== 1 ? 's' : ''} • 
                    {plan.checkboxes && Object.keys(plan.checkboxes).length > 0 && 
                      ` ${Object.values(plan.checkboxes).flat().length} checkbox${Object.values(plan.checkboxes).flat().length !== 1 ? 'es' : ''}`
                    }
                  </p>
              </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    plan.status === 'draft' 
                      ? 'bg-gray-100 text-gray-800'
                      : plan.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : plan.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : plan.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {plan.status === 'draft' ? 'Draft' :
                     plan.status === 'in_progress' ? 'In Progress' :
                     plan.status === 'completed' ? 'Completed' :
                     plan.status === 'rejected' ? 'Rejected' :
                     plan.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleViewDayPlan(plan)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                    >
                <LuEye className="w-4 h-4" />
                <span>View</span>
              </button>
                    {plan.status === 'in_progress' && (
                      <button 
                        onClick={() => handleEditDayPlan(plan)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <LuPencil className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-8">
            <LuFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No assigned tasks for today</p>
            <p className="text-gray-400 text-xs mt-1">Tasks assigned by your trainer will appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTaskStatus = () => (
    <div className="space-y-6">
      {/* Day Plans Display */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Tasks</h2>
        
        {(() => {
          const todayPlans = submittedDayPlans.filter(plan => 
            moment(plan.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') &&
            (plan.status === 'completed' || plan.status === 'pending') // Show accepted and pending day plans
          );
          
          // Debug logging
          // console.log('All submitted day plans:', submittedDayPlans);
          // console.log('Today\'s plans:', todayPlans);
          // console.log('Today\'s date:', moment().format('YYYY-MM-DD'));
          
          return todayPlans.length > 0 ? (
        <div className="space-y-4">
              {todayPlans.map((plan, planIndex) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {todayPlans.length > 1 ? `Task Set ${planIndex + 1}` : 'Assigned Tasks'} - {moment(plan.date).format('MMM DD, YYYY')}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {plan.createdBy === 'trainer' ? 'Created by Trainer' : 'Your Submitted Plan'} • {plan.tasks.length} task{plan.tasks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                      plan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      plan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status === 'in_progress' ? 'In Progress' :
                       plan.status === 'completed' ? 'Accepted' :
                       plan.status === 'rejected' ? 'Rejected' :
                       plan.status === 'pending' ? 'Pending' :
                       plan.status}
                    </span>
              </div>
              
                  {/* Tasks from Day Plan */}
                  <div className="space-y-3">
                    {plan.tasks.map((task, index) => {
                      const taskKey = `${plan.id}-${index}`;
                      const isExpanded = expandedTasks[taskKey];
                      const currentStatus = taskStatuses[taskKey];
                      const currentRemarks = taskRemarks[taskKey] || '';
                      const isEodApproved = plan.eodUpdate?.status === 'approved';
                      
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div 
                            className={`flex items-center justify-between mb-2 p-2 rounded transition-colors ${
                              !isEodApproved ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'
                            }`}
                            onClick={() => !isEodApproved && toggleTaskExpansion(plan.id, index)}
                          >
                            <h4 className="font-medium text-gray-900">Task {index + 1}: {task.title}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-blue-600 font-medium">{task.timeAllocation}</span>
                              {currentStatus && (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                  currentStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {currentStatus}
                                </span>
                              )}
                              {!isEodApproved && (
                                <span className="text-gray-400">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          )}
                          
                          {/* Expanded Task Status Selection - Only show if EOD not approved */}
                          {isExpanded && !isEodApproved && (
                            <div className="space-y-3 mt-4">
                              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                                  <input 
                                    type="radio" 
                                    name={`status-${plan.id}-${index}`} 
                                    value="completed" 
                                    className="text-green-500"
                                    checked={currentStatus === 'completed'}
                                    onChange={() => handleTaskStatusChange(plan.id, index, 'completed', '')}
                                  />
                  <span className="text-sm text-gray-700">Completed</span>
                </label>
                <label className="flex items-center space-x-2">
                                  <input 
                                    type="radio" 
                                    name={`status-${plan.id}-${index}`} 
                                    value="in_progress" 
                                    className="text-yellow-500"
                                    checked={currentStatus === 'in_progress'}
                                    onChange={() => handleTaskStatusChange(plan.id, index, 'in_progress', '')}
                                  />
                  <span className="text-sm text-gray-700">In Progress</span>
                </label>
                <label className="flex items-center space-x-2">
                                  <input 
                                    type="radio" 
                                    name={`status-${plan.id}-${index}`} 
                                    value="pending" 
                                    className="text-red-500"
                                    checked={currentStatus === 'pending'}
                                    onChange={() => handleTaskStatusChange(plan.id, index, 'pending', '')}
                                  />
                  <span className="text-sm text-gray-700">Pending</span>
                </label>
              </div>
              
                              {/* Remarks Field - Required for In Progress and Pending */}
                              {(currentStatus === 'in_progress' || currentStatus === 'pending') && (
              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Remarks/Blockers
                                    <span className="text-red-500 ml-1">*</span>
                                  </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Add any remarks or blockers for this task"
                                    value={currentRemarks}
                                    onChange={(e) => handleTaskRemarksChange(plan.id, index, e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show read-only status when EOD is approved */}
                          {isExpanded && isEodApproved && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-800">Final Status</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                  currentStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {currentStatus === 'completed' ? 'Completed' :
                                   currentStatus === 'in_progress' ? 'In Progress' :
                                   currentStatus === 'pending' ? 'Pending' : 'Not Set'}
                                </span>
                              </div>
                              {currentRemarks && (
                                <p className="text-sm text-green-700">
                                  <strong>Remarks:</strong> {currentRemarks}
                                </p>
                              )}
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Approved by trainer - No longer editable
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            </div>
          ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <LuFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No approved tasks for today</p>
              <p className="text-gray-400 text-xs mt-1">Approved day plans and assigned tasks will appear here</p>
            </div>
          );
        })()}
        </div>

      {/* EOD Update Section */}
      {submittedDayPlans.some(plan => moment(plan.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) && (() => {
        const todayPlan = submittedDayPlans.find(plan => 
          moment(plan.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
        );
        const isPending = todayPlan?.status === 'pending';
        const isCompleted = todayPlan?.status === 'completed';
        const isEodPending = todayPlan?.eodUpdate?.status === 'submitted' && todayPlan?.status === 'pending';
        const isEodApproved = todayPlan?.eodUpdate?.status === 'approved';
        const isEodRejected = todayPlan?.eodUpdate?.status === 'rejected';
        
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">End of Day Update</h3>
              <div className="flex items-center space-x-2">
                {isEodPending && (
                  <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800">
                    EOD Pending
                  </span>
                )}
                {isEodApproved && (
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    EOD Approved
                  </span>
                )}
                {isEodRejected && (
                  <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                    EOD Rejected
                  </span>
                )}
                {isPending && !isEodPending && !isEodApproved && !isEodRejected && (
                  <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                )}
                {isCompleted && !isEodApproved && !isEodRejected && (
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                )}
                {!isPending && !isCompleted && !isEodPending && !isEodApproved && !isEodRejected && (
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                    Not Submitted
                  </span>
                )}
                {isPending && !isEodPending && !isEodApproved && !isEodRejected && (
                  <button
                    onClick={() => setIsEditingEod(!isEditingEod)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {isEditingEod ? 'Cancel Edit' : 'Edit'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Show EOD data when pending, completed, EOD pending, approved, or rejected */}
            {(isPending || isCompleted || isEodPending || isEodApproved || isEodRejected) && todayPlan?.eodUpdate && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Submitted EOD Update</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Overall Remarks:</span>
                    <p className="text-sm text-gray-600 mt-1">{todayPlan.eodUpdate.overallRemarks || 'No remarks provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Submitted At:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {moment(todayPlan.eodUpdate.submittedAt).format('MMM DD, YYYY h:mm A')}
                    </p>
                  </div>
                  {todayPlan.eodUpdate.reviewComments && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Review Comments:</span>
                      <p className="text-sm text-gray-600 mt-1">{todayPlan.eodUpdate.reviewComments}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Show input form only when not pending/completed/EOD pending/approved/rejected or when editing */}
            {(!isPending && !isCompleted && !isEodPending && !isEodApproved && !isEodRejected) || isEditingEod ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Remarks
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Add any overall remarks about today's work"
                    value={eodStatus.remarks}
                    onChange={(e) => setEodStatus(prev => ({ ...prev, remarks: e.target.value }))}
                  />
                </div>
              </div>
            ) : null}

        <div className="mt-6 pt-4 border-t border-gray-200">
              {/* Show submit button when there are tasks and not in EOD approved/rejected state */}
              {!isEodApproved && !isEodRejected && (
          <button
            onClick={handleEodUpdate}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LuCheck className="w-4 h-4" />
                  <span>
                    {isEodPending ? 'EOD Submitted - Pending Review' : 
                     isEditingEod ? 'Update EOD' : 'Submit EOD Update'}
                  </span>
          </button>
              )}
        </div>
      </div>
        );
      })()}

      {/* Daily Task History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Task History</h3>
        
        {(() => {
          // Get only EOD approved day plans for history
          const approvedPlans = submittedDayPlans.filter(plan => 
            plan.eodUpdate?.status === 'approved'
          );

          if (approvedPlans.length === 0) {
            return (
              <div className="text-center py-8">
                <LuClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No task history available</p>
                <p className="text-gray-400 text-xs mt-1">Your approved tasks will appear here</p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {/* Show approved tasks with progress bars */}
              {approvedPlans.map((plan) => {
                const isApproved = plan.eodUpdate?.status === 'approved';
                
                return (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">
                        {moment(plan.date).format('MMM DD, YYYY')}
                      </h5>
                      {isApproved && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          ✓ Approved
                        </span>
                      )}
              </div>
                    
                    <div className="space-y-3">
                      {plan.tasks.map((task, index) => {
                        const status = task.status; // Use the actual status from the database
                        const remarks = task.remarks || '';
                        
                        // Calculate progress percentage
                        const progressPercentage = status === 'completed' ? 100 : 
                                                status === 'in_progress' ? 50 : 
                                                status === 'pending' ? 0 : 0;
                        
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">{task.title}</span>
                                <span className="text-sm text-gray-500 ml-2">({task.timeAllocation})</span>
            </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                status === 'completed' ? 'bg-green-100 text-green-800' :
                                status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                status === 'pending' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {status === 'completed' ? 'Completed' :
                                 status === 'in_progress' ? 'In Progress' :
                                 status === 'pending' ? 'Pending' :
                                 'Not Set'}
                              </span>
        </div>
                            
                            {/* Progress Bar */}
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{progressPercentage}%</span>
      </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progressPercentage === 100 ? 'bg-green-500' :
                                    progressPercentage === 50 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {remarks && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                <strong>Remarks:</strong> {remarks}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {plan.eodUpdate?.overallRemarks && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h6 className="font-medium text-gray-900 mb-1">Overall Remarks:</h6>
                        <p className="text-sm text-gray-600">{plan.eodUpdate.overallRemarks}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );

  const renderDemoManagement = () => (
    <div className="space-y-6">
      {/* Upload Online Demo */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Online Demo</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Demo Title</label>
            <input
              type="text"
              value={demoUpload.title}
              onChange={(e) => setDemoUpload(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter demo title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={demoUpload.description}
              onChange={(e) => setDemoUpload(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Describe your demo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course/Unit Tag</label>
            <select
              value={demoUpload.courseTag}
              onChange={(e) => setDemoUpload(prev => ({ ...prev, courseTag: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select course/unit</option>
              <option value="react-fundamentals">React Fundamentals</option>
              <option value="nodejs-backend">Node.js Backend</option>
              <option value="database-design">Database Design</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <LuUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Drag and drop your demo file here</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Choose File
              </button>
              <p className="text-xs text-gray-500 mt-2">Supports: MP4, MOV, AVI, or share a link</p>
            </div>
          </div>
          
          <button
            onClick={handleDemoUpload}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LuUpload className="w-4 h-4" />
            <span>Upload Demo</span>
          </button>
        </div>
      </div>

      {/* Offline Demo Slot Request */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Offline Demo Slot Request</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Available Slots</h3>
            <div className="space-y-2">
              {['2024-01-30 10:00 AM', '2024-01-30 2:00 PM', '2024-01-31 11:00 AM'].map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{slot}</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Request
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Your Requests</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-700">2024-01-28 2:00 PM</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">2024-01-25 10:00 AM</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );






  const tabs = [
    { id: 'day-plan', label: 'Day Plan', icon: LuCalendar },
    { id: 'task-status', label: 'Task Status', icon: LuCheck },
    { id: 'demo-management', label: 'Demo Management', icon: LuVideo }
  ];

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trainee Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Manage your daily tasks and track your progress.</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'day-plan' && renderDayPlan()}
          {activeTab === 'task-status' && renderTaskStatus()}
          {activeTab === 'demo-management' && renderDemoManagement()}
        </div>
      </div>

      {/* View Day Plan Popup */}
      {showViewPopup && selectedDayPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Day Plan - {moment(selectedDayPlan.date).format('MMM DD, YYYY')}
              </h3>
              <button
                onClick={() => setShowViewPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <LuX className="w-6 h-6" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
              <span className={`px-3 py-1 text-sm rounded-full ${
                selectedDayPlan.status === 'draft' 
                  ? 'bg-gray-100 text-gray-800'
                  : selectedDayPlan.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-800'
                  : selectedDayPlan.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : selectedDayPlan.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedDayPlan.status === 'draft' ? 'Draft' :
                 selectedDayPlan.status === 'in_progress' ? 'In Progress' :
                 selectedDayPlan.status === 'completed' ? 'Completed' :
                 selectedDayPlan.status === 'rejected' ? 'Rejected' :
                 selectedDayPlan.status}
              </span>
            </div>

            {/* Tasks Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Tasks</h4>
              <div className="space-y-3">
                {selectedDayPlan.tasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{task.title}</h5>
                      <span className="text-sm text-blue-600 font-medium">{task.timeAllocation}</span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Checkboxes Section */}
            {selectedDayPlan.checkboxes && Object.keys(selectedDayPlan.checkboxes).length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Additional Activities</h4>
                <div className="space-y-3">
                  {Object.entries(selectedDayPlan.checkboxes).map(([taskId, taskCheckboxes]) => (
                    <div key={taskId}>
                      {Object.entries(taskCheckboxes).map(([checkboxId, checkbox]) => (
                        <div key={checkboxId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <LuCheck className={`w-4 h-4 ${checkbox.checked ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className={`font-medium ${checkbox.checked ? 'text-gray-900' : 'text-gray-500'}`}>
                                {checkbox.label}
                              </span>
                            </div>
                            {checkbox.timeAllocation && (
                              <span className="text-sm text-blue-600 font-medium">{checkbox.timeAllocation}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Details */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Submitted:</span> {selectedDayPlan.submittedAt ? moment(selectedDayPlan.submittedAt).format('MMM DD, YYYY h:mm A') : 'Not submitted'}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedDayPlan.status}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              {selectedDayPlan.status === 'in_progress' && (
                <button
                  onClick={() => handleEditDayPlan(selectedDayPlan)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <LuPencil className="w-4 h-4" />
                  <span>Edit Plan</span>
                </button>
              )}
              <button
                onClick={() => setShowViewPopup(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TraineeMainDashboard;
