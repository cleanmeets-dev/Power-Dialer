import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAgentAutoDialerStatus,
  startAgentAutoDialing,
  stopAgentAutoDialing,
} from "../services/api";
import websocketService from "../services/websocket";

const matchesScope = (data, campaignId, agentId) => {
  if (!data || !campaignId || !agentId) return false;
  return (
    String(data.campaignId || "") === String(campaignId) &&
    String(data.agentId || "") === String(agentId)
  );
};

export function useAutoDialer(campaignId, agentId) {
  const [isDialing, setIsDialing] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [lastError, setLastError] = useState(null);
  const callHistorySeenRef = useRef(new Set());

  const appendHistory = useCallback((item) => {
    if (!item?.callLogId) return;
    if (callHistorySeenRef.current.has(item.callLogId)) return;
    callHistorySeenRef.current.add(item.callLogId);
    setCallHistory((prev) => [
      {
        ...item,
        timestamp: item.timestamp || new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!campaignId || !agentId) {
      setIsDialing(false);
      setCallActive(false);
      setCurrentLead(null);
      setCurrentCallId(null);
      return null;
    }

    const status = await getAgentAutoDialerStatus(campaignId, agentId);
    setIsDialing(Boolean(status?.isRunning));
    setCallActive(Boolean(status?.currentCallId));
    setCurrentCallId(status?.currentCallId || null);
    setCurrentLead(status?.currentLead || null);
    return status;
  }, [campaignId, agentId]);

  useEffect(() => {
    websocketService.connect();
  }, []);

  useEffect(() => {
    setLastError(null);
    setCallHistory([]);
    callHistorySeenRef.current = new Set();
    void refreshStatus();
  }, [campaignId, agentId, refreshStatus]);

  useEffect(() => {
    if (!campaignId || !agentId || !isDialing) return undefined;

    const interval = setInterval(() => {
      void refreshStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [agentId, campaignId, isDialing, refreshStatus]);

  useEffect(() => {
    if (!campaignId || !agentId) return undefined;

    const handleCallNext = (data) => {
      if (!matchesScope(data, campaignId, agentId)) return;
      setCurrentLead(data.lead || null);
      setLastError(null);
    };

    const handleCallStarted = (data) => {
      if (!matchesScope(data, campaignId, agentId)) return;
      setIsDialing(true);
      setCallActive(true);
      setCurrentLead(data.lead || null);
      setCurrentCallId(data.zoomCallId || null);
      setLastError(null);
    };

    const handleCallEnded = (data) => {
      if (!matchesScope(data, campaignId, agentId)) return;
      setCallActive(false);
      setCurrentCallId(null);
      appendHistory({
        callLogId: data.callLogId,
        leadId: data.leadId,
        zoomCallId: data.zoomCallId,
        status: data.status || "completed",
        reason: data.reason || null,
        duration: data.duration || 0,
      });
    };

    const handleCallFailed = (data) => {
      if (!matchesScope(data, campaignId, agentId)) return;
      setCallActive(false);
      setCurrentCallId(null);
      setLastError(data.reason || "Zoom call failed");
      appendHistory({
        callLogId: data.callLogId,
        leadId: data.leadId,
        status: "failed",
        reason: data.reason || "Zoom call failed",
      });
    };

    const handleCampaignStatus = (data) => {
      if (
        !data ||
        data.mode !== "agent" ||
        String(data.campaignId || "") !== String(campaignId) ||
        String(data.agentId || "") !== String(agentId)
      ) {
        return;
      }

      setIsDialing(data.status === "active");
      if (data.status !== "active") {
        setCallActive(false);
        setCurrentCallId(null);
      }
    };

    const handleCampaignCompleted = (data) => {
      if (
        !data ||
        data.mode !== "agent" ||
        String(data.campaignId || "") !== String(campaignId) ||
        String(data.agentId || "") !== String(agentId)
      ) {
        return;
      }

      setIsDialing(false);
      setCallActive(false);
      setCurrentCallId(null);
      setCurrentLead(null);
    };

    websocketService.on("call:next", handleCallNext);
    websocketService.on("call:started", handleCallStarted);
    websocketService.on("call:ended", handleCallEnded);
    websocketService.on("call:failed", handleCallFailed);
    websocketService.on("campaign-status-updated", handleCampaignStatus);
    websocketService.on("campaign-completed", handleCampaignCompleted);

    return () => {
      websocketService.off("call:next", handleCallNext);
      websocketService.off("call:started", handleCallStarted);
      websocketService.off("call:ended", handleCallEnded);
      websocketService.off("call:failed", handleCallFailed);
      websocketService.off("campaign-status-updated", handleCampaignStatus);
      websocketService.off("campaign-completed", handleCampaignCompleted);
    };
  }, [agentId, appendHistory, campaignId]);

  const startDialer = useCallback(async () => {
    if (!campaignId || !agentId) {
      throw new Error("Campaign and agent are required to start the auto dialer");
    }

    setLastError(null);
    const response = await startAgentAutoDialing(campaignId, agentId);
    await refreshStatus();
    return response;
  }, [agentId, campaignId, refreshStatus]);

  const stopDialer = useCallback(async () => {
    if (!campaignId || !agentId) {
      throw new Error("Campaign and agent are required to stop the auto dialer");
    }

    const response = await stopAgentAutoDialing(campaignId, agentId);
    await refreshStatus();
    return response;
  }, [agentId, campaignId, refreshStatus]);

  return useMemo(
    () => ({
      isDialing,
      callActive,
      currentLead,
      currentCallId,
      callHistory,
      lastError,
      startDialer,
      stopDialer,
      refreshStatus,
      setIsDialing,
    }),
    [
      callActive,
      callHistory,
      currentCallId,
      currentLead,
      isDialing,
      lastError,
      refreshStatus,
      startDialer,
      stopDialer,
    ],
  );
}

export default useAutoDialer;
