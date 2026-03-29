/**
 * Role utility functions for RBAC authorization
 * New role system: 'manager', 'caller-agent', 'closer-agent'
 */

export const ROLES = {
  MANAGER: 'manager',
  CALLER_AGENT: 'caller-agent',
  CLOSER_AGENT: 'closer-agent',
};

export const AGENT_ROLES = [ROLES.CALLER_AGENT, ROLES.CLOSER_AGENT];

/**
 * Check if user is any type of agent (caller-agent or closer-agent)
 */
export const isAgent = (role) => {
  return AGENT_ROLES.includes(role);
};

/**
 * Check if user is a caller agent (handles initial outbound calls)
 */
export const isCallerAgent = (role) => {
  return role === ROLES.CALLER_AGENT;
};

/**
 * Check if user is a closer agent (handles follow-ups and closures)
 */
export const isCloserAgent = (role) => {
  return role === ROLES.CLOSER_AGENT;
};

/**
 * Check if user is a manager
 */
export const isManager = (role) => {
  return role === ROLES.MANAGER;
};

/**
 * Get the home route for a given role
 */
export const getRoleHomeRoute = (role) => {
  return isManager(role) ? '/manager' : '/agent';
};
