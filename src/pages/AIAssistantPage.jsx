import React, { useState } from 'react';
import api from '../services/api';
import { Bot, Send, Sparkles, User, Database, MessageSquare } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Which areas currently have critical incidents?",
  "Which shelters have available capacity?",
  "How many rescue teams are available?",
  "Show high-risk incidents.",
  "Which shelter is closest to Kanchipuram?"
];

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am the Data-Grounded AI Disaster Management Assistant. Ask me any natural language question about live database incidents, rescue teams, shelter capacities, or medical facilities.",
      isGrounded: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (questionText) => {
    const q = questionText || input;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/query', { question: q });
      const botMsg = {
        sender: 'bot',
        text: res.data.answer,
        isGrounded: res.data.is_grounded,
        dataContext: res.data.data_context
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Sorry, I encountered an error querying the system database.", isGrounded: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl shadow-xl">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <span>Data-Grounded AI Assistant</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                FACTUAL QUERY ENGINE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Queries system database facts to answer operational disaster questions accurately.</p>
          </div>
        </div>
      </div>

      {/* Suggested Question Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions (1-Click Query):</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 min-h-[420px] flex flex-col justify-between space-y-4 shadow-2xl">
        <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-tr-none font-medium shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {msg.isGrounded && msg.sender === 'bot' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
                    <Database className="w-3 h-3" />
                    <span>Verified against live PostgreSQL/SQLite records</span>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold p-3 bg-slate-900/60 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Querying database records & computing facts...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-3 pt-3 border-t border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question (e.g. 'Show critical incidents' or 'Which shelters have capacity?')..."
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-1"
          >
            <Send className="w-4 h-4" />
            <span>Send Query</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistantPage;
