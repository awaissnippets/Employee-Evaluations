import axios from 'axios';
import React, { useState, useEffect } from 'react';

export default function EvaluationTargetPage() {

  const [targets, setTargets] = useState([]);
  const [employeeCode, setEmployeeCode] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [marks, setMarks] = useState('');
  const [Tmarks, seTMarks] = useState('');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [discussedWithStaff, setDiscussedWithStaff] = useState('no');
  const [comments, setComments] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(true);


  const [campaigns, setCampaigns] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);


const [achievement, setachievement] = useState('')

//table
 const [goalList, setGoalList] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;


  const fetchGoals = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/targets/list");
      setGoalList(response.data);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  };
  useEffect(() => {
    fetchGoals();
  }, []);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentGoals = goalList.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(goalList.length / rowsPerPage);

  const handleRowClick = (goal) => {
    setActiveGoal(goal);
  };

  const handleCloseModal = () => {
    setActiveGoal(null);
  };


  const handleAddTarget = () => {
    if (target) {
      const newTarget = {
        id: targets.length + 1,
        target: target,
        description: description,
        marks: marks
      };
      setTargets([...targets, newTarget]);
      // Clear form fields after adding
      setTarget('');
      setDescription('');
    }
  };

  useEffect(() => {
    // Fetch employee list from API
    fetch('http://localhost:8080/api/employees/list')
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error('Error fetching employees:', error));
  }, []);

  useEffect(() => {
    // Fetch campaigns using POST API
    fetch('http://localhost:8080/api/hr/viewAll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Add request body if required
    })
      .then(res => res.json())
      .then(data => {
        setCampaigns(data); // Adjust this line if response is nested
      })
      .catch(err => console.error('Failed to fetch campaigns:', err));
  }, []);

  const handleCampaignChange = (e) => {
    const input = e.target.value;
    setCampaignName(input);

    if (input.length > 0) {
      const filtered = campaigns.filter(c =>
        c.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredCampaigns(filtered);
      setShowCampaignDropdown(true);
    } else {
      setShowCampaignDropdown(false);
    }
  };

  const handleCampaignSelect = (campaign) => {
    setCampaignName(campaign.name);
    setSelectedCampaignId(campaign.id);
    setShowCampaignDropdown(false);
    console.log('Selected Campaign ID:', campaign.id);
  };
  const handleChange = (e) => {
    const input = e.target.value;
    setEmployeeName(input);

    if (input.length > 0) {
      const filtered = employees.filter((emp) =>
        emp.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (emp) => {
    setEmployeeName(emp.name);
    setSelectedEmployeeId(emp.id);
    setShowDropdown(false);

    // ✅ Log selected employee ID
    console.log('Selected Employee ID:', emp.id);
  };


  const handleSave = () => {
    // Save logic would go here
    console.log('Saving evaluation target');
  };

  const handleClear = () => {
    setEmployeeCode('');
    setEmployeeName('');
    setMarks('');
    setTarget('');
    setDescription('');
    setTargets([]);
    setComments('');
    setSaveAsNew(true);
    setDiscussedWithStaff('no');
  };

  const handleEmployeeSearch = () => {
    // This would normally query a database
    // For demo purposes, we'll just set a mock employee name
    if (employeeCode) {
      setEmployeeName('John Smith');
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      employeeId: selectedEmployeeId,
      evaluationCampaignId: selectedCampaignId,
      targetName : target,
      description,
      achievement,
      totalMarks: parseInt(Tmarks),
      marksObtained: parseInt(marks)
    };

    fetch('http://localhost:8080/api/targets/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log('Target created:', data);
        alert('Target created successfully!');
        fetchGoals();
      })
      .catch(err => {
        console.error('Error creating target:', err);
        alert('Failed to create target.');
      });
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>

          <div className="flex justify-between items-center bg-gray-200 p-3 rounded-t-lg">
            <h2 className="text-xl font-semibold text-gray-700">Evaluation Target</h2>

          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className='relative'>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign:</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={handleCampaignChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start typing campaign name..."
                />

                {showCampaignDropdown && filteredCampaigns.length > 0 && (
                  <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {filteredCampaigns.map((campaign) => (
                      <li
                        key={campaign.id}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => handleCampaignSelect(campaign)}
                      >
                        {campaign.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Id:</label>
                <div className="flex">
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedEmployeeId}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 relative ">
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name:</label>
              <input
                type="text"
                value={employeeName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start typing to search..."
              />

              {showDropdown && filteredEmployees.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                  {filteredEmployees.map((emp) => (
                    <li
                      key={emp.employeeId}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSelect(emp)}
                    >
                      {emp.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks :</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={Tmarks}
                  onChange={(e) => seTMarks(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>


            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Achievement:</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={achievement}
                onChange={(e) => setachievement(e.target.value)}
              ></textarea>
            </div>

            <div className="flex space-x-2 mb-6">
              <button
                       type="submit"

                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              >

                Save
              </button>

              <button
                onClick={handleClear}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        </form>
        <div className="m-6 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Performance Goals</h2>

      <table className="min-w-full bg-white border border-gray-300 shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Employee ID</th>
            <th className="px-4 py-2 border">Target Name</th>
            <th className="px-4 py-2 border">Description</th>
            <th className="px-4 py-2 border">Marks Obtained</th>
          </tr>
        </thead>
        <tbody>
          {currentGoals.map((goal) => (
            <tr
              key={goal.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(goal)}
            >
              <td className="px-4 py-2 border">{goal.id}</td>
              <td className="px-4 py-2 border">{goal.employeeId}</td>
              <td className="px-4 py-2 border">{goal.targetName}</td>
              <td className="px-4 py-2 border">{goal.description}</td>
              <td className="px-4 py-2 border">
                {goal.marksObtained !== null ? goal.marksObtained : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal for Goal Details */}
      {activeGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4">Goal Details</h3>
            <p><strong>ID:</strong> {activeGoal.id}</p>
            <p><strong>Employee ID:</strong> {activeGoal.employeeId}</p>
            <p><strong>Evaluation Campaign ID:</strong> {activeGoal.evaluationCampaignId}</p>
            <p><strong>Target Name:</strong> {activeGoal.targetName}</p>
            <p><strong>Description:</strong> {activeGoal.description}</p>
            <p><strong>Achievement:</strong> {activeGoal.achievement || "—"}</p>
            <p><strong>Total Marks:</strong> {activeGoal.totalMarks}</p>
            <p><strong>Marks Obtained:</strong> {activeGoal.marksObtained || "—"}</p>
            <p><strong>Created:</strong> {new Date(activeGoal.createdDate).toLocaleString()}</p>
            <p><strong>Modified:</strong> {new Date(activeGoal.modifiedDate).toLocaleString()}</p>
          </div>
        </div>
      )}
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Discussed with Staff Members:</label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="discussedYes"
                name="discussedWithStaff"
                value="yes"
                checked={discussedWithStaff === 'yes'}
                onChange={() => setDiscussedWithStaff('yes')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="discussedYes" className="ml-2 text-sm font-medium text-gray-700">Yes</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="discussedNo"
                name="discussedWithStaff"
                value="no"
                checked={discussedWithStaff === 'no'}
                onChange={() => setDiscussedWithStaff('no')}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="discussedNo" className="ml-2 text-sm font-medium text-gray-700">No</label>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments:</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => { }}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
            title="Refresh"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
            title="Save"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293z" />
            </svg>
          </button>
        </div>
      </div>
    </div >
  );
}