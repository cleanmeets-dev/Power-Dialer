import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { TrendingUp, Award, Zap } from "lucide-react";

const AgentEarningsDashboard = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch(
          `/api/earnings/summary/${user._id}?timeframe=${timeframe}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const data = await response.json();
        if (data.success) {
          setEarnings(data.data);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    };
    if (user?._id) fetchEarnings();
  }, [user?._id, timeframe]);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const response = await fetch(
          `/api/earnings/breakdown/${user._id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const data = await response.json();
        if (data.success) {
          setBreakdown(data.data);
        }
      } catch (error) {
        console.error("Error fetching breakdown:", error);
      }
    };
    if (user?._id) fetchBreakdown();
  }, [user?._id]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/earnings/leaderboard?timeframe=${timeframe}&limit=5`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        const data = await response.json();
        if (data.success) {
          setLeaderboard(data.data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [timeframe]);

  const currentRank = leaderboard.findIndex(
    (agent) => agent.agentId === user?._id
  ) + 1 || "N/A";

  return (
    <div className="space-y-6">
      {/* Timeframe selector */}
      <div className="flex gap-2">
        {["all", "month", "week", "today"].map((frame) => (
          <button
            key={frame}
            onClick={() => setTimeframe(frame)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              timeframe === frame
                ? "bg-primary-600 text-white"
                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {frame.charAt(0).toUpperCase() + frame.slice(1)}
          </button>
        ))}
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total earnings */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Earnings
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                Rs {earnings?.totalEarnings?.toLocaleString() || 0}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {timeframe === "all"
                  ? "All time"
                  : timeframe === "month"
                    ? "This month"
                    : timeframe === "week"
                      ? "This week"
                      : "Today"}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Qualifications count */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Qualifications
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {earnings?.totalQualifications || 0}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                leads qualified
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Average per qualification */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Leaderboard Rank
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                #{currentRank}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                in top earners
              </p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
              <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Qualification breakdown */}
      {breakdown && breakdown.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
            Breakdown by Level
          </h3>
          <div className="space-y-3">
            {breakdown.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item._id || "Unqualified"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.count} qualification{item.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Rs {item.totalEarnings?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rs {(item.totalEarnings / item.count).toFixed(0)} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 p-6 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Top Earners This {timeframe === "month" ? "Month" : timeframe === "week" ? "Week" : "Period"}
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {leaderboard.map((agent, index) => (
              <div
                key={agent.agentId}
                className={`flex items-center justify-between p-4 ${
                  agent.agentId === user?._id
                    ? "bg-primary-50 dark:bg-primary-900/20"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                      index === 0
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                        : index === 1
                          ? "bg-slate-400 text-white dark:bg-slate-600"
                          : index === 2
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        agent.agentId === user?._id
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {agent.agentName || agent.agentEmail}
                      {agent.agentId === user?._id && " (You)"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {agent.totalQualifications} qualification
                      {agent.totalQualifications !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">
                    Rs {agent.totalEarnings?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rs {agent.averagePerQualification || 0}/qual
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentEarningsDashboard;
