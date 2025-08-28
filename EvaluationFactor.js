import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
  CheckCircle,
  BarChart3,
  Info,
} from "lucide-react";
import Notification from "../Components/Notifications";

/**
 * EvaluationFactor screen
 * Matches TypeScript functionality in plain React JS.
 * Features
 * 1. Three factor types, Qualitative, Quantitative, Recommended
 * 2. Two employee groups, Officer, Staff
 * 3. Dynamic form fields based on type
 * 4. Create, Read, Update, Delete with fetch
 * 5. Pagination, search, simple filter, optimistic UI
 * 6. Edit modal with validation
 */

export default function EvaluationFactor() {
  // list and table state
  const [factors, setFactors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // search and filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  // create form state
  const [newFactor, setNewFactor] = useState("");
  const [description, setDescription] = useState("");
  const [evaluationFor, setEvaluationFor] = useState("Officer"); // Officer or Staff
  const [factorType, setFactorType] = useState("Qualitative"); // Qualitative, Quantitative, Recommended
  const [marksLevel, setMarksLevel] = useState(""); // Qualitative only
  const [totalMarks, setTotalMarks] = useState(""); // Quantitative only
  const [passingMarks, setPassingMarks] = useState(""); // Quantitative only

  // edit modal state
  const [selectedFactor, setSelectedFactor] = useState(null);
  const [editType, setEditType] = useState("Qualitative");
  const [editGroup, setEditGroup] = useState("Officer");
  const [editName, setEditName] = useState("");
  const [editMarksLevel, setEditMarksLevel] = useState("");
  const [editTotalMarks, setEditTotalMarks] = useState("");
  const [editPassingMarks, setEditPassingMarks] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // notifications
  const [notification, setNotification] = useState(null);
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // fetch list once
  useEffect(() => {
    let cancel = false;
    fetch("http://localhost:8080/api/factors/view")
      .then((res) => res.json())
      .then((data) => {
        if (cancel) return;
        // normalize optional fields to match both flows
        const normalized = Array.isArray(data)
          ? data.map((f) => ({
              id: f.id ?? Date.now() + Math.random(),
              factorType: f.factorType ?? "Qualitative",
              evaluationGroup: normalizeGroup(f.evaluationGroup),
              name: f.name ?? f.factorName ?? "",
              marksLevel: f.marksLevel ?? "",
              totalMarks: f.totalMarks ?? "",
              passingMarks: f.passingMarks ?? "",
              description: f.description ?? "",
              status: f.status ?? true,
              machineIp: f.machineIp ?? "",
              modifiedUserId: f.modifiedUserId ?? null,
            }))
          : [];
        setFactors(normalized);
      })
      .catch(() =>
        showNotification("error", "Network error, or server is down")
      );
    return () => {
      cancel = true;
    };
  }, []);

  // helper to normalize group coming from backend
  function normalizeGroup(g) {
    if (!g) return "Officer";
    const v = String(g).toLowerCase();
    if (v === "officer") return "Officer";
    if (v === "staff") return "Staff";
    return "Officer";
  }

  // filtered list for table
  const filtered = useMemo(() => {
  const s = search.trim().toLowerCase();
  return factors
    .filter((f) => (typeFilter ? f.factorType === typeFilter : true))
    .filter((f) => {
      if (!groupFilter) return true;
      if (groupFilter === "All") {
        return f.evaluationGroup === "Officer" || f.evaluationGroup === "Staff";
      }
      return f.evaluationGroup === groupFilter;
    })
    .filter((f) =>
      s
        ? f.name.toLowerCase().includes(s) ||
          f.description.toLowerCase().includes(s)
        : true
    );
}, [factors, search, typeFilter, groupFilter]);


  // pagination window
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage]);

  // prepare edit modal when selectedFactor changes
  useEffect(() => {
    if (!selectedFactor) return;
    setEditType(selectedFactor.factorType || "Qualitative");
    setEditGroup(selectedFactor.evaluationGroup || "Officer");
    setEditName(selectedFactor.name || "");
    setEditDescription(selectedFactor.description || "");
    setEditMarksLevel(selectedFactor.marksLevel || "");
    setEditTotalMarks(selectedFactor.totalMarks || "");
    setEditPassingMarks(selectedFactor.passingMarks || "");
  }, [selectedFactor]);

  // submit create
  async function handleCreate(e) {
    e.preventDefault();

    // base validation
    if (!newFactor.trim()) {
      showNotification("error, Factor Name is required");
      return;
    }
    if (!description.trim()) {
      showNotification("error, Description is required");
      return;
    }
    if (!evaluationFor) {
      showNotification("error, Employee Group is required");
      return;
    }
    if (!factorType) {
      showNotification("error, Factor Type is required");
      return;
    }

    // type specific validation
    if (factorType === "Qualitative") {
      if (!String(marksLevel).trim()) {
        showNotification("error, Marks Level is required for Qualitative");
        return;
      }
    }
    if (factorType === "Quantitative") {
      if (!String(totalMarks).trim() || !String(passingMarks).trim()) {
        showNotification(
          "error, Total Marks and Passing Marks are required for Quantitative"
        );
        return;
      }
    }

    // dynamic payload
    const payload = {
      factorType,
      evaluationGroup: evaluationFor,
      name: newFactor.trim(),
      description: description.trim(),
      ...(factorType === "Qualitative"
        ? { marksLevel: String(marksLevel).trim() }
        : {}),
      ...(factorType === "Quantitative"
        ? {
            totalMarks: String(totalMarks).trim(),
            passingMarks: String(passingMarks).trim(),
          }
        : {}),
    };

    // optimistic add
    const tempId = Date.now();
    setFactors((prev) => [...prev, { ...payload, id: tempId }]);

    try {
      const res = await fetch("http://localhost:8080/api/factors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification("success, Factor created successfully");
        // refetch or adjust the temp item, for now we keep the optimistic item
      } else {
        // rollback optimistic add
        setFactors((prev) => prev.filter((f) => f.id !== tempId));
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          showNotification("error, " + (json.message || "Create failed"));
        } catch {
          showNotification("error, " + (text || "Create failed"));
        }
      }
    } catch (err) {
      // rollback optimistic add
      setFactors((prev) => prev.filter((f) => f.id !== tempId));
      console.error(err);
      showNotification("error, Network error during create");
    }

    // reset form
    setFactorType("Qualitative");
    setEvaluationFor("Officer");
    setNewFactor("");
    setMarksLevel("");
    setTotalMarks("");
    setPassingMarks("");
    setDescription("");
  }

  // submit update
  async function handleUpdate() {
    if (!selectedFactor) return;

    if (!editName.trim()) {
      showNotification("error, Factor Name is required");
      return;
    }
    if (!editDescription.trim()) {
      showNotification("error, Description is required");
      return;
    }
    if (!editGroup) {
      showNotification("error, Employee Group is required");
      return;
    }
    if (!editType) {
      showNotification("error, Factor Type is required");
      return;
    }

    if (editType === "Qualitative") {
      if (!String(editMarksLevel).trim()) {
        showNotification("error, Marks Level is required for Qualitative");
        return;
      }
    }
    if (editType === "Quantitative") {
      if (
        !String(editTotalMarks).trim() ||
        !String(editPassingMarks).trim()
      ) {
        showNotification(
          "error, Total Marks and Passing Marks are required for Quantitative"
        );
        return;
      }
    }

    const payload = {
      id: selectedFactor.id,
      factorType: editType,
      evaluationGroup: editGroup,
      name: editName.trim(),
      description: editDescription.trim(),
      status: selectedFactor.status ?? true,
      machineIp: selectedFactor.machineIp || "192.168.0.10",
      modifiedUserId: 1,
      ...(editType === "Qualitative"
        ? { marksLevel: String(editMarksLevel).trim(), totalMarks: "", passingMarks: "" }
        : {}),
      ...(editType === "Quantitative"
        ? {
            totalMarks: String(editTotalMarks).trim(),
            passingMarks: String(editPassingMarks).trim(),
            marksLevel: "",
          }
        : {}),
      ...(editType === "Recommended"
        ? { marksLevel: "", totalMarks: "", passingMarks: "" }
        : {}),
    };

    // optimistic update
    setFactors((prev) =>
      prev.map((f) => (f.id === payload.id ? { ...f, ...payload } : f))
    );

    try {
      const res = await fetch("http://localhost:8080/api/factors/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification("success, Factor updated successfully");
        setSelectedFactor(null);
      } else {
        // on failure, we could refetch, for now notify and leave optimistic change
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          showNotification("error, " + (json.message || "Update failed"));
        } catch {
          showNotification("error, " + (text || "Update failed"));
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("error, Network error during update");
    }
  }

  // delete
  async function handleDelete(factor) {
    const ok = window.confirm("Are you sure you want to delete this factor");
    if (!ok) return;

    const id = factor.id;
    const snapshot = factors;
    // optimistic remove
    setFactors((prev) => prev.filter((f) => f.id !== id));

    try {
      const res = await fetch(
        `http://localhost:8080/api/factors/delete/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        showNotification("success, Factor deleted successfully");
      } else {
        // rollback
        setFactors(snapshot);
        const text = await res.text();
        try {
          const json = JSON.parse(text);
          showNotification("error, " + (json.message || "Delete failed"));
        } catch {
          showNotification("error, " + (text || "Delete failed"));
        }
      }
    } catch (err) {
      // rollback
      setFactors(snapshot);
      console.error(err);
      showNotification("error, Network error during deletion");
    }
  }

  function factorTypeBadge(type) {
    if (type === "Qualitative") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
          <BarChart3 className="w-3 h-3" />
          Qualitative
        </span>
      );
    }
    if (type === "Quantitative") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
          <FileText className="w-3 h-3" />
          Quantitative
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
        <CheckCircle className="w-3 h-3" />
        Recommended
      </span>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Employee Evaluation Portal
        </h1>
        <p className="text-gray-600 mt-2">
          Manage evaluation factors and criteria
        </p>
      </div>

      {/* Create Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Employee Factor Configuration
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="w-4 h-4" />
            <span>
              Select factor type, the form will adjust the fields automatically
            </span>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Factor Type + Employee Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factor Type <span className="text-red-500">*</span>
              </label>
              <select
                value={factorType}
                onChange={(e) => setFactorType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Qualitative">Qualitative</option>
                <option value="Quantitative">Quantitative</option>
                <option value="Recommended">Recommended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Group <span className="text-red-500">*</span>
              </label>
              <select
  value={evaluationFor}
  onChange={(e) => setEvaluationFor(e.target.value)}
  className="px-3 py-2 border rounded-lg"
>
  <option value="Officer">Officer</option>
  <option value="Staff">Staff</option>
  <option value="All">All</option> {/* New valid group */}
</select>


            </div>
          </div>

          {/* Factor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newFactor}
              onChange={(e) => setNewFactor(e.target.value)}
              placeholder="Enter evaluation factor name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Conditional Marks Fields */}
          {factorType === "Qualitative" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={marksLevel}
                onChange={(e) => setMarksLevel(e.target.value)}
                placeholder="Enter marks level, for example 5"
                min="1"
                max="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {factorType === "Quantitative" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  placeholder="Enter total marks"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  placeholder="Enter passing marks"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter factor description"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
              Add Factor
            </button>
          </div>
        </form>
      </div>

      {/* Toolbar for search and filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or description"
              className="pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="Qualitative">Qualitative</option>
            <option value="Quantitative">Quantitative</option>
            <option value="Recommended">Recommended</option>
          </select>

      <select
  value={groupFilter}
  onChange={(e) => setGroupFilter(e.target.value)}
  className="px-3 py-2 border rounded-lg"
>
  <option value="All">All</option>
  <option value="Officer">Officer</option>
  <option value="Staff">Staff</option>
   {/* Real group */}
</select>




          {(typeFilter || groupFilter) && (
            <button
              onClick={() => {
                setTypeFilter("");
                setGroupFilter("");
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 border rounded-lg hover:bg-gray-50"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Evaluation Factors
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and review configured evaluation factors
          </p>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sr. No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factor Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Group
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Factor Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks or Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {pageSlice.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium">
                          No evaluation factors found
                        </p>
                        <p className="text-sm">
                          Add your first evaluation factor to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageSlice.map((factor, index) => (
                    <tr
                      key={factor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {factorTypeBadge(factor.factorType)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            factor.evaluationGroup === "Officer"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {factor.evaluationGroup}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {factor.name}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {factor.factorType === "Qualitative" &&
                          (factor.marksLevel
                            ? `Level, ${factor.marksLevel}`
                            : "Level, N A")}
                        {factor.factorType === "Quantitative" &&
                          `${
                            factor.passingMarks ? factor.passingMarks : "N A"
                          } / ${factor.totalMarks ? factor.totalMarks : "N A"}`}
                        {factor.factorType === "Recommended" && "N A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                        <span className="block truncate" title={factor.description}>
                          {factor.description}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          className="inline-flex items-center px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          onClick={() => setSelectedFactor(factor)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </button>

                        <button
                          className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => handleDelete(factor)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center m-4 space-x-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedFactor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Edit Evaluation Factor</h2>
              <button
                onClick={() => setSelectedFactor(null)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factor Type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Qualitative">Qualitative</option>
                  <option value="Quantitative">Quantitative</option>
                  <option value="Recommended">Recommended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Group
                </label>
               <select
  value={editGroup}
  onChange={(e) => setEditGroup(e.target.value)}
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="Officer">Officer</option>
  <option value="Staff">Staff</option>
  <option value="All">All</option>
</select>

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factor Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Conditional edit fields */}
              {editType === "Qualitative" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks Level
                  </label>
                  <input
                    type="number"
                    value={editMarksLevel}
                    onChange={(e) => setEditMarksLevel(e.target.value)}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {editType === "Quantitative" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      value={editTotalMarks}
                      onChange={(e) => setEditTotalMarks(e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      value={editPassingMarks}
                      onChange={(e) => setEditPassingMarks(e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setSelectedFactor(null)}
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
