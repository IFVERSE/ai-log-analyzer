// App.js
// This is the main component - it holds everything together

import { useState } from "react";
import UploadZone from "./components/UploadZone";
import AnalysisPanel from "./components/AnalysisPanel";
import HistoryPanel from "./components/HistoryPanel";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  // useState = variables that update the UI when they change
  const [analysis, setAnalysis] = useState(null);     // The AI's analysis result
  const [sessionId, setSessionId] = useState(null);   // ID of current analysis
  const [loading, setLoading] = useState(false);       // Is analysis running?
  const [activeTab, setActiveTab] = useState("upload"); // Which tab is shown

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      {/* Header Bar */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-lg">
              🔍
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Log Analyzer</h1>
              <p className="text-gray-500 text-xs">Powered by Claude AI</p>
            </div>
          </div>
          
          {/* Status badge */}
          <span className="text-xs bg-teal-900 text-teal-300 px-3 py-1.5 rounded-full border border-teal-700">
            ✅ Backend Connected
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex min-h-[calc(100vh-65px)]">
        
        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-gray-800 p-4 flex flex-col gap-2 pt-6">
          <button
            onClick={() => setActiveTab("upload")}
            className={`
              text-left px-4 py-3 rounded-xl transition-colors duration-200 text-sm
              ${activeTab === "upload" 
                ? "bg-teal-700 text-white font-semibold" 
                : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }
            `}
          >
            📤 Upload Logs
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`
              text-left px-4 py-3 rounded-xl transition-colors duration-200 text-sm
              ${activeTab === "history" 
                ? "bg-teal-700 text-white font-semibold" 
                : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }
            `}
          >
            📋 History
          </button>
          
          {/* Show hint when analysis is ready */}
          {analysis && (
            <div className="mt-4 p-3 bg-green-950 border border-green-800 rounded-xl">
              <p className="text-green-400 text-xs font-semibold">✅ Analysis Ready</p>
              <p className="text-green-600 text-xs mt-1">Scroll down to see results</p>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-auto">
          
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <UploadZone
              setAnalysis={setAnalysis}
              setSessionId={setSessionId}
              setLoading={setLoading}
              loading={loading}
            />
          )}
          
          {/* History Tab */}
          {activeTab === "history" && (
            <HistoryPanel
              setAnalysis={setAnalysis}
              setSessionId={setSessionId}
              setActiveTab={setActiveTab}
            />
          )}
          
          {/* Analysis Results - shown below upload when available */}
          {analysis && activeTab === "upload" && (
            <>
              <AnalysisPanel analysis={analysis} />
              <ChatPanel sessionId={sessionId} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}