import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import { FilePlus, Sparkles, Send, MapPin, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: "Kanchipuram, TN", lat: 12.8342, lon: 79.7036 },
  { name: "Chennai Coastal, TN", lat: 13.0827, lon: 80.2707 },
  { name: "Visakhapatnam, AP", lat: 17.6868, lon: 83.2185 },
  { name: "Hyderabad Sector, TS", lat: 17.3850, lon: 78.4867 },
  { name: "Mumbai Coastal, MH", lat: 19.0760, lon: 72.8777 },
];

const CitizenReportPage = () => {
  const [disasterType, setDisasterType] = useState('Flood');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Kanchipuram East Sector');
  const [latitude, setLatitude] = useState(12.8342);
  const [longitude, setLongitude] = useState(79.7036);
  const [severity, setSeverity] = useState(4);
  const [affectedPopulation, setAffectedPopulation] = useState(350);
  
  const [rainfall, setRainfall] = useState(220.0);
  const [windSpeed, setWindSpeed] = useState(45.0);
  const [waterLevel, setWaterLevel] = useState(4.2);
  const [humidity, setHumidity] = useState(92.0);
  const [historicalIndicator, setHistoricalIndicator] = useState(0.85);

  const [aiPreview, setAiPreview] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  // Trigger real-time AI Risk prediction preview
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAiRiskPreview();
    }, 400);
    return () => clearTimeout(timer);
  }, [rainfall, windSpeed, waterLevel, humidity, historicalIndicator, severity, affectedPopulation]);

  const fetchAiRiskPreview = async () => {
    setLoadingAi(true);
    try {
      const res = await api.post('/risk/predict', {
        rainfall: parseFloat(rainfall),
        wind_speed: parseFloat(windSpeed),
        water_level: parseFloat(waterLevel),
        humidity: parseFloat(humidity),
        historical_indicator: parseFloat(historicalIndicator),
        severity: parseInt(severity),
        affected_population: parseInt(affectedPopulation)
      });
      setAiPreview(res.data);
    } catch (err) {
      console.error("AI Preview failed:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const payload = {
        disaster_type: disasterType,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location_name: locationName,
        severity: parseInt(severity),
        affected_population: parseInt(affectedPopulation),
        rainfall: parseFloat(rainfall),
        wind_speed: parseFloat(windSpeed),
        water_level: parseFloat(waterLevel),
        humidity: parseFloat(humidity),
        historical_indicator: parseFloat(historicalIndicator)
      };

      const res = await api.post('/incidents', payload);
      setSuccessMsg(`Incident #${res.data.id} submitted successfully! AI Risk Engine classified level as: ${res.data.risk_level}`);
      setTimeout(() => {
        navigate('/citizen');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed submitting report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/citizen')}
        className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Citizen Portal</span>
      </button>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-red-600 to-amber-600 rounded-xl">
            <FilePlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Report Disaster Incident</h1>
            <p className="text-xs text-slate-400">Provide incident location & environmental parameters for real-time AI Risk Scoring.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Disaster Type & Location Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Disaster Type
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="Flood">Flood</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Landslide">Landslide</option>
                <option value="Wildfire">Wildfire</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Location Name / Landmark
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="e.g. Kanchipuram East Sub-Basin"
              />
            </div>
          </div>

          {/* Preset Location Quick Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Quick Preset Indian Location Coordinates
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_LOCATIONS.map((loc) => (
                <button
                  type="button"
                  key={loc.name}
                  onClick={() => {
                    setLocationName(loc.name);
                    setLatitude(loc.lat);
                    setLongitude(loc.lon);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
                >
                  📍 {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Lat / Lon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Incident Ground Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
              placeholder="Describe situation, structural damage, water levels, or immediate threat..."
            />
          </div>

          {/* Severity & Affected Population */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Severity Rating Level (1 - 5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-xs text-slate-400 font-bold mt-1">
                <span>1 (Minor)</span>
                <span className="text-red-400 font-extrabold text-sm">Level {severity}</span>
                <span>5 (Catastrophic)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Estimated Affected Citizens Count
              </label>
              <input
                type="number"
                min="0"
                value={affectedPopulation}
                onChange={(e) => setAffectedPopulation(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Environmental Parameter Sliders */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Environmental Sensor Data Inputs</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rainfall (mm): <span className="text-red-400 font-bold">{rainfall} mm</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={rainfall}
                  onChange={(e) => setRainfall(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Water Level (m): <span className="text-red-400 font-bold">{waterLevel} m</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wind Speed (km/h): <span className="text-red-400 font-bold">{windSpeed} km/h</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Historical Vulnerability Score (0.0 to 1.0): <span className="text-red-400 font-bold">{historicalIndicator}</span>
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={historicalIndicator}
                  onChange={(e) => setHistoricalIndicator(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* REAL-TIME AI RISK PREVIEW BOX */}
          {aiPreview && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 border border-red-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                  <span className="font-extrabold text-sm text-white uppercase tracking-wider">
                    Real-Time AI Risk Engine Assessment Preview
                  </span>
                </div>
                <RiskBadge level={aiPreview.risk_level} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono pt-1 border-t border-slate-800">
                <div>Risk Score: <span className="text-red-400 font-bold">{aiPreview.risk_score} / 100</span></div>
                <div>Operational Priority: <span className="text-amber-400 font-bold">{aiPreview.priority_score} / 100</span></div>
                <div>Engine Model: <span className="text-emerald-400">RandomForest</span></div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase">AI Contributing Factor Explanations:</span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                  {aiPreview.risk_explanation.map((exp, idx) => (
                    <li key={idx}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-base shadow-xl shadow-red-950/60 transition flex items-center justify-center space-x-2"
          >
            {submitting ? <span>Processing Report & ML Evaluation...</span> : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Ground Disaster Report</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenReportPage;
