import React, { useState, useEffect } from 'react';
import api from '../services/api';
import IncidentMap from '../components/IncidentMap';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import TelemetryWidget from '../components/TelemetryWidget';
import { FilePlus, MapPin, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';

const CitizenDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Kanchipuram');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitizenData();
    const interval = setInterval(() => {
      fetchCitizenData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchCitizenData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [incRes, shelterRes, hospRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/shelters'),
        api.get('/hospitals')
      ]);
      setIncidents(incRes.data);
      setShelters(shelterRes.data);
      setHospitals(hospRes.data);
    } catch (err) {
      console.error("Failed loading citizen data", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Citizen Emergency Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              LIVE SENSOR CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Report local disaster incidents, receive instant AI risk evaluations, and track rescue dispatch progress in real-time.
          </p>
        </div>

        <a
          href="/citizen/report"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-red-950/60 transition flex items-center space-x-2 shrink-0"
        >
          <FilePlus className="w-5 h-5" />
          <span>Report New Incident</span>
        </a>
      </div>

      {/* Live Environmental Sensor Telemetry Widget */}
      <TelemetryWidget
        selectedCity={selectedCity}
        onCitySelect={(cityName) => setSelectedCity(cityName)}
      />

      {/* Map Overview */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>Regional Hazard & Relief Shelter Map</span>
        </h2>
        <IncidentMap
          incidents={incidents}
          shelters={shelters}
          hospitals={hospitals}
          onLocationSearch={(placeName) => setSelectedCity(placeName)}
          height="400px"
        />
      </div>

      {/* My Reported Incidents & Tracking */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span>Active Reported Incidents & Rescue Progress Tracking</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Total Reports: {incidents.length}</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No disaster incidents reported yet. Use the "Report New Incident" button to submit a ground report.
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-white text-base">#{inc.id} {inc.disaster_type}</span>
                    <RiskBadge level={inc.risk_level} />
                    <StatusBadge status={inc.status} />
                  </div>
                  <p className="text-xs text-slate-300">{inc.description}</p>
                  <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                    <span><strong>Location:</strong> {inc.location_name}</span>
                    <span><strong>Affected:</strong> {inc.affected_population} people</span>
                    <span><strong>AI Priority:</strong> {inc.priority_score} / 100</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Reported at: {new Date(inc.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
