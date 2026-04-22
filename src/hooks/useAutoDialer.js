import { useRef } from "react";
import { useState, useCallback, useEffect, useRef } from "react";

export function useAutoDialer(campaignId, agentId) {
  const [leads, setLeads] = useState([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [isDialing, setIsDialing] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const stopRequestedRef = useRef(false);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    if (!campaignId || !agentId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/zoom/fetch-leads?campaignId=${campaignId}&agentId=${agentId}`
      );
      const data = await res.json();
      setLeads(data.leads || []);
      setError(null);
    } catch (err) {
      setError("Failed to load leads");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [campaignId, agentId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Dial one lead
  const dialLead = useCallback(async (lead) => {
    const phone = lead.phoneNumber || lead.phone;
    const name = lead.businessName || lead.contactName || "Lead";

    console.log(`📞 Dialing: ${name} (${phone})`);
    setCallActive(true);

    const startTime = Date.now();

    try {
      // 1. Request Zoom meeting from backend
      const res = await fetch("/api/zoom/create-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          leadId: lead._id,
          agentId,
          leadPhone: phone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create meeting");
      }

      const meeting = await res.json();
      console.log(`✅ Meeting created: ${meeting.joinUrl}`);

      // 2. Open Zoom meeting in new window
      window.open(meeting.joinUrl, "zoom-call", "width=800,height=600");

      // 3. Wait for call to complete
      // Agent will click "Next" or "Stop" when done
      await waitForCallComplete(lead);

      // 4. Log the call
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await fetch("/api/zoom/log-call-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          leadId: lead._id,
          duration,
          status: "completed",
        }),
      });

      setCallHistory((prev) => [
        ...prev,
        {
          leadId: lead._id,
          leadName: name,
          phone,
          duration,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(`Error calling ${name}: ${err.message}`);
      console.error(err);
    } finally {
      setCallActive(false);
    }
  }, [campaignId, agentId]);

  // Wait until agent is done with call
  const waitForCallComplete = (lead) => {
    return new Promise((resolve) => {
      // Max 30 min per call
      const timeout = setTimeout(() => {
        console.log("⏱️ Call timeout (30 min)");
        resolve();
      }, 30 * 60 * 1000);

      // Store resolver globally so buttons can call it
      window.__currentCallResolver = {
        resolve: () => {
          clearTimeout(timeout);
          resolve();
        },
        lead,
      };
    });
  };

  // Start auto dialer
  const startAutoDialer = useCallback(async () => {
    if (!campaignId || leads.length === 0) {
      setError("No campaign or leads");
      return;
    }

    stopRequestedRef.current = false;
    setIsDialing(true);
    setError(null);

    for (let i = 0; i < leads.length; i++) {
      if (stopRequestedRef.current) break;

      setCurrentLeadIndex(i);
      await dialLead(leads[i]);

      // 2 second gap between calls
      if (!stopRequestedRef.current && i < leads.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setIsDialing(false);
    console.log("✅ All leads dialed");
  }, [campaignId, leads, dialLead]);

  // Stop auto dialer
  const stopAutoDialer = useCallback(() => {
    stopRequestedRef.current = true;
    setIsDialing(false);
    setCallActive(false);

    // Resolve current call if waiting
    if (window.__currentCallResolver) {
      window.__currentCallResolver.resolve();
      window.__currentCallResolver = null;
    }
  }, []);

  // Skip current call (move to next)
  const skipCall = useCallback(() => {
    if (window.__currentCallResolver) {
      window.__currentCallResolver.resolve();
      window.__currentCallResolver = null;
    }
  }, []);

  const currentLead = leads[currentLeadIndex] || null;

  return {
    isDialing,
    callActive,
    currentLead,
    currentLeadIndex,
    leads,
    callHistory,
    error,
    loading,
    startAutoDialer,
    stopAutoDialer,
    skipCall,
    fetchLeads,
  };
}