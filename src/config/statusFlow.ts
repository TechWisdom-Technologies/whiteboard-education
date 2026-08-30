export interface StatusStep {
  id: string;
  label: string;
  description: string;
}

// Flat list of new statuses
export const statusPhases = [
  {
    id: "main",
    label: "Main Statuses",
    steps: [
      { id: "new", label: "New", description: "Student registered" },
      { id: "application_in_progress", label: "Application in Progress", description: "Partner applied to a university program" },
      { id: "received_application_at_wb", label: "Received Application at WB", description: "Application accepted by WB team" },
      { id: "application_on_hold_intake", label: "Application on Hold – Intake yet to open", description: "Waiting for intake" },
      { id: "application_on_hold_wb", label: "Application on Hold – Wb team", description: "On hold by WB team" },
      { id: "application_on_hold_university", label: "Application on Hold – University", description: "On hold by University" },
      { id: "application_submitted", label: "Application Submitted", description: "Application submitted to university" },
      { id: "offer_letter_received_conditional", label: "Offer Letter Received (Conditional)", description: "Conditional offer letter issued by university" },
      { id: "offer_letter_received_unconditional", label: "Offer Letter Received (Unconditional)", description: "Unconditional offer letter issued by university" },
      { id: "rejected_by_university", label: "Rejected by University", description: "Application rejected by university" },
      { id: "ready_for_visa_application", label: "Ready for Visa Application", description: "Ready to apply for visa" },
      { id: "emgs_approval_pending", label: "EMGS Approval Pending", description: "EMGS approval in progress" },
      { id: "rejected_by_visa_office", label: "Rejected by Visa Office", description: "Visa application rejected" },
      { id: "declined_by_wb", label: "Declined by WB", description: "Application declined by WB team" },
    ]
  }
];

export const exceptionalStatuses = [];

export const getOrderedStatusIds = () => {
  return statusPhases.flatMap(phase => phase.steps.map(step => step.id));
};

export const getStatusIndex = (statusId: string) => {
  return getOrderedStatusIds().indexOf(statusId);
};

export const getPhaseForStatus = (statusId: string) => {
  return statusPhases.find(phase => 
    phase.steps.some(step => step.id === statusId)
  );
};

export const getStatusLabel = (statusId: string): string => {
  const allSteps = statusPhases.flatMap(phase => phase.steps);
  const step = allSteps.find(s => s.id === statusId);
  if (step) return step.label;
  
  if (statusId === "declined_by_wb") return "Declined by WB";

  // Fallback for old/unknown statuses
  return statusId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Computes the overall student status based on all their applications.
 * If all applications are declined (or empty), reverts to "new".
 * Otherwise picks the most advanced active application status in the pipeline.
 */
export const computeStudentStatusFromApplications = (applications: { status: string }[]): string => {
  if (!applications || applications.length === 0) return "new";
  
  const activeApps = applications.filter(a => a.status && a.status !== "declined_by_wb" && a.status !== "new");
  
  if (activeApps.length === 0) {
    return "new";
  }
  
  let highestStatus = activeApps[0].status;
  let highestIndex = getStatusIndex(highestStatus);
  
  for (const app of activeApps) {
    const idx = getStatusIndex(app.status);
    if (idx > highestIndex) {
      highestIndex = idx;
      highestStatus = app.status;
    }
  }
  
  return highestStatus;
};

