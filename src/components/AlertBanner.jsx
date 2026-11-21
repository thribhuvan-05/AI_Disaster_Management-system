import React from 'react';
import { Bell, AlertTriangle } from 'lucide-react';

const AlertBanner = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) return null;
  const activeAlert = alerts[0];

  return (
    <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border-b border-red-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-red-100 shadow-md">
      <div className="flex items-center space-x-3">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <div className="flex items-center space-x-2">
          <span className="font-extrabold uppercase text-red-300 tracking-wider">
            [{activeAlert.severity} ALERT] {activeAlert.title}:
          </span>
          <span className="text-red-200">{activeAlert.message}</span>
        </div>
      </div>
      <span className="text-[10px] text-red-400 font-mono hidden md:block">
        Location: {activeAlert.location_name || 'Regional Zone'}
      </span>
    </div>
  );
};

export default AlertBanner;
