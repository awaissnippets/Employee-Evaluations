import React, { useState } from 'react';

export default function EmployeeEvaluationPage() {
  const [activeTab, setActiveTab] = useState('skillEvaluation');
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Annual Review 2025' },
    { id: 2, name: 'Quarterly Assessment Q1' },
    { id: 3, name: 'Performance Improvement Plan' }
  ]);
  
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [evaluationFor, setEvaluationFor] = useState('ALL');
  const [weightage, setWeightage] = useState('30');
  const [remarks, setRemarks] = useState('');
  const [skillScore, setSkillScore] = useState('0');
  const [targetScore, setTargetScore] = useState('0');
  
  // Sample data for the leave table
  const leaveData = [
    { type: 'Casual', value: '' },
    { type: 'Sick', value: '' },
    { type: 'Earned', value: '' },
    { type: 'Special', value: '' },
    { type: 'LWOP', value: '' },
  ];
  
  // Sample data for skills evaluation
  const [skillsData, setSkillsData] = useState([]);
  
  const handleEmployeeSearch = () => {
    // This would normally query a database
    // For demo, set mock employee data
    if (employeeCode) {
      setEmployeeName('John Smith');
      setDateOfBirth('15-05-1985');
      setDateOfJoining('10-06-2015');
      setDepartment('IT');
      setDesignation('Senior Developer');
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        <div className="bg-gray-200 p-3 rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-700 text-center">Employee Evaluation</h2>
        </div>
        
        <div className="p-6">
          {/* Employee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 w-32">Campaign:</label>
                <select 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 w-32">Date of Birth:</label>
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              
              <div className="flex items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 w-32">Department:</label>
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 w-32">Employee:</label>
                <div className="flex flex-1">
                  <input 
                    type="text" 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="Employee Code"
                  />
                  <button 
                    className="bg-gray-200 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-300"
                    onClick={handleEmployeeSearch}
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 w-32">Date of Joining:</label>
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                />
              </div>
              
              <div className="flex items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 w-32">Designation:</label>
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Leave Information */}
          <div className="mb-6 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {leaveData.map((leave, index) => (
                    <th key={index} className="py-2 px-4 border border-gray-300 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                      {leave.type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {leaveData.map((leave, index) => (
                    <td key={index} className="py-2 px-4 border border-gray-300">
                      <input 
                        type="text" 
                        className="w-full bg-transparent border-none focus:outline-none"
                        value={leave.value}
                        onChange={(e) => {
                          const newLeaveData = [...leaveData];
                          newLeaveData[index].value = e.target.value;
                        }}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex overflow-x-auto">
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'skillEvaluation' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} border border-gray-300 rounded-t-md hover:bg-blue-600 hover:text-white`}
                onClick={() => handleTabChange('skillEvaluation')}
              >
                Skills Evaluation
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'targetsEvaluation' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} border border-gray-300 rounded-t-md hover:bg-blue-600 hover:text-white border-l-0`}
                onClick={() => handleTabChange('targetsEvaluation')}
              >
                Targets Evaluation
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'overallAssessment' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} border border-gray-300 rounded-t-md hover:bg-blue-600 hover:text-white border-l-0`}
                onClick={() => handleTabChange('overallAssessment')}
              >
                Overall Assessment
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'recommendTraining' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} border border-gray-300 rounded-t-md hover:bg-blue-600 hover:text-white border-l-0`}
                onClick={() => handleTabChange('recommendTraining')}
              >
                Recommend Training
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'userComments' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} border border-gray-300 rounded-t-md hover:bg-blue-600 hover:text-white border-l-0`}
                onClick={() => handleTabChange('userComments')}
              >
                User Comments
              </button>
            </div>
          </div>
          
          {/* Tab Content - Skills Evaluation */}
          <div className={`border border-gray-300 rounded-b-md p-4 mb-6 ${activeTab !== 'skillEvaluation' ? 'hidden' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 w-32">Evaluation For:</label>
                <select 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={evaluationFor}
                  onChange={(e) => setEvaluationFor(e.target.value)}
                >
                  <option value="ALL">ALL</option>
                  <option value="Technical">Technical</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="block text-sm font-medium text-gray-700 w-32">Weightage:</label>
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={weightage}
                  onChange={(e) => setWeightage(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks:</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </div>
            
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Sr.#</th>
                    <th className="py-2 px-4 border border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Skill</th>
                    <th className="py-2 px-4 border border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Achievement</th>
                    <th className="py-2 px-4 border border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Marks</th>
                    <th className="py-2 px-4 border border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Marks Obtained</th>
                    <th className="py-2 px-4 border border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {skillsData.length > 0 ? (
                    skillsData.map((skill, index) => (
                      <tr key={index}>
                        <td className="py-2 px-4 border border-gray-300">{index + 1}</td>
                        <td className="py-2 px-4 border border-gray-300">{skill.name}</td>
                        <td className="py-2 px-4 border border-gray-300">{skill.achievement}</td>
                        <td className="py-2 px-4 border border-gray-300">{skill.totalMarks}</td>
                        <td className="py-2 px-4 border border-gray-300">{skill.marksObtained}</td>
                        <td className="py-2 px-4 border border-gray-300">{skill.grade}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-sm text-gray-500">No skills evaluation data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700">Total:</label>
                <input 
                  type="text" 
                  className="ml-2 w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value=""
                  readOnly
                />
              </div>
            </div>
          </div>
          
          {/* Bottom Score and Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Skill's Score:</label>
                <input 
                  type="text" 
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={skillScore}
                  onChange={(e) => setSkillScore(e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-700 mr-2">Target's Score:</label>
                <input 
                  type="text" 
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                />
              </div>
            </div>
            
            <button 
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}