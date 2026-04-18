import { Layers3 } from "lucide-react";
import React from "react";

const SelectCampaignMsg = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
      <Layers3 className="mb-3 h-10 w-10 text-slate-400 dark:text-slate-500" />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Select a Campaign to Begin
      </h2>
      <p className="mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
        Choose a campaign above to view leads
      </p>
    </div>
  );
};

export default SelectCampaignMsg;
