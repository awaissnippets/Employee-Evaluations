import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Notification from "../Components/Notifications"; // Adjust the import path as needed


export default function EvaluationCampaignPage() {

  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [search, setSearch] = useState("");

  const [refreshKey, setRefreshKey] = useState(0); // 🔁 trigger for refetching


  const [notification, setNotification] = useState(null); // { type, message }
// Helper: safely parse yyyy-mm-dd string into Date
const parseDate = (value) => {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day); // JS months are 0-based
};

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };



  const [campaigns, setCampaigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const rowsPerPage = 3;


  useEffect(() => {
    fetch("http://localhost:8080/api/hr/viewAll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => setCampaigns(data))
      .catch(() => showNotification("error", "Failed to load campaigns."));
  }, [refreshKey]);
  const filteredCampaigns = campaigns.filter(campaign => {
    return (
      (employeeName === "" || (campaign.employeeName && campaign.employeeName.toLowerCase().includes(employeeName.toLowerCase()))) &&
      (department === "" || (campaign.department && campaign.department.toLowerCase().includes(department.toLowerCase()))) &&
      (designation === "" || (campaign.designation && campaign.designation.toLowerCase().includes(designation.toLowerCase()))) &&
      (search === "" || (campaign.name && campaign.name.toLowerCase().includes(search.toLowerCase())))
    );
  });

 const paginatedCampaigns = filteredCampaigns.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);


const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / rowsPerPage));


  const [ip, setIp] = useState('');

  useEffect(() => {
    axios.get('https://api.ipify.org?format=json')
      .then((res) => setIp(res.data.ip))
      .catch((err) => console.error(err));
  }, []);


  const [campaignName, setCampaignName] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [description, setDescription] = useState('');

  const [year, setYear] = useState(new Date().getFullYear());
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

const handleAddCampaign = async () => {
  // Required fields
  if (!campaignName || !description || !dateFrom || !dateTo) {
    showNotification("error", "Please fill all fields.");
    return;
  }

  const from = parseDate(dateFrom); // using helper from Correction #1
  const to = parseDate(dateTo);

  if (!from || !to) {
    showNotification("error", "Please pick valid From and To dates.");
    return;
  }

  // ✅ Validation 1: From must belong to selected year
  if (year && from.getFullYear() !== parseInt(year, 10)) {
    showNotification("error", `From Date must be in year ${year}.`);
    return;
  }

  // ✅ Validation 2: To must not be earlier than From
  if (to < from) {
    showNotification("error", "To Date cannot be earlier than From Date.");
    return;
  }

  // ❌ Removed Validation 3 (To year restriction)

  const payload = {
    name: campaignName,
    description,
    startDate: dateFrom,
    endDate: dateTo,
    year: year,
    status: true,
    machineIp: ip,
    modifiedUserId: 2,
    createdUserId: 1,
  };

  try {
    const response = await fetch("http://localhost:8080/api/hr/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      showNotification("success", "Campaign Created.");
      console.log("API response:", data);
      clearForm();
      setRefreshKey((prev) => prev + 1);
    } else {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      showNotification("error", errorData.message || "Something went wrong");
    }
  } catch (err) {
    console.error("API call failed:", err);
    alert("Failed to connect to API.");
  }
};



const clearForm = () => {
  const currentYear = new Date().getFullYear(); // get system year

  setDateFrom("");
  setDateTo("");
  setYear(currentYear);  // reset year to current year
  setEmployeeName("");
  setDepartment("");
  setDesignation("");
  setSearch("");
  setCurrentPage(1);

  showNotification("success", "Form cleared successfully");
};



// Date validation handlers
const handleFromDateChange = (e) => {
  const value = e.target.value;
  const from = parseDate(value);

  if (!year) {
    showNotification("error", "Please select a year first.");
    return;
  }

  // From must match selected year
  if (from.getFullYear() !== parseInt(year, 10)) {
    showNotification("error", `From Date must be in year ${year}.`);
    return;
  }

  setDateFrom(value);

  // Reset To if invalid after changing From
  if (dateTo && parseDate(dateTo) < from) {
    showNotification("error", "To Date cannot be earlier than From Date.");
    setDateTo(""); 
  }
};



const handleToDateChange = (e) => {
  const value = e.target.value;
  const to = parseDate(value);

  if (!dateFrom) {
    showNotification("error", "Please select a From Date first.");
    return;
  }

  // To must not be earlier than From
  if (to < parseDate(dateFrom)) {
    showNotification("error", "To Date cannot be earlier than From Date.");
    return;
  }

  setDateTo(value);
};





  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Evaluation Campaign</h1>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Campaign Form */}

        <form>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Evaluation Campaign</h2>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name:
                </label>
                <input
                  type="text"
                  id="campaignName"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Date From:
                </label>
                <div className="relative">
              <input
  type="date"
  id="dateFrom"
  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
  value={dateFrom}
  onChange={handleFromDateChange}
  min={`${year}-01-01`}
  max={`${year}-12-31`}
/>




                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year:
                </label>
                <div className="relative">
                 <select
  id="year"
  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border appearance-none"
  value={year}
  onChange={(e) => {
    const selectedYear = e.target.value;
    setYear(selectedYear);

    // Update From Date's year only, keep month/day if already picked
    if (dateFrom) {
      const [_, month, day] = dateFrom.split("-");
      setDateFrom(`${selectedYear}-${month}-${day}`);
    }
  }}
