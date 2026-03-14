export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-400"></div>
    </div>
  );
}
