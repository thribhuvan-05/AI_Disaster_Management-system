import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Home, Users, Plus, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SheltersPage = () => {
  const [shelters, setShelters] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Allocate Modal state
  const [allocatingShelter, setAllocatingShelter] = useState(null);
  const [peopleCount, setPeopleCount] = useState(25);
  const [allocating, setAllocating] = useState(false);
  const [allocSuccess, setAllocSuccess] = useState('');

  // Create Shelter Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newLat, setNewLat] = useState(12.8342);
  const [newLon, setNewLon] = useState(79.7036);
  const [newCapacity, setNewCapacity] = useState(500);

  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'coordinator';

  useEffect(() => {
    fetchShelters();
  }, []);

  const fetchShelters = async () => {
    try {
      const res = await api.get('/shelters');
      setShelters(res.data);
    } catch (err) {
      console.error("Failed fetching shelters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocatingShelter) return;
    setAllocating(true);
    setAllocSuccess('');

    try {
      const res = await api.post(`/shelters/${allocatingShelter.id}/allocate`, {
        people_count: parseInt(peopleCount)
      });
      setAllocSuccess(`Successfully allocated ${peopleCount} citizens! Remaining capacity: ${res.data.available_capacity}`);
      setTimeout(() => {
        setAllocatingShelter(null);
        setAllocSuccess('');
        fetchShelters();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.detail || "Capacity allocation failed.");
    } finally {
      setAllocating(false);
    }
  };

  const handleCreateShelter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shelters', {
        name: newName,
        location_name: newLoc,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLon),
        capacity: parseInt(newCapacity),
        contact_person: "Facility Manager",
        contact_number: "+91-9876599999"
      });
      setShowCreateModal(false);
      setNewName('');
      setNewLoc('');
      fetchShelters();
    } catch (err) {
      alert(err.response?.data?.detail || "Shelter creation failed.");
    }
  };

  const filteredShelters = shelters.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <Home className="w-6 h-6 text-blue-400" />
            <span>Emergency Shelter Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time occupancy tracking, capacity allocation, and relief accommodation directory.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Shelter</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find shelters by name or location (e.g. Kanchipuram, Chennai)..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredShelters.map((s) => {
          const occPercentage = Math.round((s.current_occupancy / s.capacity) * 100);
          return (
            <div key={s.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">{s.name}</h3>
                  <p className="text-xs text-slate-400">📍 {s.location_name}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  s.status === 'full'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {s.status}
                </span>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>Occupancy: {s.current_occupancy} / {s.capacity}</span>
                  <span className="text-blue-400">{occPercentage}% Full</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      occPercentage > 90 ? 'bg-red-500' : occPercentage > 70 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, occPercentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                <span>Available Beds: <strong className="text-emerald-400 font-extrabold">{s.available_capacity}</strong></span>
                <button
                  onClick={() => setAllocatingShelter(s)}
                  disabled={s.available_capacity === 0}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-[11px] transition shadow"
                >
                  Allocate People
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ALLOCATE CAPACITY MODAL */}
      {allocatingShelter && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-blue-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">
                Allocate Citizens to {allocatingShelter.name}
              </h3>
              <button onClick={() => setAllocatingShelter(null)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
            </div>

            {allocSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{allocSuccess}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 text-slate-300">
              <p>Total Capacity: <strong>{allocatingShelter.capacity}</strong></p>
              <p>Current Occupancy: <strong>{allocatingShelter.current_occupancy}</strong></p>
              <p>Available Capacity: <strong className="text-emerald-400">{allocatingShelter.available_capacity}</strong></p>
            </div>

            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Number of Evacuated Citizens to Admit
                </label>
                <input
                  type="number"
                  min="1"
                  max={allocatingShelter.available_capacity}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setAllocatingShelter(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocating}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow"
                >
                  {allocating ? 'Updating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SHELTER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Register Emergency Relief Shelter</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateShelter} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Shelter Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="e.g. Kanchipuram North Relief Center"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Location Region</label>
                <input
                  type="text"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  required
                  placeholder="e.g. Kanchipuram"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newLon}
                    onChange={(e) => setNewLon(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Total Capacity</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow mt-2"
              >
                Register Shelter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheltersPage;
