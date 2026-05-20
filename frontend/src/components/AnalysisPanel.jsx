// AnalysisPanel.jsx
// Displays the AI analysis results in a clean, organized way

// Color coding based on severity level
const SEVERITY_CONFIG = {
  critical: {
    bg: "bg-red-950",
    border: "border-red-700",
    text: "text-red-300",
    badge: "bg-red-700 text-red-100",
    icon: "🔴"
  },
  warning: {
    bg: "bg-yellow-950",
    border: "border-yellow-700", 
    text: "text-yellow-300",
    badge: "bg-yellow-700 text-yellow-100",
    icon: "🟡"
  },
  info: {
    bg: "bg-blue-950",
    border: "border-blue-700",
    text: "text-blue-300",
    badge: "bg-blue-700 text-blue-100",
    icon: "🔵"
  }
};

export default function AnalysisPanel({ analysis }) {
  // Count errors by severity for the summary stats
  const criticalCount = analysis.errors?.filter(e => e.severity === "critical").length || 0;
  const warningCount = analysis.errors?.filter(e => e.severity === "warning").length || 0;
  const infoCount = analysis.errors?.filter(e => e.severity === "info").length || 0;

  return (
    <div className="mt-8 space-y-6 max-w-4xl mx-auto">
      
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-red-300 text-sm">Critical</div>
        </div>
        <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
          <div className="text-yellow-300 text-sm">Warnings</div>
        </div>
        <div className="bg-blue-950 border border-blue-800 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{infoCount}</div>
          <div className="text-blue-300 text-sm">Info</div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-teal-400 font-bold text-lg mb-3">📊 Summary</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Root Cause Card */}
      <div className="bg-red-950 rounded-2xl p-6 border border-red-800">
        <h3 className="text-red-400 font-bold text-lg mb-3">🔍 Root Cause</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.root_cause}</p>
      </div>

      {/* Errors List */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-yellow-400 font-bold text-lg mb-4">
          ⚠️ Errors Found ({analysis.errors?.length || 0})
        </h3>
        
        <div className="space-y-3">
          {analysis.errors?.map((error, index) => {
            // Get the right color config for this severity level
            const config = SEVERITY_CONFIG[error.severity] || SEVERITY_CONFIG.info;
            
            return (
              <div 
                key={index}
                className={`rounded-xl p-4 border ${config.bg} ${config.border}`}
              >
                {/* Error header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span className={`font-mono font-bold ${config.text}`}>
                      {error.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {error.line && (
                      <span className="text-gray-500 text-xs font-mono">
                        Line {error.line}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${config.badge}`}>
                      {error.severity}
                    </span>
                  </div>
                </div>
                
                {/* Error message */}
                <p className="text-gray-300 text-sm">{error.message}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Fixes */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-green-400 font-bold text-lg mb-4">✅ Recommended Fixes</h3>
        <ul className="space-y-3">
          {analysis.recommended_fixes?.map((fix, index) => (
            <li key={index} className="flex gap-3 text-gray-300">
              <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">
                {index + 1}.
              </span>
              <span>{fix}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Patterns */}
      {analysis.patterns?.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-purple-400 font-bold text-lg mb-4">🔁 Patterns Detected</h3>
          <ul className="space-y-2">
            {analysis.patterns?.map((pattern, index) => (
              <li key={index} className="flex gap-3 text-gray-300">
                <span className="text-purple-500 flex-shrink-0">◆</span>
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}