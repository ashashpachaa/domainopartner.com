import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface AttendancePopupProps {
  isVisible: boolean;
  timeRemaining: number; // seconds
  staffName: string;
  onApprove: () => void;
  isCritical: boolean; // Show warning when time is running out
}

export default function AttendancePopup({
  isVisible,
  timeRemaining,
  staffName,
  onApprove,
  isCritical,
}: AttendancePopupProps) {
  if (!isVisible) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden ${
        isCritical ? "border-4 border-red-500" : "border-2 border-primary-500"
      }`}>
        {/* Header */}
        <div className={`p-6 ${isCritical ? "bg-red-50" : "bg-blue-50"}`}>
          <div className="flex items-center gap-3">
            {isCritical ? (
              <AlertCircle className="w-8 h-8 text-red-600 animate-pulse" />
            ) : (
              <Clock className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h2 className={`text-lg font-bold ${isCritical ? "text-red-900" : "text-blue-900"}`}>
                {isCritical ? "Action Required!" : "Work Status Check"}
              </h2>
              <p className={`text-sm ${isCritical ? "text-red-700" : "text-blue-700"}`}>
                Are you still working?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-slate-700 mb-4">
              Hi <strong>{staffName}</strong>, please confirm you're still working.
            </p>
            <p className="text-sm text-slate-600 mb-4">
              {isCritical 
                ? "If you don't confirm within the time limit, you will be marked as inactive."
                : "Click below to continue your work session."
              }
            </p>
          </div>

          {/* Timer */}
          <div className={`text-center p-4 rounded-lg ${isCritical ? "bg-red-100 border border-red-300" : "bg-blue-100 border border-blue-300"}`}>
            <p className={`text-sm font-medium mb-2 ${isCritical ? "text-red-700" : "text-blue-700"}`}>
              Time Remaining
            </p>
            <div className={`text-4xl font-bold font-mono ${isCritical ? "text-red-600" : "text-blue-600"}`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            {isCritical && (
              <p className="text-xs text-red-600 mt-2 animate-pulse">
                ⚠️ Please confirm immediately
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div>
            <Button
              onClick={onApprove}
              className={`w-full py-3 text-lg font-semibold gap-2 ${
                isCritical
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              Yes, I'm Working
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-slate-500 text-center p-3 bg-slate-50 rounded">
            <p>
              This check helps ensure staff members are actively working and prevents unauthorized system access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
