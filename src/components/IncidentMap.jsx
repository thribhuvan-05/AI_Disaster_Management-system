import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';
import { Search, MapPin, Layers, Activity, CloudRain, Wind, Waves, Thermometer, ShieldAlert, FilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix default Leaflet icon paths in Vite bundle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Markers
const createCustomIcon = (className) => {
  return L.divIcon({
    className: '',
    html: `<div class="${className}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const iconByRisk = {
  CRITICAL: createCustomIcon('custom-marker-critical'),
  HIGH: createCustomIcon('custom-marker-high'),
  MEDIUM: createCustomIcon('custom-marker-medium'),
  LOW: createCustomIcon('custom-marker-low'),
  SHELTER: createCustomIcon('custom-marker-shelter'),
  HOSPITAL: createCustomIcon('custom-marker-hospital'),
  POINTED_LOCATION: createCustomIcon('custom-marker-critical'),
};

// Map Fly-To Helper Component
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

// Map Click Event Listener
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    }
  });
  return null;
};

// Preset Quick Indian Cities
const QUICK_CITIES = [
  { name: 'Kanchipuram', lat: 12.8342, lon: 79.7036, zoom: 12 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, zoom: 11 },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, zoom: 11 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, zoom: 11 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, zoom: 11 },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, zoom: 11 },
];

// Available Map Tile Providers
const TILE_PROVIDERS = {
  street: {
    name: 'OpenStreetMap Standard (Clear Place Names)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  humanitarian: {
    name: 'Humanitarian Relief Map (High Contrast)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
  },
  satellite: {
    name: 'ESRI World Imagery (Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri'
  }
};

const IncidentMap = ({
  incidents = [],
  shelters = [],
  hospitals = [],
  center = [12.9000, 79.9000],
  zoom = 8,
  onSelectIncident,
  onLocationSearch,
  height = '500px'
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [tileKey, setTileKey] = useState('street');

  // Pointed Location Data State
  const [pointedLocation, setPointedLocation] = useState(null);
  const [fetchingPointData, setFetchingPointData] = useState(false);

  const navigate = useNavigate();

  // Load telemetry & place data for any lat/lon point or searched place
  const loadPointLocationData = async (lat, lon, knownName = null) => {
    setFetchingPointData(true);
    let placeName = knownName;

    // Reverse Geocode via OpenStreetMap Nominatim if no name provided
    if (!placeName) {
      try {
        const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const revData = await revRes.json();
        if (revData && revData.display_name) {
          const parts = revData.display_name.split(',');
          placeName = parts.slice(0, 2).join(', ').trim();
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      }
    }

    if (!placeName) placeName = `Point (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;

    // Query backend telemetry for this point
    try {
      const telRes = await api.get(`/telemetry?city=${encodeURIComponent(placeName)}&lat=${lat}&lon=${lon}`);
      const telData = telRes.data;

      // Query AI Risk Engine for this point
      const riskRes = await api.post('/risk/predict', {
        rainfall: telData.rainfall,
        wind_speed: telData.wind_speed,
        water_level: telData.water_level,
        humidity: telData.humidity,
        historical_indicator: 0.6,
        severity: 3,
        affected_population: 150
      });

      setPointedLocation({
        name: placeName,
        lat,
        lon,
        telemetry: telData,
        risk: riskRes.data
      });

      if (onLocationSearch) onLocationSearch(placeName, lat, lon);
    } catch (err) {
      console.error("Point location telemetry fetch failed:", err);
    } finally {
      setFetchingPointData(false);
    }
  };

  // Handle map click
  const handleMapClick = (lat, lon) => {
    setMapCenter([lat, lon]);
    loadPointLocationData(lat, lon);
  };

  // Handle location search submit
  const handleSearchLocation = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const q = searchQuery.toLowerCase().trim();

    // Check Preset dictionary first
    const presetMatch = QUICK_CITIES.find(c => c.name.toLowerCase().includes(q));
    if (presetMatch) {
      setMapCenter([presetMatch.lat, presetMatch.lon]);
      setMapZoom(presetMatch.zoom || 12);
      loadPointLocationData(presetMatch.lat, presetMatch.lon, presetMatch.name);
      setSearching(false);
      return;
    }

    // Query Nominatim Geocoder API
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLon = parseFloat(first.lon);
        const placeName = first.display_name.split(',')[0];
        
        setMapCenter([newLat, newLon]);
        setMapZoom(12);
        loadPointLocationData(newLat, newLon, placeName);
      } else {
        alert(`Location "${searchQuery}" not found. Try another city or landmark name.`);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      alert("Error searching location.");
    } finally {
      setSearching(false);
    }
  };

  const currentTile = TILE_PROVIDERS[tileKey] || TILE_PROVIDERS.street;

  return (
    <div className="w-full space-y-3">
      {/* Map Search Bar & Quick Jump Buttons */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search Input */}
        <form onSubmit={handleSearchLocation} className="flex items-center space-x-2 w-full md:w-1/2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any place in map (e.g. Kanchipuram, Chennai, Visakhapatnam)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition shadow-md"
          >
            {searching ? 'Searching...' : 'Search Place'}
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Jump:</span>
          {QUICK_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setSearchQuery(c.name);
                setMapCenter([c.lat, c.lon]);
                setMapZoom(c.zoom);
                loadPointLocationData(c.lat, c.lon, c.name);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white transition"
            >
              📍 {c.name}
            </button>
          ))}
        </div>

        {/* Tile Layer Switcher */}
        <div className="flex items-center space-x-1 border-l border-slate-800 pl-3">
          <Layers className="w-4 h-4 text-slate-400 mr-1" />
          <select
            value={tileKey}
            onChange={(e) => setTileKey(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-white text-xs py-1.5 px-2 rounded-xl focus:outline-none"
          >
            <option value="street">Street Map (OSM)</option>
            <option value="humanitarian">Humanitarian Map</option>
            <option value="satellite">Satellite View</option>
          </select>
        </div>
      </div>

      {/* Instructions Prompt */}
      <div className="text-xs text-slate-400 flex items-center justify-between px-1">
        <span className="flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Click anywhere on the map or search a location to fetch live environmental telemetry & AI risk data!</span>
        </span>
        {fetchingPointData && (
          <span className="text-amber-400 font-semibold animate-pulse">
            Fetching point telemetry data...
          </span>
        )}
      </div>

      {/* Map Container */}
      <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative" style={{ height }}>
        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="w-full h-full">
          <MapController center={mapCenter} zoom={mapZoom} />
          <MapEventsHandler onMapClick={handleMapClick} />

          <TileLayer
            key={currentTile.url}
            url={currentTile.url}
            attribution={currentTile.attribution}
            maxZoom={19}
          />

          {/* Clicked / Searched Location Marker */}
          {pointedLocation && (
            <Marker position={[pointedLocation.lat, pointedLocation.lon]} icon={iconByRisk.POINTED_LOCATION}>
              <Popup defaultOpen={true}>
                <div className="p-2 min-w-[240px] text-slate-900 text-xs space-y-2">
                  <div className="border-b pb-1">
                    <span className="font-extrabold text-sm text-red-600">📍 {pointedLocation.name}</span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Lat: {pointedLocation.lat.toFixed(4)}° | Lon: {pointedLocation.lon.toFixed(4)}°
                    </p>
                  </div>

                  <div className="space-y-1 text-slate-800">
                    <p>🌧️ Rain Gauge: <strong>{pointedLocation.telemetry.rainfall} mm</strong></p>
                    <p>🌊 River Gauge: <strong>{pointedLocation.telemetry.water_level} m</strong></p>
                    <p>💨 Wind Speed: <strong>{pointedLocation.telemetry.wind_speed} km/h</strong></p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <span>AI Hazard Risk:</span>
                      <RiskBadge level={pointedLocation.risk.risk_level} />
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Incident Markers */}
          {incidents.map((inc) => (
            <Marker
              key={`inc-${inc.id}`}
              position={[inc.latitude, inc.longitude]}
              icon={iconByRisk[inc.risk_level] || iconByRisk.MEDIUM}
            >
              <Tooltip permanent={false} direction="top">
                <span className="font-bold text-xs">{inc.disaster_type}: {inc.location_name} ({inc.risk_level})</span>
              </Tooltip>

              <Popup>
                <div className="p-1.5 min-w-[240px] text-slate-900">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      #{inc.id} {inc.disaster_type}
                    </span>
                    <StatusBadge status={inc.status} />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-800">
                    <p><strong>Location:</strong> {inc.location_name}</p>
                    <p><strong>Affected Citizens:</strong> {inc.affected_population}</p>
                    <p><strong>Rainfall:</strong> {inc.rainfall} mm | <strong>Water Level:</strong> {inc.water_level} m</p>

                    <div className="flex items-center justify-between pt-1">
                      <span>AI Risk Level:</span>
                      <RiskBadge level={inc.risk_level} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 pt-1">
                      <span>Operational Priority:</span>
                      <span className="text-red-600 font-extrabold">{inc.priority_score} / 100</span>
                    </div>
                  </div>

                  {onSelectIncident && (
                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="mt-3 w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow"
                    >
                      View & Dispatch Action
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Shelter Markers */}
          {shelters.map((s) => (
            <Marker
              key={`shelter-${s.id}`}
              position={[s.latitude, s.longitude]}
              icon={iconByRisk.SHELTER}
            >
              <Tooltip direction="top">
                <span className="font-bold text-xs">Shelter: {s.name}</span>
              </Tooltip>

              <Popup>
                <div className="p-1 min-w-[200px] text-slate-900 text-xs">
                  <p className="font-extrabold text-sm text-blue-700">{s.name}</p>
                  <p>Location: {s.location_name}</p>
                  <p>Available Beds: <strong className="text-emerald-600 font-bold">{s.available_capacity}</strong> / {s.capacity}</p>
                  <p>Status: <span className="font-bold uppercase">{s.status}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Hospital Markers */}
          {hospitals.map((h) => (
            <Marker
              key={`hosp-${h.id}`}
              position={[h.latitude, h.longitude]}
              icon={iconByRisk.HOSPITAL}
            >
              <Tooltip direction="top">
                <span className="font-bold text-xs">Hospital: {h.name}</span>
              </Tooltip>

              <Popup>
                <div className="p-1 min-w-[200px] text-slate-900 text-xs">
                  <p className="font-extrabold text-sm text-purple-700">{h.name}</p>
                  <p>Facility: {h.facility_type}</p>
                  <p>Available Emergency Beds: <strong>{h.available_beds}</strong> / {h.emergency_capacity}</p>
                  <p>Contact: {h.contact_number}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* POINTED LOCATION TELEMETRY & RISK CARD */}
      {pointedLocation && (
        <div className="glass-panel p-5 rounded-2xl border border-red-500/40 shadow-2xl space-y-3 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-white">📍 {pointedLocation.name}</span>
                <RiskBadge level={pointedLocation.risk.risk_level} />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Exact Coordinates: Lat {pointedLocation.lat.toFixed(4)}°N, Lon {pointedLocation.lon.toFixed(4)}°E
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-slate-300">AI Risk Score: <strong className="text-red-400">{pointedLocation.risk.risk_score} / 100</strong></span>
              <span className="text-slate-300">Priority Rank: <strong className="text-amber-400">{pointedLocation.risk.priority_score} / 100</strong></span>
            </div>
          </div>

          {/* Telemetry Gauges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Rainfall</span>
              <span className="font-mono font-bold text-blue-400 text-sm">{pointedLocation.telemetry.rainfall} mm</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">River Gauge</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{pointedLocation.telemetry.water_level} m</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Wind Gusts</span>
              <span className="font-mono font-bold text-purple-400 text-sm">{pointedLocation.telemetry.wind_speed} km/h</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Humidity</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{pointedLocation.telemetry.humidity}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Seismic Level</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{pointedLocation.telemetry.seismic} g</span>
            </div>
          </div>

          {/* AI Risk Factor Explanations */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider block">AI Contributing Risk Assessment:</span>
            <ul className="list-disc list-inside text-slate-300 space-y-0.5">
              {pointedLocation.risk.risk_explanation?.map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentMap;
