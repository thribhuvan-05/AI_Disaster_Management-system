import React, { useState } from 'react';
import api from '../services/api';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

const SeminarScenarioBar = ({ onScenarioLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState('');

  const loadScenario = async (scenarioType) => {
    setLoading(true);
    setActiveScenario(scenarioType);
    try {
      if (scenarioType === 'flood') {
        // Create Critical Kanchipuram Flood Incident
        const incRes = await api.post('/incidents', {
          disaster_type: "Flood",
          description: "SEMINAR DEMO: Torrential monsoon outburst triggered rapid inundation near Adyar River. Water rising 15cm/hr.",
          latitude: 12.8342,
          longitude: 79.7036,
          location_name: "Kanchipuram Sector 4 (Seminar Demo)",
          severity: 5,
          affected_population: 650,
          rainfall: 265.0,
          wind_speed: 55.0,
          water_level: 5.4,
          humidity: 96.0,
          historical_indicator: 0.90
        });

        // Create Broadcast Alert
        await api.post('/alerts', {
          title: "CRITICAL FLOOD EVACUATION: Kanchipuram Basin",
          message: "Water levels at 5.4m exceeding danger mark. Mandatory evacuation in progress.",
          severity: "CRITICAL",
          disaster_type: "Flood",
          location_name: "Kanchipuram"
        });

      } else if (scenarioType === 'cyclone') {
        await api.post('/incidents', {
          disaster_type: "Cyclone",
          description: "SEMINAR DEMO: Category 3 Severe Cyclonic Storm 'Vardah II' making landfall near Marina Coast.",
          latitude: 13.0827,
          longitude: 80.2707,
          location_name: "Chennai Marina Coastline",
          severity: 5,
          affected_population: 1200,
          rainfall: 195.0,
          wind_speed: 145.0,
          water_level: 3.2,
          humidity: 94.0,
          historical_indicator: 0.80
        });

        await api.post('/alerts', {
          title: "SEVERE CYCLONE LANDFALL WARNING: Coastal Tamil Nadu",
          message: "Wind gusts up to 145 km/h. Coastal shelter evacuation active.",
          severity: "CRITICAL",
          disaster_type: "Cyclone",
          location_name: "Chennai Coast"
        });
      }

      if (onScenarioLoaded) onScenarioLoaded();
    } catch (err) {
      console.error("Scenario launch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl shadow-lg">
          <Zap className="w-5 h-5 text-white animate-bounce" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
            <span>Seminar & Presentation Scenario Launcher</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              1-CLICK DEMO MODE
            </span>
          </h3>
          <p className="text-xs text-slate-400">Instantly generate high-impact disaster scenarios with AI risk scoring & live telemetry for seminar presentations.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => loadScenario('flood')}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>🌊 Launch Kanchipuram Flood (Critical)</span>
        </button>

        <button
          onClick={() => loadScenario('cyclone')}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🌀 Launch Chennai Cyclone (Level 5)</span>
        </button>

        {onScenarioLoaded && (
          <button
            onClick={onScenarioLoaded}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
            title="Refresh Operational State"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SeminarScenarioBar;
