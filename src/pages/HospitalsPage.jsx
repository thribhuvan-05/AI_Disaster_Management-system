import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Hospital as HospitalIcon, Phone, Plus, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'coordinator';

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/hospitals');
      setHospitals(res.data);
    } catch (err) {
      console.error("Failed fetching hospitals:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <HospitalIcon className="w-6 h-6 text-purple-400" />
            <span>Emergency Medical Facilities & Trauma Centers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time emergency bed capacity, trauma unit readiness, and medical facility directory.
          </p>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hospitals.map((h) => (
          <div key={h.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">{h.name}</h3>
                <p className="text-xs text-slate-400">📍 {h.location_name}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {h.facility_type}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Beds Available:</span>
                <span className="font-extrabold text-purple-300">{h.available_beds} / {h.emergency_capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Hotline:</span>
                <span className="font-mono text-slate-200">{h.contact_number || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Operational Status:</span>
              <span className="font-bold text-emerald-400 uppercase">{h.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalsPage;
