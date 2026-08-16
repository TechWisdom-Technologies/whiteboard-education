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
      { id: "received_application_at_wb", label: "Received Application at WB", description: "Partner applied to a university program" },
      { id: "application_in_progress", label: "Application in Progress", description: "Application is being processed" },
      { id: "application_on_hold_intake", label: "Application on Hold \u2013 Intake yet to open", description: "Waiting for intake" },
      { id: "application_on_hold_wb", label: "Application on Hold \u2013 Wb team", description: "On hold by WB team" },
      { id: "application_on_hold_university", label: "Application on Hold \u2013 University", description: "On hold by University" },
      { id: "application_submitted", label: "Application Submitted", description: "Application submitted to university" },
      { id: "offer_letter_received", label: "Offer Letter Received", description: "Offer letter issued by university" },
      { id: "rejected_by_university", label: "Rejected by University", description: "Application rejected by university" },
      { id: "ready_for_visa_application", label: "Ready for Visa Application", description: "Ready to apply for visa" },
      { id: "emgs_approval_pending", label: "EMGS Approval Pending", description: "EMGS approval in progress" },
      { id: "rejected_by_visa_office", label: "Rejected by Visa Office", description: "Visa application rejected" },
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
  
  // Fallback for old/unknown statuses
  return statusId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
