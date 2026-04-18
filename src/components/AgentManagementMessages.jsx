import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      <p className="text-emerald-400">{message}</p>
    </div>
  );
}

export function EditErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="p-4 bg-rose-500/20 border border-rose-500/50 rounded-lg flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-rose-400" />
      <p className="text-rose-400">{error}</p>
    </div>
  );
}