>
  {years.map((yearOption) => (
    <option key={yearOption} value={yearOption}>
      {yearOption}
    </option>
  ))}
</select>

                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Date To:
                </label>
                <div className="relative">
               <input
  type="date"
  id="dateTo"
  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
  value={dateTo}
  onChange={handleToDateChange}
  min={dateFrom || undefined}   // must be >= From
/>




                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description:
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-center space-x-4 my-6">
             <button
  type="button"
  onClick={() => setRefreshKey(prev => prev + 1)}   // ✅ triggers reload
  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
>
  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
  </svg>
  Refresh
</button>




              <button
                type="button"
                onClick={handleAddCampaign}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Save
              </button>
            </div>
          </div>
        </form>
        {/* Campaigns Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Evaluation Campaigns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Sr.
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Evaluation Campaign
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Year
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Date From
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Date To
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Description
    </th>
  </tr>
</thead>

<tbody className="bg-white divide-y divide-gray-200">
  {paginatedCampaigns.map((campaign, index) => (
    <tr
      key={campaign.id}
      onClick={() => setSelectedCampaign(campaign)}
      className="cursor-pointer hover:bg-gray-100"
    >
      {/* Sr. No. */}
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {(currentPage - 1) * rowsPerPage + index + 1}
      </td>

      {/* Campaign Name */}
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {campaign.name}
      </td>

      {/* ✅ Year column now aligned */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {campaign.year || "N/A"}
      </td>

      {/* Dates */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {campaign.startDate || "N/A"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {campaign.endDate || "N/A"}
      </td>

      {/* Description */}
      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]">
        {campaign.description || "—"}
      </td>
    </tr>
  ))}
</tbody>


            </table>

            {/* Pagination */}
            <div className="flex justify-center m-4 space-x-2">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="px-4 py-1">{`Page ${currentPage} of ${totalPages}`}</span>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

            {/* Modal */}
            {selectedCampaign && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">Edit Campaign</h2>

                  <div className="space-y-2">
                    {/* Read-only Fields */}
                    <p><strong>ID:</strong> {selectedCampaign.id}</p>
                    <p><strong>Machine IP:</strong> {selectedCampaign.machineIp || "N/A"}</p>
                    <p><strong>Created Date:</strong> {selectedCampaign.createdDate}</p>
                    <p><strong>Modified Date:</strong> {selectedCampaign.modifiedDate}</p>

                    {/* Editable Fields */}
                    <div>
                      <label className="block text-sm font-medium">Name</label>
                      <input
                        type="text"
                        defaultValue={selectedCampaign.name}
                        id="update-name"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Description</label>
                      <input
                        type="text"
                        defaultValue={selectedCampaign.description || ""}
                        id="update-description"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
<div>
  <label className="block text-sm font-medium">Year</label>
  <input
    type="number"
    defaultValue={selectedCampaign.year || year}
    id="update-year"
    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
  />
</div>

                    <div>
                      <label className="block text-sm font-medium">Start Date</label>
                      <input
                        type="date"
                        defaultValue={selectedCampaign.startDate}
                        id="update-startDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">End Date</label>
                      <input
                        type="date"
                        defaultValue={selectedCampaign.endDate}
                        id="update-endDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>

                    {/* Status is editable */}
                    <div>
                      <label className="block text-sm font-medium">Status</label>
                      <select
                        defaultValue={selectedCampaign.status === true ? "true" : "false"}
                        id="update-status"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Close
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={async () => {
                        const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedCampaign.name}"?`);
                        if (!confirmDelete) return;

                        const res = await fetch("http://localhost:8080/api/hr/delete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name: selectedCampaign.name }),
                        });

                        if (res.ok) {
                          showNotification("success", "Campaign deleted.");

                          setSelectedCampaign(null);
                          setRefreshKey(prev => prev + 1);
                        } else {
                          const err = await res.text();

                          showNotification("error", err || "Delete failed.");
                        }
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Delete
                    </button>
                    {/* update button */}
                    <button
                      onClick={async () => {
                        const name = document.getElementById("update-name").value || selectedCampaign.name;
                        const description = document.getElementById("update-description").value || selectedCampaign.description;
                        const startDate = document.getElementById("update-startDate").value || selectedCampaign.startDate;
                        const endDate = document.getElementById("update-endDate").value || selectedCampaign.endDate;
                        const status = document.getElementById("update-status").value === "true";
 const year = document.getElementById("update-year").value || selectedCampaign.year; 
                       const updateBody = {
  id: selectedCampaign.id,
  name,
  description,
  date: new Date().toISOString().split('T')[0],
  startDate,
  endDate,
  year: year,
  status,
  machineIp: selectedCampaign.machineIp || "192.168.1.10",
  modifiedUserId: 2,
};

console.log(updateBody);

                        const res = await fetch("http://localhost:8080/api/hr/update", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(updateBody),
                        });

                        if (res.ok) {
                          showNotification("success", "Campaign updated successfully!");

                          setSelectedCampaign(null); // Close modal
                          setRefreshKey(prev => prev + 1); // Refresh campaign list
                        } else {
                          const err = await res.text();
                          showNotification("error", err || "Update failed.");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action buttons */}

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