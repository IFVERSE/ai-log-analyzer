// UploadZone.jsx
// This component handles the drag-and-drop file upload area

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

// This component receives functions from App.js to update shared state
export default function UploadZone({ setAnalysis, setSessionId, setLoading, loading }) {
  
  // This function runs automatically when a file is dropped or selected
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]; // Get the first file
    if (!file) return;
    
    setLoading(true); // Show loading state
    
    // FormData is how you send files over the internet
    const formData = new FormData();
    formData.append("file", file); // Attach the file
    
    try {
      // Send the file to our FastAPI backend
      // axios.post = send data to this URL
      const response = await axios.post(
        "http://localhost:8000/api/analyze", 
        formData
      );
      
      // Update the parent component with the results
      setAnalysis(response.data.analysis);
      setSessionId(response.data.id);
      
    } catch (error) {
      // error.response?.data?.detail gets the error message from FastAPI
      alert("Analysis failed: " + (error.response?.data?.detail || "Unknown error"));
    } finally {
      setLoading(false); // Hide loading state whether success or failure
    }
  }, [setAnalysis, setSessionId, setLoading]);

  // useDropzone gives us props to attach to our div to make it a drop zone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".log", ".txt"] }, // Only accept log/txt files
    maxFiles: 1
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Upload Log File</h2>
      <p className="text-gray-400 mb-6">
        Upload any .log or .txt file and Claude AI will analyze it for errors, 
        root causes, and fixes.
      </p>
      
      {/* The drop zone area - getRootProps makes it respond to drag events */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer 
          transition-all duration-200
          ${isDragActive 
            ? "border-teal-400 bg-teal-950 scale-105" 
            : "border-gray-600 hover:border-teal-500 hover:bg-gray-900"
          }
        `}
      >
        {/* getInputProps makes this hidden input handle file selection */}
        <input {...getInputProps()} />
        
        <div className="text-6xl mb-4">
          {isDragActive ? "📂" : "📁"}
        </div>
        
        {loading ? (
          <div>
            <p className="text-teal-400 text-lg font-semibold animate-pulse">
              🤖 Claude is analyzing your logs...
            </p>
            <p className="text-gray-500 text-sm mt-2">This may take 10-30 seconds</p>
          </div>
        ) : isDragActive ? (
          <p className="text-teal-400 text-lg font-semibold">Drop it here!</p>
        ) : (
          <div>
            <p className="text-white text-lg font-semibold">
              Drag & drop your log file here
            </p>
            <p className="text-gray-400 mt-2">or click to browse files</p>
            <p className="text-gray-600 text-sm mt-4">Supports .log and .txt files</p>
          </div>
        )}
      </div>
    </div>
  );
}