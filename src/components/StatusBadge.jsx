import React from 'react';

const StatusBadge = ({ status }) => {
  const st = (status || 'Reported').trim();
  
  let colors = "bg-slate-700 text-slate-300 border-slate-600";
  if (st === 'Reported') colors = "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (st === 'Assigned') colors = "bg-purple-500/20 text-purple-300 border-purple-500/30";
  if (st === 'En Route') colors = "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
  if (st === 'Arrived') colors = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
  if (st === 'In Progress' || st === 'Rescue In Progress') colors = "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse";
  if (st === 'Completed') colors = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors}`}>
      {st}
    </span>
  );
};

export default StatusBadge;
