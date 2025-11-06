import { useState, useEffect } from "react";
import { ArrowLeft, Save, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { mockStageDeadlines, type StageDealineConfig } from "@/lib/mockData";

export default function AdminWorkflowSettings() {
  const [deadlines, setDeadlines] = useState<StageDealineConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number | "">();
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("stageDeadlines");
    if (saved) {
      setDeadlines(JSON.parse(saved));
    } else {
      setDeadlines(mockStageDeadlines);
    }
  }, []);

  const handleEditStart = (deadline: StageDealineConfig) => {
    setEditingId(deadline.id);
    setEditingValue(deadline.daysAllowed);
  };

  const handleEditSave = (id: string) => {
    if (editingValue === "" || editingValue === undefined || editingValue < 0) {
      alert("Please enter a valid number");
      return;
    }

    setDeadlines(
      deadlines.map((d) =>
        d.id === id
          ? {
              ...d,
              daysAllowed: editingValue,
              lastUpdatedBy: "S001", // In real app, get from current user
              lastUpdatedAt: new Date().toISOString(),
            }
          : d,
      ),
    );
    setEditingId(null);
    setEditingValue("");
    setUnsavedChanges(true);
  };

  const handleSaveAll = () => {
    localStorage.setItem("stageDeadlines", JSON.stringify(deadlines));
    setUnsavedChanges(false);
    alert("Workflow stage deadlines saved successfully!");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default deadlines?")) {
      setDeadlines(mockStageDeadlines);
      localStorage.setItem(
        "stageDeadlines",
        JSON.stringify(mockStageDeadlines),
      );
      setUnsavedChanges(false);
      alert("Deadlines reset to defaults!");
    }
  };

  const formatDaysText = (days: number) => {
    if (days < 1) {
      const hours = Math.round(days * 24);
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    return `${Math.round(days)} day${Math.round(days) !== 1 ? "s" : ""}`;
  };

  const stageCategories = [
    {
      title: "Core Workflow Stages",
      stages: [
        "Order Created",
        "Sales Review",
        "Operation Processing",
        "Manager Review",
        "Client Acceptance",
      ],
    },
    {
      title: "Post-Services Stages",
      stages: [
        "Apostille Processing",
        "Power of Attorney",
        "Financial Report",
        "Shipping & Tracking",
      ],
    },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin/operations">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Workflow Stage Deadlines
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Configure deadline durations for each workflow stage
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-amber-300 text-amber-600 hover:bg-amber-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={!unsavedChanges}
                className={
                  unsavedChanges
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-slate-400"
                }
              >
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Deadline values can be entered as decimal
              numbers. For example: 0.25 = 6 hours, 0.5 = 12 hours, 1 = 1 day, 3
              = 3 days. Changes will apply to all new orders created after
              saving.
            </p>
          </div>

          {/* Stages by Category */}
          {stageCategories.map((category) => (
            <div key={category.title} className="mb-10">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b-2 border-primary-600">
                {category.title}
              </h2>

              <div className="grid gap-4">
                {deadlines
                  .filter((d) => category.stages.includes(d.stageName))
                  .map((deadline) => (
                    <div
                      key={deadline.id}
                      className="bg-white rounded-lg p-6 border border-slate-200 hover:border-primary-300 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {deadline.stageName}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {deadline.description}
                          </p>
                          {deadline.notes && (
                            <p className="text-xs text-slate-500 mt-2 italic">
                              {deadline.notes}
                            </p>
                          )}
                          {deadline.lastUpdatedBy && (
                            <div className="mt-3 text-xs text-slate-500">
                              <p>
                                Last updated by {deadline.lastUpdatedBy} on{" "}
                                {new Date(
                                  deadline.lastUpdatedAt || "",
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {editingId === deadline.id ? (
                            <>
                              <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50">
                                <input
                                  type="number"
                                  step="0.25"
                                  min="0"
                                  value={editingValue}
                                  onChange={(e) =>
                                    setEditingValue(
                                      e.target.value === ""
                                        ? ""
                                        : parseFloat(e.target.value),
                                    )
                                  }
                                  className="w-20 px-2 py-1 bg-transparent text-right font-semibold text-slate-900 focus:outline-none"
                                  autoFocus
                                />
                                <span className="px-2 text-sm text-slate-600">
                                  {editingValue === "" ||
                                  editingValue === undefined
                                    ? "days"
                                    : editingValue < 1
                                      ? "hours"
                                      : "days"}
                                </span>
                              </div>
                              <Button
                                onClick={() => handleEditSave(deadline.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Save
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="text-center bg-primary-50 rounded-lg p-3 border border-primary-200">
                                <p className="text-2xl font-bold text-primary-600">
                                  {deadline.daysAllowed}
                                </p>
                                <p className="text-xs font-medium text-slate-600">
                                  {formatDaysText(deadline.daysAllowed)}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleEditStart(deadline)}
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                Edit
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* Additional Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-10">
            <h3 className="font-semibold text-slate-900 mb-3">
              How Deadlines Work
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                • <strong>Cumulative:</strong> Deadlines are calculated
                cumulatively from order creation date.
              </li>
              <li>
                • <strong>Business Days:</strong> Only business days (Mon-Fri)
                are counted for deadlines of 1 day or more.
              </li>
              <li>
                • <strong>Hours:</strong> For durations less than 1 day (0.25 =
                6 hours), clock time is used instead of business days.
              </li>
              <li>
                • <strong>Global Effect:</strong> Changes will apply to all new
                orders, not existing ones.
              </li>
              <li>
                ��� <strong>Tracking:</strong> All changes are logged with
                timestamp and user who made the change.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
