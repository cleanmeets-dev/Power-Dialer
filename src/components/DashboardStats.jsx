import StatsCard from './StatsCard';

/**
 * DashboardStats - Displays stats cards (Total Leads, Dialed, Connected, In Progress)
 */
export default function DashboardStats({ 
  totalLeads, 
  dialedCount, 
  successCount, 
  callsInProgress 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      <StatsCard
        label="Total Leads"
        value={totalLeads}
        icon="Upload"
        color="cyan"
      />
      <StatsCard
        label="Dialed"
        value={dialedCount}
        icon="Phone"
        color="yellow"
      />
      <StatsCard
        label="Connected"
        value={successCount}
        icon="CheckCircle"
        color="emerald"
      />
      <StatsCard
        label="In Progress"
        value={callsInProgress}
        icon="Clock"
        color="blue"
      />
    </div>
  );
}
