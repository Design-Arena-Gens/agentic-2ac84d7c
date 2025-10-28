'use client';

import { useState } from 'react';
import { useStore, UserRole } from '@/lib/store';
import { User, Mail, Briefcase, Save } from 'lucide-react';

export default function Settings() {
  const { currentUser, setCurrentUser } = useStore();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    role: currentUser?.role || 'artist',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: formData.name,
        email: formData.email,
        role: formData.role as UserRole,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="inline w-4 h-4 mr-1" />
            Account Type
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="artist">Independent Artist</option>
            <option value="label">Record Label</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        <div className="pt-6 border-t">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
          {saved && (
            <p className="mt-2 text-sm text-green-600">Settings saved successfully!</p>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Platform:</strong> Music Distribution Dashboard</p>
          <p className="pt-4 border-t">
            This platform enables artists, labels, and managers to upload music and distribute
            it to major streaming platforms including Spotify, Apple Music, and YouTube Music.
          </p>
        </div>
      </div>
    </div>
  );
}
