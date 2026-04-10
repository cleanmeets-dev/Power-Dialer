# Frontend Service Layer Documentation

This document explains the frontend service layer and how to use the hooks for agent and queue management.

## Architecture Overview

The frontend now has a complete service layer that mirrors the backend services:

```
Frontend Components
    ↓
Hooks (useDialer, useAgentService, useQueueService)
    ↓
API Layer (api.js)
    ↓
HTTP Endpoints
    ↓
Backend Services (dialerManager, agentService, queueService)
    ↓
Database (MongoDB)
```

## Available Hooks

### 1. `useDialer` - Call Management
**Location:** `src/hooks/useDialer.js`

Manages active calls, campaign state, and real-time call tracking.

**Usage:**
```javascript
import { useDialer } from '../hooks';

function MyComponent() {
  const {
    activeCalls,        // Array of active calls
    isDialing,          // Boolean - is dialing active?
    totalCalls,         // Number of total calls
    completedCalls,     // Number of completed calls
    startDialing,       // Function to start dialing
    stopDialing,        // Function to stop dialing
    getDialerStatus,    // Function to get status
  } = useDialer(campaignId);

  return (
    <button onClick={() => startDialing(campaignId)}>
      Start Dialing ({activeCalls.length} active)
    </button>
  );
}
```

### 2. `useAgentService` - Agent Management
**Location:** `src/hooks/useAgentService.js`

Manages agent availability, call assignments, and statistics.

**Methods:**
- `fetchAvailableAgents()` - Get all available agents
- `fetchAgentStats()` - Get agent statistics
- `updateAvailability(agentId, isAvailable)` - Toggle agent availability
- `assignCallToAgent(agentId, leadId)` - Assign call to agent
- `completeAgentCall(agentId, duration)` - Mark agent call as complete

**Usage Examples:**

```javascript
import { useAgentService } from '../hooks';

// Fetch available agents
function AgentSelector() {
  const { agents, fetchAvailableAgents } = useAgentService();
  
  useEffect(() => {
    fetchAvailableAgents();
  }, []);
  
  return (
    <div>
      {agents.map((agent) => (
        <div key={agent._id}>
          {agent.name} - {agent.isAvailable ? 'Available' : 'Busy'}
        </div>
      ))}
    </div>
  );
}

// Manage agent availability
function AgentAvailabilityToggle({ agentId }) {
  const { updateAvailability } = useAgentService();
  
  const toggle = async () => {
    const result = await updateAvailability(agentId, true);
    if (result.success) {
      console.log('Agent is now available');
    }
  };
  
  return <button onClick={toggle}>Toggle Availability</button>;
}
```

### 3. `useQueueService` - Lead Queue Management
**Location:** `src/hooks/useQueueService.js`

Manages the lead queue, marking leads as pending/dialing/completed.

**Methods:**
- `getNextLeadsToCall(campaignId, count)` - Fetch next leads to dial
- `markAsDialing(leadId)` - Mark lead as currently being dialed
- `markAsCompleted(leadId, reason)` - Mark lead as completed
- `markAsRetryable(leadId, reason)` - Mark lead for retry
- `refreshQueue(campaignId, status)` - Refresh queue from server
- `getQueueLength()` - Get current queue length
- `getQueueStats()` - Get queue statistics

**Usage Examples:**

```javascript
import { useQueueService } from '../hooks';

// Initialize queue for a campaign
function QueueStatus({ campaignId }) {
  const { queue, getQueueStats, refreshQueue } = useQueueService();
  
  useEffect(() => {
    refreshQueue(campaignId, 'pending');
  }, [campaignId]);
  
  const stats = getQueueStats();
  
  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Pending: {stats.pending}</p>
      <p>Dialing: {stats.dialing}</p>
      <p>Completed: {stats.completed}</p>
      <p>Progress: {stats.percentComplete}%</p>
    </div>
  );
}

// Mark lead as dialing
async function dialNextLead(leadId) {
  const { markAsDialing } = useQueueService();
  const result = await markAsDialing(leadId);
  if (result.success) {
    console.log('Lead marked as dialing');
  }
}

// Mark call as complete
async function completeCall(leadId, reason = 'completed') {
  const { markAsCompleted } = useQueueService();
  const result = await markAsCompleted(leadId, reason);
  if (result.success) {
    console.log('Lead marked as completed');
  }
}
```

