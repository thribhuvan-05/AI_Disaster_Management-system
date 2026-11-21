import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import { ShieldCheck, MapPin, Navigation, CheckCircle, ArrowRight, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';

const RescueTeamDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAssignments();
    const interval = setInterval(() => {
      fetchAssignments(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchAssignments = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/rescue-assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed fetching rescue assignments:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const advanceStatus = async (assignmentId, currentStatus) => {
    const statusFlow = ["Assigned", "En Route", "Arrived", "In Progress", "Completed"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIndex + 1];
    setUpdatingId(assignmentId);

    try {
      await api.put(`/rescue-assignments/${assignmentId}`, {
        status: nextStatus,
        notes: `Rescue team updated status to ${nextStatus}`
      });
      fetchAssignments(true);
    } catch (err) {
      alert(err.response?.data?.detail || "Status update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && assignments.length === 0) {
    return <div className="text-center p-12 text-slate-400 font-semibold">Loading Rescue Missions Queue...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-amber-600 to-red-600 rounded-2xl shadow-xl">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Rescue Team Mission Portal</h1>
            <p className="text-xs text-slate-400">Ground Emergency Operational Stepper & Live Mission Progress Synchronization</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          FIELD STATUS: READY
        </span>
      </div>

      {/* Active Missions Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-amber-500" />
            <span>Assigned Emergency Missions ({assignments.length})</span>
          </h2>

          <button
            onClick={() => fetchAssignments(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Missions</span>
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-slate-800 text-center text-slate-500 text-sm">
            No active rescue missions currently assigned. Standing by for Admin dispatch orders.
          </div>
        ) : (
          assignments.map((asgn) => {
            const inc = asgn.incident || {};
            const statusFlow = ["Assigned", "En Route", "Arrived", "In Progress", "Completed"];
            const currIdx = statusFlow.indexOf(asgn.status);

            return (
              <div key={asgn.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-lg text-white">
                        Mission #{asgn.id} — {inc.disaster_type || 'Disaster Incident'}
                      </span>
                      {inc.risk_level && <RiskBadge level={inc.risk_level} />}
                      <StatusBadge status={asgn.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Location:</strong> {inc.location_name || 'Ground Location'} (Lat: {inc.latitude}, Lon: {inc.longitude})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-amber-400 block">
                      Assigned: {new Date(asgn.assigned_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Incident Details Summary */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>Severity: <strong className="text-red-400">Level {inc.severity}/5</strong></div>
                  <div>Affected Citizens: <strong>{inc.affected_population}</strong></div>
                  <div>AI Priority Score: <strong className="text-red-400">{inc.priority_score} / 100</strong></div>
                  <div>Target Shelter ID: <strong>{asgn.target_shelter_id || 'Nearest Safety Hub'}</strong></div>
                </div>

                <p className="text-xs text-slate-300 italic bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  "{inc.description || 'Emergency disaster response required.'}"
                </p>

                {/* Rescue Status Stepper Buttons */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Advance Field Mission Status:
                  </span>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {statusFlow.map((st, idx) => {
                      const isDone = idx <= currIdx;
                      const isNext = idx === currIdx + 1;

                      return (
                        <button
                          key={st}
                          disabled={!isNext || updatingId === asgn.id}
                          onClick={() => advanceStatus(asgn.id, asgn.status)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isNext
                              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 animate-pulse shadow-lg'
                              : 'bg-slate-900 text-slate-600 border-slate-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {isDone && <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RescueTeamDashboard;
