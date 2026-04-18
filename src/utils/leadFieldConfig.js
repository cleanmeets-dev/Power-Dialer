/**
 * Lead field configurations organized by role
 * Defines which fields each role can view and edit
 */

export const LEAD_FIELD_CONFIG = {
  // Common fields visible to all roles
  common: [
    { key: 'businessName', label: 'Business Name', type: 'text', readOnly: false },
    { key: 'contactName', label: 'Contact Name', type: 'text', readOnly: false },
    { key: 'phoneNumber', label: 'Phone Number', type: 'tel', readOnly: true },
    { key: 'email', label: 'Email', type: 'email', readOnly: false },
    { key: 'businessAddress', label: 'Address', type: 'text', readOnly: false },
    { key: 'city', label: 'City', type: 'text', readOnly: false },
    { key: 'state', label: 'State', type: 'text', readOnly: false },
    { key: 'country', label: 'Country', type: 'text', readOnly: false },
  ],

  // Caller-Agent specific fields (for initial outbound calls)
  'caller-agent': [
    { key: 'leadFor', label: 'Lead For', type: 'text', readOnly: false },
    { key: 'currentSetup', label: 'Current Setup', type: 'textarea', readOnly: false },
    { key: 'servicesGetting', label: 'Services Getting', type: 'textarea', readOnly: false },
    { key: 'frequency', label: 'Frequency', type: 'text', readOnly: false },
    { key: 'currentChallenges', label: 'Current Challenges', type: 'textarea', readOnly: false },
    { key: 'interestLevel', label: 'Interest Level', type: 'select', options: ['cold', 'warm', 'hot'], readOnly: false },
    { key: 'agentNotes', label: 'Notes', type: 'textarea', readOnly: false },
    { key: 'appointmentDate', label: 'Appointment Date', type: 'date', readOnly: false },
    { key: 'appointmentTime', label: 'Appointment Time', type: 'time', readOnly: false },
  ],

  // Closer-Agent specific fields (for follow-ups and closures)
  'closer-agent': [
    { key: 'website', label: 'Website', type: 'url', readOnly: false },
    { key: 'targetAreas', label: 'Target Areas', type: 'textarea', readOnly: false },
    { key: 'typeOfCleaning', label: 'Type of Cleaning', type: 'text', readOnly: false },
    { key: 'minimumFrequency', label: 'Minimum Frequency', type: 'text', readOnly: false },
    { key: 'targetIndustries', label: 'Target Industries', type: 'textarea', readOnly: false },
    { key: 'walkthroughAvailability', label: 'Walkthrough Availability', type: 'text', readOnly: false },
    { key: 'secondaryContact', label: 'Secondary Contact', type: 'text', readOnly: false },
    { key: 'formFilled', label: 'Form Filled', type: 'checkbox', readOnly: false },
    { key: 'emailResponse', label: 'Email Response', type: 'textarea', readOnly: false },
    { key: 'leadsSent', label: 'Leads Sent', type: 'number', readOnly: false },
    { key: 'onboardingStatus', label: 'Onboarding Status', type: 'text', readOnly: false },
    { key: 'upSell', label: 'Up-Sell', type: 'textarea', readOnly: false },
    { key: 'closerNotes', label: 'Closer Notes', type: 'textarea', readOnly: false },
  ],

  // Manager sees all fields
  manager: 'all', // Special flag indicating managers see all fields
};

export const LEAD_WORKFLOW_FIELDS = [
  { key: 'dialerStatus', label: 'Dialer Status', type: 'select', options: ['pending', 'dialing', 'connected', 'failed', 'completed'], readOnly: true },
  { key: 'appointmentStatus', label: 'Appointment Status', type: 'select', options: ['qualified', 'disqualified', 'in-process', 'reschedule', 'onhold'], readOnly: false },
  { key: 'disposition', label: 'Disposition', type: 'select', options: ['voicemail', 'followup', 'not-interested', 'appointment', 'wrong-number'], readOnly: false },
  { key: 'agentNotes', label: 'Agent Notes', type: 'textarea', readOnly: false },
  { key: 'followUpDate', label: 'Follow-Up Date', type: 'date', readOnly: false },
  { key: 'lastDialedAt', label: 'Last Dialed', type: 'datetime-local', readOnly: true },
];

/**
 * Get fields visible to a specific role
 * @param {string} role - User role (manager, caller-agent, closer-agent)
 * @returns {array} Array of field configurations
 */
export const getVisibleFields = (role) => {
  if (role === 'manager') {
    // Managers see all fields
    return [
      ...LEAD_FIELD_CONFIG.common,
      ...LEAD_FIELD_CONFIG['caller-agent'],
      ...LEAD_FIELD_CONFIG['closer-agent'],
      ...LEAD_WORKFLOW_FIELDS,
    ];
  } else if (role === 'caller-agent') {
    return [
      ...LEAD_FIELD_CONFIG.common,
      ...LEAD_FIELD_CONFIG['caller-agent'],
      ...LEAD_WORKFLOW_FIELDS,
    ];
  } else if (role === 'closer-agent') {
    return [
      ...LEAD_FIELD_CONFIG.common,
      ...LEAD_FIELD_CONFIG['closer-agent'],
      ...LEAD_WORKFLOW_FIELDS,
    ];
  }
  return LEAD_FIELD_CONFIG.common;
};

/**
 * Get table columns for a specific role
 * @param {string} role - User role
 * @returns {array} Array of column configurations
 */
export const getTableColumns = (role) => {
  const baseColumns = [
    { key: 'businessName', label: 'Business Name', width: 'w-48' },
    { key: 'businessAddress', label: 'Address', width: 'w-56' },
    { key: 'phoneNumber', label: 'Phone', width: 'w-28' },
    { key: 'dialerStatus', label: 'Dialer Status', width: 'w-24' },
  ];

  if (role === 'manager') {
    return [
      ...baseColumns,
      { key: 'assignedAgentName', label: 'Assigned Agent', width: 'w-32' },
    ];
  }

  return baseColumns;
};