## Integration Examples

### Example 1: LeadsPage with Queue Service

```javascript
import { useQueueService } from '../hooks';

export default function LeadsPage() {
  const { queue, refreshQueue, markAsDialing, getQueueStats } = useQueueService();
  const [campaignId, setCampaignId] = useState(null);
  
  useEffect(() => {
    if (campaignId) {
      refreshQueue(campaignId, 'pending');
    }
  }, [campaignId]);
  
  const stats = getQueueStats();
  
  return (
    <div>
      <div>Queue Status: {stats.pending} pending, {stats.percentComplete}% complete</div>
      <table>
        <tbody>
          {queue.map((lead) => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>{lead.phoneNumber}</td>
              <td>{lead.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 2: AgentAvailabilityPage with Agent Service

```javascript
import { useAgentService } from '../hooks';

export default function AgentAvailabilityPage() {
  const { agents, fetchAgentStats, updateAvailability } = useAgentService();
  
  useEffect(() => {
    fetchAgentStats();
    // Poll every 5 seconds
    const interval = setInterval(fetchAgentStats, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h2>Agent Status</h2>
      {agents.map((agent) => (
        <div key={agent._id} style={{ 
          padding: '10px', 
          border: '1px solid #ccc',
          backgroundColor: agent.isAvailable ? '#90EE90' : '#FFB6C6'
        }}>
          <h3>{agent.name}</h3>
          <p>Status: {agent.isAvailable ? 'Available' : 'Busy'}</p>
          <p>Calls Handled: {agent.callsHandled || 0}</p>
          <button onClick={() => updateAvailability(agent._id, !agent.isAvailable)}>
            Toggle Availability
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: OverviewPage with Multiple Services

```javascript
import { useDialer, useQueueService, useAgentService } from '../hooks';

export default function OverviewPage() {
  const { activeCalls, isDialing } = useDialer();
  const { getQueueStats } = useQueueService();
  const { agents, fetchAgentStats } = useAgentService();
  
  const queueStats = getQueueStats();
  
  return (
    <div>
      <div className="dashboard-grid">
        {/* Dialing Status */}
        <card>
          <h3>Dialing Status</h3>
          <p>Active Calls: {activeCalls.length}</p>
          <p>Status: {isDialing ? 'Running' : 'Stopped'}</p>
        </card>
        
        {/* Queue Status */}
        <card>
          <h3>Lead Queue</h3>
          <p>Pending: {queueStats.pending}</p>
          <p>Dialing: {queueStats.dialing}</p>
          <p>Completed: {queueStats.completed}</p>
        </card>
        
        {/* Agent Status */}
        <card>
          <h3>Agent Status</h3>
          <p>Available: {agents.filter(a => a.isAvailable).length}</p>
          <p>Total: {agents.length}</p>
        </card>
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Hook Dependencies
Always include hooks in dependency arrays appropriately:

```javascript
useEffect(() => {
  fetchAgentStats();
}, []); // Empty dependency - fetch once on mount

useEffect(() => {
  refreshQueue(campaignId);
}, [campaignId, refreshQueue]); // Refetch when campaign changes
```

### 2. Error Handling
Always check for success and handle errors:

```javascript
const handleUpdate = async (agentId) => {
  const result = await updateAvailability(agentId, true);
  if (result.success) {
    showNotification('Agent updated');
  } else {
    showNotification(`Error: ${result.error}`, 'error');
  }
};
```

### 3. Real-time Updates
Combine with Socket.IO for real-time updates:

```javascript
useEffect(() => {
  const handleCallAnswered = (callData) => {
    // Update local state if needed
    refreshQueue(campaignId);
  };
  
  socket.on(`campaign:${campaignId}:call-answered`, handleCallAnswered);
  
  return () => socket.off(`campaign:${campaignId}:call-answered`, handleCallAnswered);
}, [campaignId, socket]);
```

### 4. Polling Patterns
For periodic data updates:

```javascript
useEffect(() => {
  // Initial fetch
  fetchAgentStats();
  
  // Poll every 10 seconds
  const interval = setInterval(fetchAgentStats, 10000);
  
  // Cleanup
  return () => clearInterval(interval);
}, []);
```

## Hook Return Values

### useAgentService Returns:
```javascript
{
  agents: Array<Agent>,           // List of agents
  isLoading: Boolean,             // Loading state
  error: String | null,           // Error message if any
  fetchAvailableAgents: Function, // () => Promise
  fetchAgentStats: Function,      // () => Promise
  updateAvailability: Function,   // (agentId, isAvailable) => Promise
  assignCallToAgent: Function,    // (agentId, leadId) => Promise
  completeAgentCall: Function,    // (agentId, duration) => Promise
}
```

### useQueueService Returns:
```javascript
{
  queue: Array<Lead>,             // Current queue
  isLoading: Boolean,             // Loading state
  error: String | null,           // Error message if any
  getNextLeadsToCall: Function,   // (campaignId, count) => Promise
  markAsDialing: Function,        // (leadId) => Promise
  markAsCompleted: Function,      // (leadId, reason) => Promise
  markAsRetryable: Function,      // (leadId, reason) => Promise
  refreshQueue: Function,         // (campaignId, status) => Promise
  getQueueLength: Function,       // () => number
  getQueueStats: Function,        // () => {total, pending, dialing, completed, percentComplete}
}
```

## Data Flow

**Starting a Campaign:**
1. Frontend: `useDialer().startDialing(campaignId)`
2. API: POST `/api/dialer/start`
3. Backend: `dialerManager.startDialing(campaignId)`
4. Backend: Uses `queueService.getNextLeadsToCall()`
5. Backend: Calls `twilioService.initiateCall()` for each lead
6. Frontend: WebSocket updates with call status
7. Frontend: `useQueueService().markAsDialing(leadId)` for UI sync

**Agent Handling Call:**
1. Frontend: `useAgentService().assignCallToAgent(agentId, leadId)`
2. Backend: Updates agent `isAvailable = false`
3. Frontend: Shows agent as busy in AgentAvailabilityPage
4. Call completes via Twilio webhook
5. Frontend: `useAgentService().completeAgentCall(agentId, duration)`
6. Backend: Sets agent `isAvailable = true`

## File Structure

```
frontend/src/
├── hooks/
│   ├── index.js                  ← Hook exports
│   ├── useDialer.js              ← Already exists
│   ├── useAgentService.js        ← NEW
│   └── useQueueService.js        ← NEW
├── services/
│   └── api.js                    ← HTTP API wrapper
└── pages/
    ├── OverviewPage.jsx
    ├── LeadsPage.jsx
    ├── CallLogsPage.jsx
    ├── CampaignsPage.jsx
    ├── MyAvailabilityPage.jsx
    └── AgentAvailabilityPage.jsx
```

## Backend Service Reference

For context, here's what these hooks consume:

**Backend dialerManager:**
- Orchestrates `queueService` + `agentService` + `twilioService`
- Manages campaign state, concurrency limits, call retries

**Backend queueService:**
- `getNextLeadsToCall()` - Fetch pending leads
- `markAsDialing()` - Update dialer status to dialing
- `markAsCompleted()` - Update dialer status to completed

**Backend agentService:**
- `getAvailableAgents()` - Find available agents
- `assignCallToAgent()` - Assign call to agent
- `completeAgentCall()` - Mark agent call as done
- `updateAgentAvailability()` - Toggle agent availability

## Testing the Services

```javascript
// In browser console
import { useAgentService, useQueueService } from './hooks';

// Test agent service
const agentService = useAgentService();
await agentService.fetchAvailableAgents();
console.log(agentService.agents);

// Test queue service
const queueService = useQueueService();
await queueService.getNextLeadsToCall('campaignId123', 5);
console.log(queueService.queue);
```

---

**Summary:** The frontend now has a complete service layer that mirrors the backend. Use the hooks in your components for clean, testable code with proper state management.
