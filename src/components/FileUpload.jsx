import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { uploadLeads } from "../services/api";
import { useState, useContext } from "react";
import { LeadsContext } from "../context/LeadsContext";

export default function FileUpload({
  campaignId,
  isLoading,
  onSuccess,
  onError,
  onLeadsChange,
  onUploadComplete,
}) {
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const leadsCtx = useContext(LeadsContext);

  // Validate file before upload
  const validateFile = (file) => {
    setFileError("");

    // Check file exists
    if (!file) {
      setFileError("No file selected");
      return false;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      setFileError("Invalid file type. Only CSV files are allowed.");
      return false;
    }

    // Check file size (5MB = 5242880 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileError(
        `File size (${sizeMB}MB) exceeds maximum limit of 5MB. Please reduce the file size.`
      );
      return false;
    }

    // Check MIME type as secondary validation
    const validMimeTypes = [
      "text/csv",
      "application/csv",
      "text/plain",
      "application/vnd.ms-excel",
    ];
    if (!validMimeTypes.includes(file.type) && file.type !== "") {
      console.warn(`Unusual MIME type: ${file.type}, but proceeding...`);
    }

    return true;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!validateFile(file)) {
      e.target.value = ""; // Reset input
      return;
    }

    if (!campaignId) {
      onError("Please select a campaign first");
      setFileError("Please select a campaign first");
      e.target.value = ""; // Reset input
      return;
    }

    try {
      setUploadProgress(0);
      setFileError("");

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      const response = await uploadLeads(file, campaignId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

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

      // Reload Context leads for LeadsTable rendering
      if (leadsCtx?.loadLeads) {
        leadsCtx.loadLeads();
      }

      // Reset after 1.5 seconds
      setTimeout(() => {
        setUploadProgress(0);
        e.target.value = "";
      }, 1500);
    } catch (error) {
      setUploadProgress(0);
      const errorMsg =
        error.response?.data?.error ||
        "Failed to upload leads. Please check the file format and try again.";
      onError(errorMsg);
      setFileError(errorMsg);
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
        <p className="text-slate-400 mt-2">Max file size: 5MB</p>
      </div>

      {/* File Error Alert */}
      {fileError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{fileError}</p>
        </div>
      )}

      <div className="border-2 border-dashed border-primary-500 rounded-lg p-8 text-center bg-slate-900/50 hover:bg-slate-900 transition cursor-pointer relative group">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={!campaignId || isLoading || uploadProgress > 0}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <Upload className="w-12 h-12 text-primary-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-slate-100 font-semibold">
          Drag and drop your CSV file
        </p>
        <p className="text-slate-400 text-sm">or click to select</p>
        {isLoading || uploadProgress > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-primary-500 text-xs font-semibold">
              {uploadProgress >= 100 ? "Upload Complete!" : "Uploading..."}
            </p>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(uploadProgress, 100)}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs">
              {Math.round(uploadProgress)}%
            </p>
          </div>
        ) : null}
      </div>

      {!campaignId && (
        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-400 text-sm">Select a campaign first</p>
        </div>
      )}
    </div>
  );
}
