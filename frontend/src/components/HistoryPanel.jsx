// HistoryPanel.jsx
// Shows list of past log analyses

import { useState, useEffect } from "react";
import axios from "axios";

export default function HistoryPanel({ setAnalysis, setSessionId, setActiveTab }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect runs code after the component appears on screen
  // The empty [] means "run this only once when component first loads"
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/history");
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load a past analysis when user clicks on it
  const loadSession = async (sessionId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/history/${sessionId}`);
      setAnalysis(response.data.analysis);
      setSessionId(sessionId);
      setActiveTab("upload"); // Switch back to main view
    } catch (error) {
      alert("Failed to load session");
    }
  };

  if (loading) return <p className="text-gray-400">Loading history...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Analysis History</h2>
      <p className="text-gray-400 mb-6">Your past log analyses</p>
      
      {history.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-4">📭</p>
          <p>No analyses yet. Upload a log file to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => loadSession(item.id)}
              className="
                w-full text-left bg-gray-900 hover:bg-gray-800
                border border-gray-700 hover:border-teal-600
                rounded-xl p-4 transition-all duration-200
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{item.filename}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-teal-400 text-sm">View →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}