import { CheckCircle, AlertCircle } from 'lucide-react';

/**
 * NotificationSystem - Displays success and error notifications
 */
export default function NotificationSystem({ successMessage, errorMessage }) {
  return (
    <>
      {successMessage && (
        <div className="fixed top-20 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-4 bg-rose-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top">
          <AlertCircle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}
    </>
  );
}
