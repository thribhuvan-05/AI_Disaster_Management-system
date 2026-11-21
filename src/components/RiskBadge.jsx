import React from 'react';

const RiskBadge = ({ level }) => {
  const upper = (level || 'LOW').toUpperCase();
  
  if (upper === 'CRITICAL') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
        CRITICAL
      </span>
    );
  }
  if (upper === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-orange-500"></span>
        HIGH
      </span>
    );
  }
  if (upper === 'MEDIUM') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-400"></span>
        MEDIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400"></span>
      LOW
    </span>
  );
};

export default RiskBadge;
