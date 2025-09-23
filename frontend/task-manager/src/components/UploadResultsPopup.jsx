import React, { useState } from 'react';
import { LuX, LuUpload, LuFileSpreadsheet, LuSearch, LuCheck, LuInfo } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const UploadResultsPopup = ({ isOpen, onClose, onSuccess, examType }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [jsonData, setJsonData] = useState({});
  const [resultsData, setResultsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadErrors, setUploadErrors] = useState([]);

  // Get Google Sheet URL from environment
  const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

  const examTypeConfig = {
    daily: {
      name: 'Daily Quizzes',
      sheetName: 'AddDataForJoiners',
      dataSet: 'DailyQuizzes',
      resultPrefix: 'DailyQuizzesResults',
      expectedColumns: 'Author_id | Date | Type | DailyQuizzesResults'
    },
    fortnight: {
      name: 'Fortnight Exams',
      sheetName: 'AddDataForJoiners',
      dataSet: 'FortnightExamResults',
      resultPrefix: 'FortnightEaxmResults',
      expectedColumns: 'Author_id | Date | Type | FortnightEaxmResults'
    },
    course: {
      name: 'Course-Level Exams',
      sheetName: 'AddDataForJoiners',
      dataSet: 'CourseLevelExams',
      resultPrefix: 'CourseLevelExamResults',
      expectedColumns: 'Author_id | Date | Type | CourseLevelExamResults'
    }
  };

  const config = examTypeConfig[examType] || examTypeConfig.daily;

  const handleJsonChange = (e) => {
    try {
      const value = e.target.value;
      if (value.trim() === '') {
        setJsonData({});
        return;
      }
      const parsed = JSON.parse(value);
      setJsonData(parsed);
    } catch (error) {
      // Invalid JSON, but don't show error yet
      setJsonData({});
    }
  };

  const handleValidateSheets = async () => {
    if (!jsonData.spread_sheet_name || !jsonData.data_sets_to_be_loaded) {
      toast.error('Please provide valid JSON configuration');
      return;
    }

    setValidating(true);
    try {
      const response = await axiosInstance.post(API_PATHS.RESULTS.VALIDATE_SHEETS, {
        spread_sheet_name: jsonData.spread_sheet_name,
        data_sets_to_be_loaded: jsonData.data_sets_to_be_loaded,
        googleSheetUrl: googleSheetUrl || null
      });

      if (response.data.success) {
        toast.success('Configuration validated successfully! Spreadsheet name and datasets match.');
        setResultsData(response.data.data || []);
        setCurrentStep(2);
      } else {
        toast.error(response.data.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate configuration. Please check your data.');
    } finally {
      setValidating(false);
    }
  };

  const handleUploadData = async () => {
    if (resultsData.length === 0) {
      toast.error('No results data to upload');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.RESULTS.BULK_UPLOAD, {
        examType: examType,
        results: resultsData,
        config: jsonData
      });

      if (response.data.success) {
        toast.success(`Successfully uploaded ${response.data.uploadedCount} results!`);
        onSuccess(response.data);
        onClose();
        resetForm();
      } else {
        // Store errors for display
        setUploadErrors(response.data.errors || []);
        
        // Handle errors - show specific error messages
        if (response.data.errors && response.data.errors.length > 0) {
          // Show first few errors in toast
          const errorMessages = response.data.errors.slice(0, 3).join(', ');
          const moreErrors = response.data.errors.length > 3 ? ` and ${response.data.errors.length - 3} more errors` : '';
          toast.error(`${response.data.message} Errors: ${errorMessages}${moreErrors}`);
        } else {
          toast.error(response.data.message || 'Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setJsonData({});
    setResultsData([]);
    setSearchTerm('');
    setUploadErrors([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const filteredResults = resultsData.filter(result =>
    result.author_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.trainee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload {config.name}</h2>
            <p className="text-sm text-gray-600">Upload results from Google Sheets</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 1: Configuration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Provide the JSON configuration for your Google Sheet. The system will validate the spreadsheet name and dataset.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JSON Configuration
                    </label>
                    <textarea
                      value={Object.keys(jsonData).length > 0 ? JSON.stringify(jsonData, null, 2) : ''}
                      onChange={handleJsonChange}
                      placeholder={`{
  "spread_sheet_name": "${config.sheetName}",
  "data_sets_to_be_loaded": ["${config.dataSet}"]
}`}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the JSON configuration for your Google Sheet
                    </p>
                  </div>

                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                           <div className="flex items-start">
                             <LuInfo className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                             <div className="text-sm text-blue-800">
                               <p className="font-medium mb-1">Expected Configuration:</p>
                               <ul className="list-disc list-inside space-y-1">
                                 <li><strong>spread_sheet_name:</strong> "{config.sheetName}"</li>
                                 <li><strong>data_sets_to_be_loaded:</strong> ["{config.dataSet}"]</li>
                               </ul>
                <p className="mt-2 text-xs text-blue-700">
                  <strong>Expected columns:</strong> {config.expectedColumns}
                </p>
                             </div>
                           </div>
                         </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleValidateSheets}
                  disabled={!jsonData.spread_sheet_name || !jsonData.data_sets_to_be_loaded || validating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {validating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <LuCheck className="w-4 h-4" />
                      <span>Validate Configuration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 2: Review Results Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Review the results data that will be uploaded. The system will match results by author_id.
                </p>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by author_id, trainee name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Results List */}
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredResults.map((result, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-xs">
                                    {result.author_id ? result.author_id.substring(0, 2).toUpperCase() : '??'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {result.trainee_name || 'Unknown Trainee'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Author ID: {result.author_id || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Email: {result.email || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                Score: {result.score !== undefined && result.score !== null ? result.score : 'N/A'}/{result.total_marks || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {result.exam_date || 'No date'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <LuFileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No results data found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {uploadErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <LuInfo className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="text-sm font-medium text-red-800">Upload Errors</h4>
                  </div>
                  <div className="space-y-1">
                    {uploadErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Configuration
                </button>
                <button
                  onClick={handleUploadData}
                  disabled={resultsData.length === 0 || loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <LuUpload className="w-4 h-4" />
                      <span>Upload Results</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadResultsPopup;
