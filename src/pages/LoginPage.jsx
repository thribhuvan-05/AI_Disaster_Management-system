import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, UserCheck, Shield, Radio, User } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(demoEmail, demoPassword);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.response?.data?.detail || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'rescue') navigate('/rescue');
    else if (role === 'coordinator') navigate('/coordinator');
    else navigate('/citizen');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-red-600 to-amber-600 rounded-2xl shadow-xl shadow-red-950/60 mb-4">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI DISASTER MANAGEMENT</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Multi-Hazard Operational Platform — Sign In</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition"
              placeholder="e.g. admin@disaster.org"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-950/50 transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? <span>Signing In...</span> : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Operational Center</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Role Switcher Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Demo Role Login (1-Click)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('citizen@disaster.org', 'password123')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center space-x-2 text-xs font-semibold text-emerald-400"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => quickLogin('admin@disaster.org', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center space-x-2 text-xs font-semibold text-red-400"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Administrator</span>
            </button>
            <button
              onClick={() => quickLogin('rescue@disaster.org', 'rescue123')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center space-x-2 text-xs font-semibold text-amber-400"
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Rescue Team</span>
            </button>
            <button
              onClick={() => quickLogin('coordinator@disaster.org', 'coordinator123')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center space-x-2 text-xs font-semibold text-purple-400"
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span>Coordinator</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need a citizen account?{' '}
          <button onClick={() => navigate('/register')} className="text-red-400 font-bold hover:underline">
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
