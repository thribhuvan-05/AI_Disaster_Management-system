import React, { useState, useEffect } from 'react';
import api from '../services/api';
import IncidentMap from '../components/IncidentMap';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import AlertBanner from '../components/AlertBanner';
import { Radio, AlertTriangle, ShieldCheck, Home, Hospital as HospitalIcon, Activity } from 'lucide-react';

const CoordinatorDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoordinatorData();
  }, []);

  const fetchCoordinatorData = async () => {
    try {
      const [sumRes, incRes, shelterRes, hospRes, alertRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/incidents'),
        api.get('/shelters'),
        api.get('/hospitals'),
        api.get('/alerts')
      ]);

      setSummary(sumRes.data);
      setIncidents(incRes.data);
      setShelters(shelterRes.data);
      setHospitals(hospRes.data);
      setAlerts(alertRes.data);
    } catch (err) {
      console.error("Failed fetching coordinator room data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return <div className="text-center p-12 text-slate-400 font-semibold">Loading Situation Room Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alert Stream Ticker */}
      <AlertBanner alerts={alerts} />

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl">
            <Radio className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Emergency Coordinator Situation Room</h1>
            <p className="text-xs text-slate-400">Executive Strategic Command & Multi-Agency Resource Coordination</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
          State: OPERATIONAL
        </span>
      </div>

      {/* Strategic Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Disasters" value={summary.active_incidents} icon={AlertTriangle} color="red" />
        <StatCard title="Active Rescue Missions" value={summary.active_rescues} icon={ShieldCheck} color="amber" />
        <StatCard title="Available Shelters Capacity" value={summary.available_shelter_capacity} icon={Home} color="emerald" />
        <StatCard title="Available Emergency Beds" value={summary.available_hospital_beds} icon={HospitalIcon} color="purple" />
      </div>

      {/* Tactical Map */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Multi-Agency Operational Situation Map</span>
        </h2>
        <IncidentMap incidents={incidents} shelters={shelters} hospitals={hospitals} height="420px" />
      </div>

      {/* High-Risk Incident Situation Summary */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-white">Critical & High-Risk Operational Pipeline</h2>
        <div className="space-y-3">
          {incidents.slice(0, 5).map((inc) => (
            <div key={inc.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white">#{inc.id} {inc.disaster_type}</span>
                  <RiskBadge level={inc.risk_level} />
                  <StatusBadge status={inc.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{inc.location_name} — Affected Citizens: {inc.affected_population}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-red-400">Priority: {inc.priority_score} / 100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
