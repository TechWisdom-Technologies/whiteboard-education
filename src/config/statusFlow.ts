export interface StatusStep {
  id: string;
  label: string;
  description: string;
}

export interface StatusPhase {
  id: string;
  label: string;
  steps: StatusStep[];
}

export const statusPhases: StatusPhase[] = [
  {
    id: "application",
    label: "Application",
    steps: [
      { id: "document_upload", label: "Document Upload", description: "Student submits academic certificates, transcripts, and passport" },
      { id: "document_review", label: "Document Review", description: "Admin checks documents for eligibility and completeness" },
      { id: "document_verification", label: "Document Verification", description: "Admin verifies authenticity of the submitted academic papers" },
      { id: "university_selection", label: "University Selection", description: "Student and counselor finalize the choice of universities" },
      { id: "university_application", label: "University Application", description: "Admin submits applications to the chosen institutions" },
      { id: "application_pending", label: "Application Pending", description: "Waiting for university evaluation and feedback" }
    ]
  },
  {
    id: "offer_emgs",
    label: "Offer & EMGS",
    steps: [
      { id: "university_accepted", label: "University Accepted", description: "University issues the initial Offer Letter" },
      { id: "offer_letter_signed", label: "Offer Letter Signed", description: "Student accepts the offer and pays the initial tuition/deposit" },
      { id: "emgs_application_submitted", label: "EMGS Application Submitted", description: "Admin/University initiates the EMGS portal application" },
      { id: "emgs_fee_paid", label: "EMGS Fee Paid", description: "Processing and visa fees are cleared" },
      { id: "pre_medical_clearance", label: "Pre-Medical Clearance", description: "Student completes medical screening in home country" },
      { id: "emgs_approval_pending", label: "EMGS Approval Pending", description: "Tracking EMGS percentage progress toward 100%" }
    ]
  },
  {
    id: "visa",
    label: "Visa",
    steps: [
      { id: "val_issued", label: "VAL Issued", description: "Visa Approval Letter received from Malaysian Immigration" },
      { id: "sev_application", label: "SEV Application", description: "Single-Entry Visa applied for at the Malaysian Embassy/VFS" },
      { id: "sev_received", label: "SEV Received", description: "Passport stamped with the Single-Entry Visa" }
    ]
  },
  {
    id: "arrival",
    label: "Arrival & Enrollment",
    steps: [
      { id: "pre_departure_briefing", label: "Pre-Departure Briefing", description: "Flight booked, and university notified for airport pickup" },
      { id: "arrived_in_malaysia", label: "Arrived in Malaysia", description: "Student lands and passes through airport immigration clearance" },
      { id: "post_arrival_medical", label: "Post-Arrival Medical", description: "Student passes the mandatory health screening in Malaysia" },
      { id: "student_pass_endorsed", label: "Student Pass Endorsed", description: "Passport submitted and stamped with the final multi-entry Student Pass" },
      { id: "enrolled_completed", label: "Enrolled & Completed", description: "Student receives i-Kad; file is successfully closed" }
    ]
  }
];

export const exceptionalStatuses = [
  { id: "rejected", label: "Rejected" },
  { id: "on_hold", label: "On Hold" }
];

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
  const exceptional = exceptionalStatuses.find(s => s.id === statusId);
  if (exceptional) return exceptional.label;
  
  // Fallback for old/unknown statuses
  return statusId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
