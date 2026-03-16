import { AlertCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className={`w-6 h-6 ${danger ? 'text-rose-500' : 'text-amber-500'}`} />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-slate-300 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              danger 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
