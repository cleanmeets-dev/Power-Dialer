import { useEffect, useMemo, useState, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import { getCampaigns } from "../services/api";
  import LoadingSpinner from "./LoadingSpinner";

export default function SmartCampaignSelector({
  value,
  onChange,
  pipelineType = "caller",
  childDialerType = null,
  childOnly = false,
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Load campaigns
  useEffect(() => {
    const load = async () => {
      const data = await getCampaigns();
      const roots = Array.isArray(data) ? data : data?.data || [];

      const filtered = roots
        .filter((r) => r.pipelineType === pipelineType)
        .map((root) => ({
          ...root,
          children: (root.children || [])
            .filter((c) => {
              if (c.pipelineType !== pipelineType) return false;
              if (!childDialerType) return true;
              return c.dialerType === childDialerType;
            })
            .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter((root) => (childOnly ? root.children.length > 0 : true));

      setCampaigns(filtered);
    };

    load();
  }, [pipelineType, childDialerType, childOnly]);

  // Filter campaigns by search term
  const filtered = useMemo(() => {
    if (!search.trim()) return campaigns;

    const term = search.toLowerCase();

    return campaigns
      .map((root) => {
        const rootMatch = root.name.toLowerCase().includes(term);
        const matchedChildren = (root.children || []).filter((c) =>
          c.name.toLowerCase().includes(term)
        );

        if (rootMatch) return root;
        if (matchedChildren.length > 0) {
          return { ...root, children: matchedChildren };
        }

        return null;
      })
      .filter(Boolean);
  }, [search, campaigns]);

  // Get label for selected campaign
  const selectedLabel = useMemo(() => {
    for (const r of campaigns) {
      if (r._id === value) return r.name;

      for (const c of r.children || []) {
        if (c._id === value) return `${r.name} → ${c.name}`;
      }
    }
    return "Select campaign";
  }, [value, campaigns]);

  const handleSelect = (id) => {
    onChange?.(id);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex justify-between items-center px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
      >
        <span className="text-left">{selectedLabel}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Campaign List */}
          <div className="overflow-y-auto flex-1">
            {filtered.length > 0 ? (
              <div className="p-2 space-y-1">
                {filtered.map((root) => (
                  <div key={root._id}>
                    {/* Parent Item */}
                    <button
                      onClick={() => handleSelect(root._id)}
                      className="w-full text-left px-3 py-2.5 font-medium text-slate-900 dark:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {root.name}
                    </button>

                    {/* Child Items */}
                    {(root.children || []).length > 0 && (
                      <div className="pl-2 space-y-0.5">
                        {(root.children || []).map((child) => (
                          <button
                            key={child._id}
                            onClick={() => handleSelect(child._id)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-400 rounded-md hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                          >
                            <span className="text-slate-400 dark:text-slate-600 mr-1">├</span>
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm">No campaigns found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}