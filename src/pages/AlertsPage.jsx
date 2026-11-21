import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('CRITICAL');
  const [disasterType, setDisasterType] = useState('Flood');
  const [locationName, setLocationName] = useState('Kanchipuram & Adyar River Basin');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const canBroadcast = user?.role === 'admin' || user?.role === 'coordinator';

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed fetching alerts:", err);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');

    try {
      await api.post('/alerts', {
        title,
        message,
        severity,
        disaster_type: disasterType,
        location_name: locationName
      });

      setSuccess("Alert broadcast created and sent across all operational dashboards!");
      setTitle('');
      setMessage('');
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed creating alert.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-red-600 to-amber-600 rounded-2xl shadow-xl">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Emergency Alert Broadcast Center</h1>
            <p className="text-xs text-slate-400">Issue real-time public emergency warnings & disaster alerts</p>
          </div>
        </div>
      </div>

      {canBroadcast && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Broadcast New Disaster Alert</span>
          </h2>

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Alert Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. FLASH FLOOD WARNING: Kanchipuram Sub-Basin"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Alert Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Disaster Type</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="Flood">Flood</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Wildfire">Wildfire</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Target Location Zone</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase mb-1">Emergency Warning Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                placeholder="Provide evacuation instructions and emergency safety guidelines..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Broadcasting Alert...' : 'Broadcast Emergency Warning'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Broadcast History */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider">Active Broadcasted Alerts Stream</h2>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{a.title}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  {a.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300">{a.message}</p>
              <div className="text-[10px] text-slate-500 font-mono">
                Broadcast Date: {new Date(a.created_at).toLocaleString()} | Location: {a.location_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
