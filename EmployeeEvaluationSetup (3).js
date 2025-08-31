import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Target, UserCheck, Plus, Info, Trash2, X, CheckCircle, Search, UserPlus } from 'lucide-react';

// ===========================
// API Service Functions
// ===========================
async function fetchCampaigns() {
  try {
    const response = await fetch('/api/campaigns');
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return await response.json();
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

async function fetchCampaignById(id) {
  try {
    const response = await fetch(`/api/campaigns/${id}`);
    if (!response.ok) throw new Error('Failed to fetch campaign');
    return await response.json();
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

async function fetchEmployees(group) {
  try {
    const response = await fetch(`/api/employees?group=${group}`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return await response.json();
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

async function fetchEvaluators() {
  try {
    const response = await fetch('/api/evaluators');
    if (!response.ok) throw new Error('Failed to fetch evaluators');
    return await response.json();
  } catch (error) {
    console.error('Error fetching evaluators:', error);
    return [];
  }
}

async function fetchFactors(type) {
  try {
    const response = await fetch(`/api/factors?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch factors');
    return await response.json();
  } catch (error) {
    console.error('Error fetching factors:', error);
    return [];
  }
}

async function saveCampaign(campaignData) {
  try {
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    });
    if (!response.ok) throw new Error('Failed to save campaign');
    return await response.json();
  } catch (error) {
    console.error('Error saving campaign:', error);
    throw error;
  }
}

async function updateCampaign(campaignId, campaignData) {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    });
    if (!response.ok) throw new Error('Failed to update campaign');
    return await response.json();
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
}

// Simple Table Component
const Table = ({ 
  columns = [], 
  data = [], 
  onRemove = null,
  emptyMessage = "No data available",
  className = ""
}) => {
  if (data.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  {column.label}
                </th>
              ))}
              {onRemove && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td
                    key={column.key || colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(item[column.key], item, index)
                      : item[column.key] || '-'}
                  </td>
                ))}
                {onRemove && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => onRemove(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// removed hardcoded demo data in favor of stubbed API

// Stepper component for navigation
const Stepper = ({ steps, activeStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          <button
            onClick={() => onStepClick(index)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              index <= activeStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
            disabled={index > activeStep}
          >
            {index + 1}
          </button>
          <span className="text-xs mt-2 text-gray-600">{step}</span>
        </div>
      ))}
    </div>
  );
};

export default function EmployeeEvaluationSetup() {
  // Core state management
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('staff');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [factorSelections, setFactorSelections] = useState({}); // key: type -> array of factors
  const [selectedEvaluators, setSelectedEvaluators] = useState([]);
  
  // Campaign management state
  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  
  // Master lists from backend (stubbed)
  const [employees, setEmployees] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [factors, setFactors] = useState([]);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [showManualEvaluatorModal, setShowManualEvaluatorModal] = useState(false);
  
  // Loading & error states
  const [loading, setLoading] = useState({ 
    campaigns: false, 
    employees: false, 
    evaluators: false, 
    factors: false 
  });
  const [loadError, setLoadError] = useState(null);
  
  // Load campaigns on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      const data = await fetchCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    };
    loadCampaigns();
  }, []);
  
  // Load campaign data when selected
  const handleCampaignSelect = async (campaignId) => {
    const campaign = await fetchCampaignById(campaignId);
    if (campaign) {
      setCurrentCampaign(campaign);
      setCampaignName(campaign.name);
      setSelectedEmployees(Array.isArray(campaign.employees) ? campaign.employees : []);
      setSelectedEvaluators(Array.isArray(campaign.evaluators) ? campaign.evaluators : []);
      setSelectedFactors(Array.isArray(campaign.factors) ? campaign.factors : []);
      setIsEditing(true);
      setActiveStep(0);
    }
  };
  
  // Handle save/update campaign
  const handleSaveCampaign = async () => {
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    
    const campaignData = {
      name: campaignName,
      employees: selectedEmployees,
      evaluators: selectedEvaluators,
      factors: selectedFactors,
      group: selectedGroup,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      setIsSaving(true);
      
      if (isEditing && currentCampaign) {
        await updateCampaign(currentCampaign.id, campaignData);
        setSaveMessage('Campaign updated successfully!');
      } else {
        await saveCampaign(campaignData);
        setSaveMessage('Campaign created successfully!');
      }
      
      // Refresh campaigns list
      const updatedCampaigns = await fetchCampaigns();
      setCampaigns(updatedCampaigns);
      
      // Reset form if it was a new campaign
      if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      setSaveError(`Failed to save campaign: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setCampaignName('');
    setSelectedEmployees([]);
    setSelectedEvaluators([]);
    setSelectedFactors([]);
    setFactorSelections({});
    setCurrentCampaign(null);
    setIsEditing(false);
    setActiveStep(0);
    setSaveMessage(null);
    setSaveError(null);
  };
  // Load all necessary data
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoadError(null);
        setLoading({ campaigns: true, employees: true, evaluators: true, factors: true });

        const [c, v] = await Promise.all([
          fetchCampaigns(),
          fetchEvaluators(),
        ]);
        const e = await fetchEmployees(selectedGroup);
        const f = await fetchFactors();
        setCampaigns(Array.isArray(c) ? c : []);
        setEmployees(Array.isArray(e) ? e : []);
        setEvaluators(Array.isArray(v) ? v : []);
        setFactors(Array.isArray(f) ? f : []);
      } catch (err) {
        console.error(err);
        setLoadError(err.message);
      } finally {
        setLoading({ campaigns: false, employees: false, evaluators: false, factors: false });
      }
    };

    loadAll();
  }, [selectedGroup]);

  const handleSaveAll = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(null);

      const employeesPayload = selectedEmployees.map((e) => ({ id: e.id }));
      const evaluatorsPayload = selectedEvaluators.map((e) => ({ id: e.id, level: Number(e.level || 0) }));
      const factorsPayload = Object.values(factorSelections)
        .flat()
        .map((f) => ({ id: f.id }));

      const payload = {
        id: selectedCampaign || undefined,
        employees: employeesPayload,
        evaluators: evaluatorsPayload,
        factors: factorsPayload,
      };

  if (selectedCampaign) await updateCampaign(payload);
  else await saveCampaign(payload);
      setSaveMessage('All changes saved successfully.');
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedCampaign, selectedEmployees, selectedEvaluators, factorSelections]);


  // Filter employees by selected employeeCategory across UI
  // TODO: If the actual backend field is not `employee.category`, adjust normalization here
  const filteredEmployeesMaster = employees;
  const filteredSelectedEmployees = selectedEmployees;

  // Get current factors based on selected type
  const getFactorsByType = useCallback((type) => {
    return factors.filter((f) => f.type === type);
  }, [factors]);

  // Get total selected factors across all types
  const getTotalSelectedFactors = useCallback(() => {
    return Object.values(factorSelections).reduce((total, factors) => total + factors.length, 0);
  }, [factorSelections]);

  // Handle factor selection - Fixed to persist across type changes
  const handleFactorToggle = useCallback((type, factor) => {
    setFactorSelections(prev => {
      const currentSelections = prev[type] || [];
      const isSelected = currentSelections.some(selected => selected.id === factor.id);
      if (isSelected) {
        return { ...prev, [type]: currentSelections.filter(selected => selected.id !== factor.id) };
      }
      return { ...prev, [type]: [...currentSelections, factor] };
    });
  }, []);

  // Check if factor is selected - Fixed to work with persistent selections
  const isFactorSelected = useCallback((type, factor) => {
    const currentSelections = factorSelections[type] || [];
    return currentSelections.some(selected => selected.id === factor.id);
  }, [factorSelections]);

  // Handle employee confirmation from modal
// Add employees to campaign
const handleEmployeeConfirm = useCallback(async (pickedEmployees) => {
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  const ids = pickedEmployees.map((e) => e.id);

  try {
    // stub: just merge into local state
    // Merge & de-dup local state
    setSelectedEmployees((prev) => {
      const map = new Map(prev.map((e) => [e.id, e]));
      pickedEmployees.forEach((e) => map.set(e.id, e));
      return Array.from(map.values());
    });
  } catch (err) {
    console.error(err);
    alert(`Failed to add employees: ${err.message}`);
  }
}, [selectedCampaign]);

// Add evaluators to campaign
// Replace existing handleEvaluatorConfirm with this
const handleEvaluatorConfirm = useCallback(async (pickedEvaluators) => {
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  const ids = pickedEvaluators.map((e) => e.id);

  try {
    // stub: just merge into local state
    setSelectedEvaluators((prev) => {
      // keep existing evaluator.level if present, otherwise default to empty string
      const map = new Map(prev.map((e) => [e.id, e]));
      pickedEvaluators.forEach((e) => {
        const existing = map.get(e.id);
        if (existing) {
          // preserve existing.level
          map.set(e.id, { ...existing, ...e, level: existing.level ?? '' });
        } else {
          // new pick, set runtime level default
          map.set(e.id, { ...e, level: '' });
        }
      });
      return Array.from(map.values());
    });
  } catch (err) {
    console.error(err);
    alert(`Failed to add evaluators: ${err.message}`);
  }
}, [selectedCampaign]);


// Remove single employee row (trash icon)
const handleRemoveEmployee = useCallback(async (index) => {
  const emp = (prev => prev[index])(selectedEmployees);
  if (!emp) return;
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  try {
    // stub: just remove from local state
    setSelectedEmployees((prev) => prev.filter((_, i) => i !== index));
  } catch (err) {
    console.error(err);
    alert(`Failed to remove employee: ${err.message}`);
  }
}, [selectedEmployees, selectedCampaign]);

// Remove by employee id (used when rendering filtered views)
const handleRemoveEmployeeById = useCallback(async (employeeId) => {
  if (!employeeId) return;
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  try {
    // stub: just remove from local state
    setSelectedEmployees((prev) => prev.filter((e) => e.id !== employeeId));
  } catch (err) {
    console.error(err);
    alert(`Failed to remove employee: ${err.message}`);
  }
}, [selectedCampaign]);

// Evaluator Modal Component
const EvaluatorModal = ({ 
  isOpen, 
  onClose, 
  data: evaluators = [], 
  selectedItems: selectedEvaluators = [], 
  onConfirm 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(new Map());
  const [levels, setLevels] = useState(new Map());

  // Initialize selected and levels when modal opens
  useEffect(() => {
    if (isOpen) {
      const selectedMap = new Map();
      const levelsMap = new Map();
      
      selectedEvaluators.forEach(evaluator => {
        selectedMap.set(evaluator.id, true);
        if (evaluator.level !== undefined) {
          levelsMap.set(evaluator.id, evaluator.level);
        }
      });
      
      setSelected(selectedMap);
      setLevels(levelsMap);
      setSearchTerm('');
    }
  }, [isOpen, selectedEvaluators]);

  const filteredEvaluators = useMemo(() => {
    if (!searchTerm.trim()) return evaluators;
    const term = searchTerm.toLowerCase();
    return evaluators.filter(evaluator => 
      evaluator.name.toLowerCase().includes(term) ||
      evaluator.email?.toLowerCase().includes(term) ||
      evaluator.department?.toLowerCase().includes(term)
    );
  }, [evaluators, searchTerm]);

  const handleToggle = (evaluator) => {
    const newSelected = new Map(selected);
    if (selected.get(evaluator.id)) {
      newSelected.delete(evaluator.id);
    } else {
      newSelected.set(evaluator.id, true);
    }
    setSelected(newSelected);
  };

  const handleLevelChange = (evaluatorId, level) => {
    const newLevels = new Map(levels);
    newLevels.set(evaluatorId, parseInt(level, 10) || 1);
    setLevels(newLevels);
  };

  const handleSubmit = () => {
    const selectedEvaluators = evaluators
      .filter(evaluator => selected.get(evaluator.id))
      .map(evaluator => ({
        ...evaluator,
        level: levels.get(evaluator.id) || 1
      }));
    
    onConfirm(selectedEvaluators);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Select Evaluators</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search evaluators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={filteredEvaluators.length > 0 && filteredEvaluators.every(e => selected.get(e.id))}
                    onChange={() => {
                      const allSelected = filteredEvaluators.every(e => selected.get(e.id));
                      const newSelected = new Map(selected);
                      
                      filteredEvaluators.forEach(evaluator => {
                        if (allSelected) {
                          newSelected.delete(evaluator.id);
                        } else {
                          newSelected.set(evaluator.id, true);
                        }
                      });
                      
                      setSelected(newSelected);
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluators.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No evaluators found
                  </td>
                </tr>
              ) : (
                filteredEvaluators.map((evaluator) => (
                  <tr key={evaluator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={!!selected.get(evaluator.id)}
                        onChange={() => handleToggle(evaluator)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {evaluator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluator.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluator.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={levels.get(evaluator.id) || 1}
                        onChange={(e) => handleLevelChange(evaluator.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[1, 2, 3, 4, 5].map(level => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Selected ({Array.from(selected).filter(([_, isSelected]) => isSelected).length})
          </button>
        </div>
      </div>
    </div>
  );
};

const handleEvaluatorConfirm = useCallback((selected) => {
  setSelectedEvaluators(selected);
  setShowEvaluatorModal(false);
}, []);

// Remove single evaluator row (trash icon)
const handleRemoveEvaluator = useCallback(async (index) => {
  const ev = selectedEvaluators[index];
  if (!ev) return;
  if (!selectedCampaign) {
    alert("Please select a campaign first.");
    return;
  }
  try {
    // stub: just remove from local state
    setSelectedEvaluators((prev) => prev.filter((_, i) => i !== index));
  } catch (err) {
    console.error(err);
    alert(`Failed to remove evaluator: ${err.message}`);
  }
}, [selectedEvaluators, selectedCampaign]);



  // Table columns
  const employeeColumns = [
    {
      key: 'srNo',
      label: 'Sr. No',
      render: (value, item, index) => index + 1
    },
    { key: 'id', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' }
  ];

  const factorColumns = [
  {
    key: 'srNo',
    label: 'Sr. No',
    render: (value, item, index) => index + 1
  },
  { key: 'name', label: 'Factor Name' },
  { key: 'description', label: 'Description' },
  {
    key: 'selected',
    label: 'Selected',
    render: (_unused, item) => (
      <input
        type="checkbox"
        checked={isFactorSelected(item)}
        onChange={() => handleFactorToggle(item)}
        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
    )
  }
];
  const evaluatorColumns = [
    {
      key: 'srNo',
      label: 'Sr. No',
      render: (value, item, index) => index + 1
    },
    { key: 'username', label: 'Username' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    {
      key: 'level',
      label: 'Level',
      render: (_value, item) => (
        <input
          type="number"
          min="1"
          placeholder="Level"
          value={item.level ?? ''}
          onChange={(e) => {
            const newLevel = e.target.value;
            setSelectedEvaluators((prev) =>
              prev.map((ev) =>
                ev.id === item.id ? { ...ev, level: newLevel } : ev
              )
            );
          }}
          className="w-24 px-2 py-1 border rounded-md text-sm"
        />
      )
    }

const steps = ['Campaign', 'Employees', 'Evaluators', 'Factors', 'Review'];

// Handle step navigation
const handleStepClick = (stepIndex) => {
  if (stepIndex <= activeStep) {
    setActiveStep(stepIndex);
  }
};
          <div className={`${saveError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'} rounded-lg p-3`}>
            {saveError || saveMessage}
          </div>
        )}
        {/* Campaign Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            Campaign Selection
          </h2>
          <div className="max-w-md space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a campaign...</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} {campaign.status ? `(${campaign.status})` : ""}
                </option>
              ))}
            </select>
            <div className="flex gap-4 items-center mt-4">
              <label className="text-sm font-medium text-gray-700">Employee Group:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGroup('staff')}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${selectedGroup === 'staff' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGroup('officer')}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${selectedGroup === 'officer' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  Officer
                </button>
              </div>
            </div>
            {selectedCampaign && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.description || " "}
                </p>
              </div>
            )}
            {/* Global Employee Group selector above */}
          </div>
        </div>



        {/* Employees Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {filteredSelectedEmployees.length} selected
              </span>
            </div>
            <button
  onClick={() => setShowEmployeeModal(true)}
  className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 transition-colors"
>
  <Plus className="w-4 h-4" />
  Add Employees
</button>

          </div>
          
          <Table
            columns={employeeColumns}
            data={filteredSelectedEmployees}
            onRemove={(idx) => {
              const row = filteredSelectedEmployees[idx];
              if (row) {
                // Remove by id to avoid index mismatch due to filtering
                handleRemoveEmployeeById(row.id);
              }
            }}
            emptyMessage="No employees selected. Click 'Add Employees' to get started."
          />
        </div>

        {/* Factors Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Evaluation Factors</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {getTotalSelectedFactors()} total selected
            </span>
          </div>
          {/* First-time selection UI with type dropdown and table */}
          <div className="mb-6">
            <div className="max-w-sm mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Factor Type</label>
              <select
                value={factorSelections.__currentType || 'qualitative'}
                onChange={async (e) => {
                  const t = e.target.value;
                  // store ephemeral current type to control dropdown
                  setFactorSelections(prev => ({ ...prev, __currentType: t }));
                  await fetchFactors(t);
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="qualitative">Qualitative</option>
                <option value="quantitative">Quantitative</option>
                <option value="recommended">Recommended</option>
              </select>
            </div>
            {(() => {
              const t = factorSelections.__currentType || 'qualitative';
              const rows = getFactorsByType(t);
              const isSel = (item) => (factorSelections[t] || []).some(x => x.id === item.id);
              const toggle = (item) => handleFactorToggle(t, item);
              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SR</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Factor Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        {t === 'qualitative' && (
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks Level</th>
                        )}
                        {t === 'quantitative' && (
                          <>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Passing Marks</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rows.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <input
                              type="checkbox"
                              checked={isSel(item)}
                              onChange={() => toggle(item)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                          {t === 'qualitative' && (
                            <td className="px-4 py-2 text-sm text-gray-900">{item.marksLevel ?? '-'}</td>
                          )}
                          {t === 'quantitative' && (
                            <>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.totalMarks ?? '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.passingMarks ?? '-'}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Factor Type Summary */}
          {Object.keys(factorSelections).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Factors Summary:</h4>
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2">
                  {['qualitative','quantitative','recommended'].map(type => {
                    const selectedCount = (factorSelections[type] || []).length;
                    if (selectedCount === 0) return null;
                    return (
                      <div key={type.id} className="flex-shrink-0 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-green-800">{type}</span>
                          <span className="text-sm text-green-600 bg-green-200 px-2 py-1 rounded-full">
                            {selectedCount}
                          </span>
                        </div>
                        <div className="text-xs text-green-600">
                          {factorSelections[type]?.map(f => f.name).join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* Selection happens via Stepper Factor modal only */}
        </div>

        {/* Evaluators Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Evaluators</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {selectedEvaluators.length} selected
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowManualEvaluatorModal(true)}
                className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Add Manually
              </button>
              <button
                onClick={() => setShowEvaluatorModal(true)}
                className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                <Users className="w-4 h-4" />
                Select Evaluators
              </button>
            </div>
          </div>
          
          <Table
            columns={[
              {
                key: 'srNo',
                label: 'SR',
                render: (_, __, index) => index + 1
              },
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'department', label: 'Department' },
              {
                key: 'level',
                label: 'Level',
                render: (level, evaluator) => (
                  <select
                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={level || 1}
                    onChange={(e) => {
                      const newLevel = parseInt(e.target.value, 10);
                      setSelectedEvaluators(prev =>
                        prev.map(ev =>
                          ev.id === evaluator.id ? { ...ev, level: newLevel } : ev
                        )
                      );
                    }}
                  >
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (_, evaluator) => (
                  <button
                    onClick={() => {
                      setSelectedEvaluators(prev => 
                        prev.filter(ev => ev.id !== evaluator.id)
                      );
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )
              }
            ]}
            data={selectedEvaluators}
            emptyMessage="No evaluators selected. Click 'Select Evaluators' to add evaluators."
          />
          
          {/* Evaluator Selection Modal */}
          <EvaluatorModal
            isOpen={showEvaluatorModal}
            onClose={() => setShowEvaluatorModal(false)}
            evaluators={evaluators}
            selectedEvaluators={selectedEvaluators}
            onConfirm={(newEvaluators) => {
              // Merge with existing, preserving levels of existing evaluators
              const existingMap = new Map(selectedEvaluators.map(ev => [ev.id, ev]));
              
              newEvaluators.forEach(ev => {
                existingMap.set(ev.id, {
                  ...ev,
                  level: existingMap.has(ev.id) ? existingMap.get(ev.id).level : ev.level
                });
              });
              
              setSelectedEvaluators(Array.from(existingMap.values()));
            }}
          />
          
          {/* Manual Evaluator Modal (simplified version) */}
          {showManualEvaluatorModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Add Manual Evaluator</h3>
                  <button 
                    onClick={() => setShowManualEvaluatorModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter department"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={1}
                    >
                      {[1, 2, 3, 4, 5].map(level => (
                        <option key={level} value={level}>
                          Level {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowManualEvaluatorModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // In a real app, you would validate the form and add the evaluator
                      // For now, we'll just close the modal
                      setShowManualEvaluatorModal(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Evaluator
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">{selectedEmployees.length}</div>
              <div className="text-sm font-medium text-blue-800">Employees</div>
              <div className="text-xs text-blue-600 mt-1">to be evaluated</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">{getTotalSelectedFactors()}</div>
              <div className="text-sm font-medium text-green-800">Factors</div>
              <div className="text-xs text-green-600 mt-1">across all categories</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">{selectedEvaluators.length}</div>
              <div className="text-sm font-medium text-purple-800">Evaluators</div>
              <div className="text-xs text-purple-600 mt-1">assigned to campaign</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              {selectedCampaign ? (
                <div>
                  <div className="text-sm font-medium text-gray-800 mb-1">Selected Campaign</div>
                  <div className="text-base font-semibold text-gray-900">
                    {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.name || '—'}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.description || ''}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-gray-600 mb-2">0</div>
                  <div className="text-sm font-medium text-gray-800">Campaign</div>
                  <div className="text-xs text-gray-600 mt-1">not selected</div>
                </div>
              )}
            </div>
          </div>
          {/* Save button removed here; kept in Stepper Review step only */}

        </div>

        {/* Stepper Wizard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          {/* Stepper header */}
          <div className="flex items-center justify-between mb-6">
            {[
              { id: 0, label: 'Campaign Info' },
              { id: 1, label: 'Employees' },
              { id: 2, label: 'Evaluators' },
              { id: 3, label: 'Factors' },
              { id: 4, label: 'Review & Confirm' },
            ].map((step, idx) => (
              <div key={step.id} className="flex-1 flex items-center">
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStep === idx
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => setActiveStep(idx)}
                >
                  {idx === 0 && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  {idx === 1 && <Users className="w-4 h-4 text-blue-600" />}
                  {idx === 2 && <UserCheck className="w-4 h-4 text-purple-600" />}
                  {idx === 3 && <Target className="w-4 h-4 text-green-600" />}
                  {idx === 4 && <Info className="w-4 h-4 text-gray-700" />}
                  {step.label}
                </button>
                {idx < 4 && (
                  <div className="flex-1 h-px mx-2 bg-gray-200" />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="space-y-4">
            {activeStep === 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">Selected Campaign</div>
                    <div className="text-base font-semibold text-gray-900 mt-1">
                      {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.name || '—'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.description || ''}
                    </div>
                  </div>
                  {/* Employee Group display removed */}
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Employees</h3>
                  <button
                    onClick={() => setShowEmployeeModal(true)}
                    className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Employee
                  </button>
                </div>
                <Table
                  columns={employeeColumns}
                  data={filteredSelectedEmployees}
                  onRemove={(idx) => {
                    const row = filteredSelectedEmployees[idx];
                    if (row) {
                      handleRemoveEmployeeById(row.id);
                    }
                  }}
                  emptyMessage="No employees selected. Use the Employees section above to add."
                />
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Evaluators</h3>
                  <button
                    onClick={() => setShowEvaluatorModal(true)}
                    className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Evaluator
                  </button>
                </div>
                <Table
                  columns={evaluatorColumns}
                  data={selectedEvaluators}
                  onRemove={handleRemoveEvaluator}
                  emptyMessage="No evaluators selected. Use the Evaluators section above to add."
                />
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Factors</h3>
                  <button
                    onClick={() => setShowFactorModal(true)}
                    className="inline-flex items-center gap-2 font-medium px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Factor
                  </button>
                </div>
                {/* Selected factors by type in table with SR and remove */}
                {['qualitative','quantitative','recommended'].map((type) => {
                  const list = factorSelections[type] || [];
                  if (list.length === 0) return null;
                  return (
                    <div key={`sel-${type}`} className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-700 capitalize">{type}</div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{list.length}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SR</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Factor Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {list.map((f, idx) => (
                              <tr key={f.id}>
                                <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{f.name}</td>
                                <td className="px-4 py-2 text-sm">
                                  <button
                                    className="p-2 rounded hover:bg-red-50 text-red-600"
                                    title="Remove factor"
                                    onClick={() => {
                                      setFactorSelections((prev) => {
                                        const current = prev[type] || [];
                                        return { ...prev, [type]: current.filter((x) => x.id !== f.id) };
                                      });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
                {/* If nothing selected at all */}
                {Object.values(factorSelections).reduce((n, arr) => n + (arr?.length || 0), 0) === 0 && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    No factors selected yet. Use the Factors section above to add.
                  </div>
                )}
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Review & Confirm</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{filteredSelectedEmployees.length}</div>
                    <div className="text-sm font-medium text-blue-800">Employees</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600 mb-1">{getTotalSelectedFactors()}</div>
                    <div className="text-sm font-medium text-green-800">Factors</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{selectedEvaluators.length}</div>
                    <div className="text-sm font-medium text-purple-800">Evaluators</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-800 mb-1">Campaign</div>
                    <div className="text-base font-semibold text-gray-900">
                      {campaigns.find((c) => String(c.id) === String(selectedCampaign))?.name || '—'}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleSaveAll}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
                  >
                    Save Campaign
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
              disabled={activeStep === 0}
              className={`px-4 py-2 rounded-lg border ${activeStep === 0 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >
              Previous
            </button>
            {activeStep < 4 && (
              <button
                onClick={() => setActiveStep((s) => Math.min(4, s + 1))}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Next
              </button>
            )}
            {activeStep === 4 && <div />}
          </div>
        </div>

      </main>

      {/* Employee Selection Modal */}
     <EmployeeModal
  isOpen={showEmployeeModal}
  onClose={() => setShowEmployeeModal(false)}
  data={filteredEmployeesMaster}                 // Filtered by selected Employee Group
  selectedItems={selectedEmployees}
  onConfirm={handleEmployeeConfirm}
/>

      {/* Evaluator Selection Modal */}
     <EvaluatorModal
  isOpen={showEvaluatorModal}
  onClose={() => setShowEvaluatorModal(false)}
  evaluators={evaluators}
  selectedEvaluators={selectedEvaluators}
  onConfirm={handleEvaluatorConfirm}
  onAddExternal={async () => {
    setShowEvaluatorModal(false);
    setShowManualEvaluatorModal(true);
  }}
/>
<ManualEvaluatorModal
  isOpen={showManualEvaluatorModal}
  onClose={() => setShowManualEvaluatorModal(false)}
  onCreated={async (newEvaluator) => {
    // ensure runtime level exists
    const withLevel = { ...newEvaluator, level: newEvaluator.level ?? '' };

    // add to master evaluators
    setEvaluators(prev => [...prev, withLevel]);

    // add to selected evaluators, preserve existing levels if same id existed
    setSelectedEvaluators(prev => {
      const map = new Map(prev.map(e => [e.id, e]));
      const existing = map.get(withLevel.id);
      if (existing) {
        map.set(withLevel.id, { ...existing, ...withLevel, level: existing.level ?? withLevel.level });
      } else {
        map.set(withLevel.id, withLevel);
      }
      return Array.from(map.values());
    });

    // If a campaign is selected, update campaign using stub
    if (selectedCampaign) {
      try {
        await updateCampaign({ id: selectedCampaign, evaluators: [{ id: withLevel.id, level: Number(withLevel.level || 0) }] });
      } catch (e) {
        console.error('Failed to update campaign with external evaluator', e);
      }
    }
  }}
/>

<FactorModal
  isOpen={showFactorModal}
  onClose={() => setShowFactorModal(false)}
  factors={factors}
  selectedByType={factorSelections}
  onConfirm={(type, list) => {
    setFactorSelections((prev) => ({ ...prev, [type]: list }));
    setShowFactorModal(false);
  }}
/>


    </div>
  );
}