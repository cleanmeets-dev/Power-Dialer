import { Upload } from "lucide-react";
import { uploadLeads } from "../services/api";

export default function FileUpload({
  campaignId,
  isLoading,
  onSuccess,
  onError,
  onLeadsChange,
  onUploadComplete,
}) {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!campaignId) {
      onError("Please select a campaign first");
      return;
    }

    try {
      const response = await uploadLeads(file, campaignId);
      onSuccess(`${file.name} uploaded successfully`);
      
      // Try to get leads count from response
      if (onLeadsChange) {
        if (response?.leadsCount) {
          onLeadsChange(response.leadsCount);
        } else if (response?.count) {
          onLeadsChange(response.count);
        }
      }
      
      // Notify parent to refresh leads count
      onUploadComplete?.();
      
      e.target.value = ""; // Reset input
    } catch (error) {
      onError(error.response?.data?.error || "Failed to upload leads");
      console.error(error);
    }
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-primary-500">Upload Leads</h2>

      {/* CSV Format Help */}
      <div className="mb-4 p-3 bg-slate-900/50 border border-slate-600 rounded text-xs text-slate-300">
        <p className="font-semibold text-slate-200 mb-2">
          CSV Format Required:
        </p>
        <p className="font-mono text-slate-400 overflow-x-auto">
          phoneNumber,businessName,businessAddress,city,state,country,email
        </p>
      </div>

      <div className="border-2 border-dashed border-primary-500 rounded-lg p-8 text-center bg-slate-900/50 hover:bg-slate-900 transition cursor-pointer relative group">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={!campaignId || isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <Upload className="w-12 h-12 text-primary-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-slate-100 font-semibold">
          Drag and drop your CSV file
        </p>
        <p className="text-slate-400 text-sm">or click to select</p>
        {isLoading && (
          <p className="text-primary-500 text-xs mt-2">Uploading...</p>
        )}
      </div>

      {!campaignId && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
          <p className="text-yellow-400 text-sm">Select a campaign first</p>
        </div>
      )}
    </div>
  );
}
