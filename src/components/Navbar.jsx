import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, User, Sparkles, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleBadges = {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    citizen: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rescue: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    coordinator: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between shadow-xl">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="p-2 bg-gradient-to-br from-red-600 to-amber-600 rounded-xl shadow-lg shadow-red-900/30">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              RESQUE AI
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              DISASTER HQ
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Multi-Hazard Emergency Risk & Response System</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Synthetic Data Label Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Prototype — Synthetic/Demo Data</span>
        </div>

        {user ? (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user.full_name}</div>
              <div className="text-[10px] font-mono text-slate-400">{user.email}</div>
            </div>
            
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${roleBadges[user.role] || roleBadges.citizen}`}>
              {user.role}
            </span>

            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-900/40"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
