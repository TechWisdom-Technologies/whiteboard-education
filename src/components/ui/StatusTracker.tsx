import { CheckCircle2, ChevronRight, Circle, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "./button";
import { statusPhases, exceptionalStatuses, getOrderedStatusIds, getPhaseForStatus, getStatusIndex } from "@/config/statusFlow";

interface StatusTrackerProps {
  currentStatus: string;
  onStatusChange?: (status: string) => void;
  isUpdating?: boolean;
  isAdmin?: boolean;
  fileOpenedAt?: string;
}

export function StatusTracker({ 
  currentStatus, 
  onStatusChange,
  isUpdating = false,
  isAdmin = false,
  fileOpenedAt 
}: StatusTrackerProps) {
  
  const orderedIds = getOrderedStatusIds();
  const currentIndex = getStatusIndex(currentStatus);
  const isExceptional = exceptionalStatuses.some(s => s.id === currentStatus);
  const activePhase = isExceptional ? null : getPhaseForStatus(currentStatus);
  const activePhaseIndex = activePhase ? statusPhases.findIndex(p => p.id === activePhase.id) : -1;

  // Next status in normal flow
  const nextStatusId = (currentIndex >= 0 && currentIndex < orderedIds.length - 1) 
    ? orderedIds[currentIndex + 1] 
    : null;

  const handleNextStep = () => {
    if (nextStatusId && onStatusChange) {
      onStatusChange(nextStatusId);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden mb-8">
      {/* ── Top Level: Phases Timeline ── */}
      <div className="bg-slate-50 border-b p-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full max-w-full">
            {statusPhases.map((phase, index) => {
              // Phase logic
              const isCompleted = !isExceptional && activePhaseIndex > index;
              const isCurrent = !isExceptional && activePhase?.id === phase.id;
              
              let textColor = "text-slate-400";
              let iconColor = "text-slate-300";
              
              if (isCompleted) {
                textColor = "text-emerald-700 font-semibold";
                iconColor = "text-emerald-500";
              } else if (isCurrent) {
                textColor = "text-[#2F4F97] font-bold";
                iconColor = "text-[#2F4F97]";
              }

              return (
                <div key={phase.id} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-1.5 ${textColor}`}>
                    {isCompleted ? (
                      <CheckCircle2 className={`h-4 w-4 ${iconColor}`} />
                    ) : isCurrent ? (
                      <div className={`h-4 w-4 rounded-full border-4 border-[#2F4F97]/20 flex items-center justify-center`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-[#2F4F97]" />
                      </div>
                    ) : (
                      <Circle className={`h-4 w-4 ${iconColor}`} />
                    )}
                    <span className="text-[13px] whitespace-nowrap">{phase.label}</span>
                  </div>
                  {index < statusPhases.length - 1 && (
                    <ChevronRight className="h-4 w-4 mx-3 text-slate-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button for Admins */}
          {isAdmin && !isExceptional && nextStatusId && (
            <Button 
              size="sm" 
              onClick={handleNextStep}
              disabled={isUpdating}
              className="bg-[#2F4F97] hover:bg-[#2F4F97]/90 text-white shadow-sm shrink-0 whitespace-nowrap text-xs px-4 h-7"
            >
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
              Advance to Next Step
            </Button>
          )}
        </div>
      </div>

      {/* ── Exceptional Status Banner ── */}
      {isExceptional && (
        <div className={`p-6 flex flex-col items-center justify-center text-center border-b ${
          currentStatus === "rejected" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          {currentStatus === "rejected" ? <XCircle className="h-10 w-10 mb-2 text-red-500" /> : <Clock className="h-10 w-10 mb-2 text-amber-500" />}
          <h3 className="text-lg font-bold">
            Application {currentStatus === "rejected" ? "Rejected" : "On Hold"}
          </h3>
          <p className="text-sm opacity-80 max-w-md mx-auto mt-1">
            The standard progression has been paused. Contact an administrator for further details or to resume the application.
          </p>
          
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onStatusChange?.('document_upload')}
              className="mt-4 bg-white"
            >
              Restart Flow
            </Button>
          )}
        </div>
      )}

      {/* ── Sub Level: Active Phase Steps ── */}
      {!isExceptional && activePhase && (
        <div className="p-4 sm:p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
            {activePhase.steps.map((step, idx) => {
              const stepIndex = getStatusIndex(step.id);
              const isPast = stepIndex < currentIndex;
              const isCurrent = stepIndex === currentIndex;
              
              return (
                <div 
                  key={step.id} 
                  className={`flex gap-3 relative ${isCurrent ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-40'}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isPast ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    ) : isCurrent ? (
                      <div className="h-5 w-5 rounded-full bg-[#2F4F97]/10 flex items-center justify-center text-[#2F4F97] ring-2 ring-[#2F4F97]/20">
                        <div className="h-2 w-2 rounded-full bg-[#2F4F97]" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <button 
                      onClick={() => isAdmin && onStatusChange?.(step.id)}
                      disabled={!isAdmin || isUpdating}
                      className={`text-sm font-bold text-left block leading-tight ${isAdmin ? 'hover:text-[#2F4F97] cursor-pointer' : 'cursor-default'} ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}
                    >
                      {step.label}
                    </button>
                    <p className="text-xs text-slate-500 leading-snug mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* ── Bottom Bar ── */}
      <div className="bg-slate-50/50 px-4 py-2 border-t flex items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          {fileOpenedAt && (
            <span>
              File Opened on {new Date(fileOpenedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2">
            Manual Override: 
            <select 
              value={currentStatus} 
              onChange={(e) => onStatusChange?.(e.target.value)}
              disabled={isUpdating}
              className="bg-transparent border-none text-[#2F4F97] font-semibold focus:ring-0 cursor-pointer outline-none p-0 ml-1"
            >
              {getOrderedStatusIds().map(id => (
                <option key={id} value={id}>
                  {statusPhases.find(p => p.steps.some(s => s.id === id))?.steps.find(s => s.id === id)?.label}
                </option>
              ))}
              <option disabled>──────────</option>
              {exceptionalStatuses.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
