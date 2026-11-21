import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  MapPin,
  Home,
  Hospital as HospitalIcon,
  ShieldCheck,
  Bell,
  Bot,
  BarChart3,
  Users,
  Radio
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  const navByRole = {
    citizen: [
      { to: '/citizen', label: 'Overview', icon: LayoutDashboard },
      { to: '/citizen/report', label: 'Report Incident', icon: FilePlus },
      { to: '/citizen/shelters', label: 'Shelters & Hospitals', icon: Home },
      { to: '/assistant', label: 'AI Assistant', icon: Bot },
    ],
    admin: [
      { to: '/admin', label: 'Command Center', icon: LayoutDashboard },
      { to: '/admin/incidents', label: 'Incidents & AI Risk', icon: MapPin },
      { to: '/admin/dispatch', label: 'Rescue Dispatch', icon: Users },
      { to: '/admin/shelters', label: 'Shelter Manager', icon: Home },
      { to: '/admin/hospitals', label: 'Emergency Facilities', icon: HospitalIcon },
      { to: '/admin/alerts', label: 'Alert Broadcasts', icon: Bell },
      { to: '/admin/analytics', label: 'Risk Analytics', icon: BarChart3 },
      { to: '/assistant', label: 'AI Assistant', icon: Bot },
    ],
    rescue: [
      { to: '/rescue', label: 'My Rescue Missions', icon: ShieldCheck },
      { to: '/citizen/shelters', label: 'Shelters & Hospitals', icon: Home },
      { to: '/assistant', label: 'AI Assistant', icon: Bot },
    ],
    coordinator: [
      { to: '/coordinator', label: 'Situation Room', icon: Radio },
      { to: '/admin/incidents', label: 'Incidents', icon: MapPin },
      { to: '/admin/shelters', label: 'Shelters', icon: Home },
      { to: '/admin/hospitals', label: 'Hospitals', icon: HospitalIcon },
      { to: '/admin/alerts', label: 'Alert Broadcasts', icon: Bell },
      { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/assistant', label: 'AI Assistant', icon: Bot },
    ],
  };

  const navItems = navByRole[role] || navByRole.citizen;

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <h2 className="px-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
            {role.toUpperCase()} NAVIGATION
          </h2>
          <div className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-3.5 border border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
          <Radio className="w-4 h-4 animate-pulse" />
          <span>System Status: ACTIVE</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          ML Risk Engine: <span className="text-emerald-400 font-mono">v1.0 Ready</span>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
