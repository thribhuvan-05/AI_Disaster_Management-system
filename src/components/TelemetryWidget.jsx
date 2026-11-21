import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, CloudRain, Wind, Waves, Thermometer, ShieldCheck, MapPin } from 'lucide-react';

const TelemetryWidget = ({ selectedCity = 'Kanchipuram' }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCityTelemetry(selectedCity);
    const interval = setInterval(() => {
      fetchCityTelemetry(selectedCity, true);
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedCity]);

  const fetchCityTelemetry = async (cityQuery, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get(`/telemetry?city=${encodeURIComponent(cityQuery)}`);
      setTelemetry(res.data);
    } catch (err) {
      console.error("Failed loading city telemetry:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  if (!telemetry) {
    return (
      <div className="glass-card rounded-2xl p-5 border border-slate-800 text-slate-400 font-semibold text-xs text-center">
        Connecting to Regional Sensor Telemetry Network...
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
      {/* Telemetry Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-red-500 animate-pulse" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white uppercase tracking-wider">
                Live Regional Environmental Telemetry Feed
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                📍 {telemetry.city_name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Sensor metrics synchronized to map location</p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
          telemetry.status_color === 'red'
            ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
            : telemetry.status_color === 'orange'
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        }`}>
          STATUS: {telemetry.status_level}
        </span>
      </div>

      {/* 5 Environmental Sensor Metrics Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        {/* Rainfall Gauge */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Rain Gauge</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-mono font-extrabold text-xl text-blue-400">
            {telemetry.rainfall} <span className="text-xs font-normal">mm</span>
          </div>
          <div className="text-[10px] text-red-400 font-extrabold">
            {telemetry.rainfall > 200 ? 'Extreme Downpour' : telemetry.rainfall > 100 ? 'Heavy Rainfall' : 'Normal Precipitation'}
          </div>
        </div>

        {/* River Water Level Gauge */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">River Gauge</span>
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono font-extrabold text-xl text-cyan-400">
            {telemetry.water_level} <span className="text-xs font-normal">m</span>
          </div>
          <div className="text-[10px] text-red-400 font-extrabold">
            {telemetry.water_level > 4.5 ? 'Above Danger Mark' : telemetry.water_level > 3.0 ? 'Elevated Level' : 'Normal River Flow'}
          </div>
        </div>

        {/* Wind Speed Anemometer */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Wind Gusts</span>
            <Wind className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-mono font-extrabold text-xl text-purple-400">
            {telemetry.wind_speed} <span className="text-xs font-normal">km/h</span>
          </div>
          <div className="text-[10px] text-amber-400 font-extrabold">
            {telemetry.wind_speed > 100 ? 'Gale Force Storm' : telemetry.wind_speed > 50 ? 'Strong Gusts' : 'Moderate Wind'}
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Humidity</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-extrabold text-xl text-amber-400">
            {telemetry.humidity}%
          </div>
          <div className="text-[10px] text-slate-400 font-bold">
            Atmospheric Saturation
          </div>
        </div>

        {/* Seismic Tremor Sensor */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">Seismic Tremor</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-extrabold text-xl text-emerald-400">
            {telemetry.seismic} <span className="text-xs font-normal">g</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-extrabold">
            Nominal Tremor Level
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryWidget;
