import { useState } from 'react';
import { UserPlus, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { signup } from '../services/api';

export default function Signup({ onSignupSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      const response = await signup(email, password, name);

      onSignupSuccess(response);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-8 border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-linear-to-r from-emerald-500 to-cyan-500 p-3 rounded-lg">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Power Dialer
            </h1>
            <p className="text-slate-400">Create your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-linear-to-r from-emerald-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 transition"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or</span>
            </div>
          </div>

          {/* Switch to Login */}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-slate-600 text-slate-300 rounded-lg font-semibold hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50 transition"
          >
            Sign In to Existing Account
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          © 2024 Power Dialer. All rights reserved.
        </p>
      </div>
    </div>
  );
}
