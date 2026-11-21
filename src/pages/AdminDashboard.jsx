import React, { useState, useEffect } from 'react';
import api from '../services/api';
import IncidentMap from '../components/IncidentMap';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import SeminarScenarioBar from '../components/SeminarScenarioBar';
import TelemetryWidget from '../components/TelemetryWidget';
import {
  AlertTriangle,
  ShieldAlert,
  Users,
  Home,
  Hospital as HospitalIcon,
  Activity,
  Send,
  CheckCircle2,
  Bell,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Kanchipuram');
  const [loading, setLoading] = useState(true);

  // Dispatch Drawer Modal state
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedShelterId, setSelectedShelterId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState('');

  // AI Explanation Modal state
  const [explanationModalInc, setExplanationModalInc] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [sumRes, incRes, shelterRes, hospRes, teamRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/incidents'),
        api.get('/shelters'),
        api.get('/hospitals'),
        api.get('/rescue-teams')
      ]);

      setSummary(sumRes.data);
      setIncidents(incRes.data);
      setShelters(shelterRes.data);
      setHospitals(hospRes.data);
      setRescueTeams(teamRes.data);
    } catch (err) {
      console.error("Failed fetching admin dashboard data:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncident || !selectedTeamId) return;

    setDispatching(true);
    setDispatchSuccess('');

    try {
      await api.post('/rescue-assignments', {
        incident_id: selectedIncident.id,
        rescue_team_id: parseInt(selectedTeamId),
        target_shelter_id: selectedShelterId ? parseInt(selectedShelterId) : null,
        notes: dispatchNotes || 'Emergency dispatch ordered from Admin Command Center.'
      });

      setDispatchSuccess(`Rescue team assigned successfully to Incident #${selectedIncident.id}!`);
      setTimeout(() => {
        setSelectedIncident(null);
        setDispatchSuccess('');
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.detail || "Dispatch assignment failed.");
    } finally {
      setDispatching(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-semibold">
        Loading Operational Command Center...
      </div>
    );
  }

  const availableTeams = rescueTeams.filter(t => t.current_status === 'available');

  return (
    <div className="space-y-6">
      {/* 1-Click Seminar Scenario Launcher */}
      <SeminarScenarioBar onScenarioLoaded={() => fetchDashboardData(true)} />

      {/* Top Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Operational Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              LIVE SYSTEM CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Real-time disaster risk assessment, resource allocation, and rescue dispatching.</p>
        </div>

        <button
          onClick={() => fetchDashboardData(false)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Real-time City Telemetry Feed Widget */}
      <TelemetryWidget
        selectedCity={selectedCity}
        onCitySelect={(cityName) => setSelectedCity(cityName)}
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={summary?.total_incidents || 0}
          icon={AlertTriangle}
          color="blue"
          description={`${summary?.active_incidents || 0} Active`}
        />
        <StatCard
          title="Critical Incidents"
          value={summary?.critical_incidents || 0}
          icon={ShieldAlert}
          color="red"
          description="Requires Immediate Dispatch"
        />
        <StatCard
          title="Available Rescue Teams"
          value={`${summary?.available_rescue_teams || 0} / ${summary?.total_rescue_teams || 0}`}
          icon={Users}
          color="amber"
          description={`${summary?.active_rescues || 0} Active Deployments`}
        />
        <StatCard
          title="Available Shelter Capacity"
          value={summary?.available_shelter_capacity || 0}
          icon={Home}
          color="emerald"
          description={`Across ${summary?.total_shelters || 0} Emergency Shelters`}
        />
      </div>

      {/* Interactive Command Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span>Master Incident & Resource Situation Map</span>
          </h2>
          <span className="text-xs text-slate-400">Click any incident pin to dispatch rescue team</span>
        </div>
        <IncidentMap
          incidents={incidents}
          shelters={shelters}
          hospitals={hospitals}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          onLocationSearch={(placeName) => setSelectedCity(placeName)}
          height="450px"
        />
      </div>

      {/* High-Priority AI Prioritized Incident Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>AI Prioritized Incident Queue</span>
            </h2>
            <p className="text-xs text-slate-400">Sorted by calculated operational priority score (ML Risk + Severity + Exposure)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Disaster Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">AI Priority</th>
                <th className="py-3 px-4">Affected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">#{inc.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">{inc.disaster_type}</td>
                  <td className="py-3.5 px-4">{inc.location_name}</td>
                  <td className="py-3.5 px-4">
                    <RiskBadge level={inc.risk_level} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-red-400">{inc.priority_score}</span> / 100
                  </td>
                  <td className="py-3.5 px-4">{inc.affected_population} citizens</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setExplanationModalInc(inc)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition"
                    >
                      AI Insights
                    </button>
                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition shadow-md"
                    >
                      Dispatch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK RESCUE DISPATCH MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-red-500/40 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Rescue Team Dispatch</span>
                <h3 className="text-lg font-extrabold text-white">
                  Incident #{selectedIncident.id} — {selectedIncident.disaster_type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {dispatchSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p><strong>Location:</strong> {selectedIncident.location_name}</p>
              <p><strong>Risk Level:</strong> {selectedIncident.risk_level} (Score: {selectedIncident.risk_score})</p>
              <p><strong>Affected Citizens:</strong> {selectedIncident.affected_population}</p>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Select Available Rescue Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="">-- Choose Rescue Team --</option>
                  {availableTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.team_name} (Leader: {t.leader_name}, Base: {t.location_name})
                    </option>
                  ))}
                </select>
                {availableTeams.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1 font-semibold">
                    Warning: All rescue teams are currently dispatched or busy.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Assign Target Emergency Shelter (Optional)
                </label>
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                >
                  <option value="">-- No Specific Shelter --</option>
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.available_capacity} beds free)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Dispatch Operational Orders / Notes
                </label>
                <textarea
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                  placeholder="Provide immediate deployment guidelines..."
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching || availableTeams.length === 0}
                  className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold transition shadow-lg flex items-center justify-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>{dispatching ? 'Dispatching...' : 'Dispatch Team'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI INSIGHTS & FEATURE EXPLANATION MODAL */}
      {explanationModalInc && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>AI Risk Assessment & Feature Attribution</span>
              </h3>
              <button
                onClick={() => setExplanationModalInc(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span>Disaster: <strong>{explanationModalInc.disaster_type}</strong></span>
                <RiskBadge level={explanationModalInc.risk_level} />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p>Rainfall: <strong>{explanationModalInc.rainfall} mm</strong></p>
                <p>Water Level: <strong>{explanationModalInc.water_level} m</strong></p>
                <p>Wind Speed: <strong>{explanationModalInc.wind_speed} km/h</strong></p>
                <p>Historical Vulnerability Index: <strong>{explanationModalInc.historical_indicator}</strong></p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Contributing Risk Explanations:</span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {explanationModalInc.risk_explanation?.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setExplanationModalInc(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Close Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
