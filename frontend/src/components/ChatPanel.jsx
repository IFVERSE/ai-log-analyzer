// ChatPanel.jsx
// A chat interface to ask follow-up questions about the analyzed logs

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function ChatPanel({ sessionId }) {
  // State = data that can change and will update the UI when it does
  const [messages, setMessages] = useState([
    // Start with a greeting message from the AI
    { 
      role: "ai", 
      text: "Hi! I've analyzed your logs. Ask me anything about them — I can explain errors, suggest next steps, or help you understand what happened." 
    }
  ]);
  const [input, setInput] = useState("");     // What the user is typing
  const [loading, setLoading] = useState(false); // Whether AI is responding
  
  // This ref lets us scroll to the bottom of the chat automatically
  const bottomRef = useRef(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    // Don't send empty messages or while waiting for a response
    if (!input.trim() || loading) return;
    
    const userText = input.trim();
    setInput(""); // Clear the input field
    
    // Add user's message to the chat
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);
    
    try {
      // Send question to our backend, which sends it to Claude
      const response = await axios.post(
        `http://localhost:8000/api/chat/${sessionId}`,
        { text: userText }
      );
      
      // Add Claude's response to the chat
      setMessages(prev => [...prev, { role: "ai", text: response.data.answer }]);
      
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Sorry, I couldn't process that question. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Allow pressing Enter to send (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      sendMessage();
    }
  };

  return (
    <div className="mt-6 max-w-4xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <h3 className="text-teal-400 font-bold text-lg">💬 Ask About These Logs</h3>
        <p className="text-gray-400 text-sm">Powered by Claude AI</p>
      </div>
      
      {/* Messages Area */}
      <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`
              max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${message.role === "user" 
                ? "bg-teal-700 text-white rounded-br-sm" 
                : "bg-gray-800 text-gray-300 rounded-bl-sm"
              }
            `}>
              {/* Show AI icon for AI messages */}
              {message.role === "ai" && (
                <span className="text-teal-400 font-bold text-xs block mb-1">🤖 Claude</span>
              )}
              {message.text}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
              <span className="text-teal-400 text-sm animate-pulse">Claude is thinking...</span>
            </div>
          </div>
        )}
        
        {/* Invisible element at the bottom for auto-scrolling */}
        <div ref={bottomRef} />
      </div>
      
      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-700 flex gap-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask e.g: Why did the database keep timing out?"
          rows={1}
          className="
            flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 text-sm
            outline-none focus:ring-2 focus:ring-teal-500 resize-none
            placeholder-gray-500
          "
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="
            bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700
            text-white px-5 py-3 rounded-xl font-semibold text-sm
            transition-colors duration-200 flex-shrink-0
          "
        >
          Send
        </button>
      </div>
    </div>
  );
}