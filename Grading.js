import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import Notification from '../Components/Notifications';

export default function EmployeeGradingPage() {

  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [updatedGrade, setUpdatedGrade] = useState({
    grade: '',
    expression: '',
    startMarks: '',
    endMarks: '',
    remarks: ''
  });

  const [refreshTrigger, setRefreshTrigger] = useState(false); // toggled to refetch

  const [currentGrade, setCurrentGrade] = useState('');
  const [gradeExpression, setGradeExpression] = useState('');
  const [initialMark, setInitialMark] = useState('');
  const [endMark, setEndMark] = useState('');
  const [remarks, setRemarks] = useState('');
  const [ip, setIp] = useState('');
  const [notification, setNotification] = useState(null);


  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  useEffect(() => {
    axios.get('https://api.ipify.org?format=json')
      .then((res) => setIp(res.data.ip))
      .catch((err) => console.error(err));
  }, []);
  console.log("IP Address:", ip);

  const clearForm = () => {
    setCurrentGrade('');
    setGradeExpression('');
    setInitialMark('');
    setEndMark('');
    setRemarks('');
  };


  //grade upgrade krega with selected grade
  const handleUpdateGrade = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/grade/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedGrade.id,
          grade: updatedGrade.grade || selectedGrade.grade,
          expression: updatedGrade.expression || selectedGrade.expression,
          startMarks: updatedGrade.startMarks || selectedGrade.startMarks,
          endMarks: updatedGrade.endMarks || selectedGrade.endMarks,
          remarks: updatedGrade.remarks || selectedGrade.remarks,
        }),
      });

      if (response.ok) {
        showNotification("success", "Grade updated successfully!");
        setSelectedGrade(null);
        setRefreshTrigger(prev => !prev); // refetch grades
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || "error", "Failed to update grade.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      showNotification("error", "Network error while updating grade.");
    }
  };

  //delete grade krega with selected grade
  const handleDeleteGrade = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete grade "${selectedGrade.grade}"?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/grade/delete/${encodeURIComponent(selectedGrade.grade)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("success",`Grade "${selectedGrade.grade}" deleted successfully.` );
        setSelectedGrade(null);
        setRefreshTrigger(prev => !prev); // Trigger refetch of grades
      } else {
        const errorData = await response.json();
        showNotification(errorData.message ||"error", "Failed to delete grade." );
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("error","Network error while deleting grade." );
    }
  };


  //grade fetch krega with refresh trigger

  useEffect(() => {
    fetch("http://localhost:8080/api/grade/list")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => a.grade.localeCompare(b.grade));
        setGrades(sorted);
      })
      .catch((err) => console.error("Error fetching grades:", err));
  }, [refreshTrigger]);



  const handleAddGrade = async () => {
    if (!currentGrade || !gradeExpression || !initialMark || !endMark) {
      showNotification("error", "Please fill all required fields.");
      return;
    }

    const payload = {
      grade: currentGrade,
      startMarks: parseFloat(initialMark),
      endMarks: parseFloat(endMark),
      expression: gradeExpression,
      remarks,
      status: true,
      machineIp: ip || "127.0.0.1",
      createdUserId: 1,
      modifiedUserId: 1,
    };

    try {
      const res = await fetch("http://localhost:8080/api/grade/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification("success", "Grade created successfully.");
        setRefreshTrigger(prev => !prev);

        clearForm();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          showNotification("error", err.message || "Grade creation failed.");
        } catch {
          showNotification("error", text || "Grade creation failed.");
        }
      }
    } catch (error) {
      showNotification("error", "Network error while creating grade.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Employee Evaluation Portal</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Grade Entry Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Grade Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                Grade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="grade"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value)}
              />
                
            </div>

            <div>
              <label htmlFor="gradeExpression" className="block text-sm font-medium text-gray-700 mb-1">
                Grade Expression <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="gradeExpression"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={gradeExpression}
                onChange={(e) => setGradeExpression(e.target.value)}
                placeholder="E.g. Excellent, Very Good"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="initialMark" className="block text-sm font-medium text-gray-700 mb-1">
                Initial Mark <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="initialMark"
                step="0.01"
                min="0"
                max="10"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={initialMark}
                onChange={(e) => setInitialMark(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="endMark" className="block text-sm font-medium text-gray-700 mb-1">
                End Mark <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="endMark"
                step="0.01"
                min="0"
                max="10"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={endMark}
                onChange={(e) => setEndMark(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              id="remarks"
              rows="3"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional remarks"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleAddGrade}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </div>


        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Grade Scale</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expression</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Mark</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Mark</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grades.map((grade) => (
                  <tr key={grade.id} onClick={() => {
                    setSelectedGrade(grade);
                    setUpdatedGrade({
                      grade: grade.grade || '',
                      expression: grade.expression || '',
                      startMarks: grade.startMarks || '',
                      endMarks: grade.endMarks || '',
                      remarks: grade.remarks || ''
                    });
                  }} className="cursor-pointer hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-500">{grade.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{grade.grade}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{grade.expression}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{grade.startMarks?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{grade.endMarks?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{grade.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedGrade && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">

                  <h2 className="text-lg font-semibold mb-4">Update Grade</h2>

                  <p className="text-sm mb-2"><strong>ID:</strong> {selectedGrade.id}</p>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Grade</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={updatedGrade.grade}
                      onChange={(e) => setUpdatedGrade({ ...updatedGrade, grade: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Expression</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={updatedGrade.expression}
                      onChange={(e) => setUpdatedGrade({ ...updatedGrade, expression: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Start Marks</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={updatedGrade.startMarks}
                      onChange={(e) => setUpdatedGrade({ ...updatedGrade, startMarks: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">End Marks</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md"
                      value={updatedGrade.endMarks}
                      onChange={(e) => setUpdatedGrade({ ...updatedGrade, endMarks: parseFloat(e.target.value) })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows="2"
                      value={updatedGrade.remarks}
                      onChange={(e) => setUpdatedGrade({ ...updatedGrade, remarks: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleDeleteGrade}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedGrade(null)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateGrade}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>

        
          
        </div>
      </main>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}