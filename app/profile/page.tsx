'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Save, Clock, User, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateInactivityTimeout, getInactivityTimeout } = useAuth();
  const router = useRouter();
  const [timeoutMinutes, setTimeoutMinutes] = useState(10);
  const [staySignedIn, setStaySignedIn] = useState(false);

  useEffect(() => {
    // Load current settings
    const currentTimeout = getInactivityTimeout();
    setTimeoutMinutes(currentTimeout);
    
    const savedStaySignedIn = localStorage.getItem('staySignedIn') === 'true';
    setStaySignedIn(savedStaySignedIn);
  }, [getInactivityTimeout]);

  const handleSaveSettings = () => {
    if (timeoutMinutes < 1 || timeoutMinutes > 60) {
      toast.error('Timeout must be between 1 and 60 minutes');
      return;
    }

    updateInactivityTimeout(timeoutMinutes);
    
    if (staySignedIn) {
      localStorage.setItem('staySignedIn', 'true');
    } else {
      localStorage.removeItem('staySignedIn');
    }

    toast.success('Settings saved successfully');
  };

  const presetTimeouts = [5, 10, 15, 30];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-800 transition"
                >
                  <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Information */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                User Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      First Name
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                      {user?.firstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Last Name
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                      {user?.lastName}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <Mail size={16} className="inline mr-1" />
                    Email
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {user?.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Username
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                    {user?.username}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} />
                Security Settings
              </h2>
              
              {/* Stay Signed In */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staySignedIn}
                    onChange={(e) => setStaySignedIn(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-gray-800 font-medium">Stay Signed In</span>
                    <p className="text-sm text-gray-600">
                      Disable auto-logout when this option is enabled
                    </p>
                  </div>
                </label>
              </div>

              {/* Inactivity Timeout */}
              <div className={staySignedIn ? 'opacity-50 pointer-events-none' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Inactivity Timeout (minutes)
                </label>
                
                <div className="flex gap-2 mb-4">
                  {presetTimeouts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTimeoutMinutes(preset)}
                      className={`px-3 py-1 rounded-lg transition ${
                        timeoutMinutes === preset
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={timeoutMinutes}
                    onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 10)}
                    disabled={staySignedIn}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <span className="text-gray-600">minutes of inactivity</span>
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  You will be automatically logged out after {timeoutMinutes} minutes of inactivity.
                  A 60-second warning will appear before logout.
                </p>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">About Auto-Logout</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Activity is tracked by mouse movements, clicks, and keyboard input</li>
              <li>• API calls and form submissions also reset the timer</li>
              <li>• You'll receive a 60-second warning before being logged out</li>
              <li>• During the warning, you can choose to stay logged in or logout immediately</li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
