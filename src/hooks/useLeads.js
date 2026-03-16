import { useContext } from 'react';
import { LeadsContext } from '../context/LeadsContext';

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within LeadsProvider');
  }
  return context;
}
