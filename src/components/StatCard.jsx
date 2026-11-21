import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', description }) => {
  const colorStyles = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    red: 'border-red-500/40 text-red-400 bg-red-500/10 animate-pulse',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs font-medium text-slate-400">
          <span className="text-emerald-400 font-semibold mr-1">{trend}</span> vs previous week
        </div>
      )}
    </div>
  );
};

export default StatCard;
