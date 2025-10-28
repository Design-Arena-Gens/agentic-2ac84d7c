'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import UploadRelease from '@/components/UploadRelease';
import AdminPanel from '@/components/AdminPanel';
import Settings from '@/components/Settings';
import { Release } from '@/lib/store';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setEditingRelease(null);
  };

  const handleEditRelease = (release: Release) => {
    setEditingRelease(release);
    setCurrentPage('upload');
  };

  const handleUploadComplete = () => {
    setEditingRelease(null);
    setCurrentPage('dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'dashboard' && (
          <Dashboard onEditRelease={handleEditRelease} />
        )}
        {currentPage === 'upload' && (
          <UploadRelease
            editingRelease={editingRelease}
            onComplete={handleUploadComplete}
          />
        )}
        {currentPage === 'admin' && <AdminPanel />}
        {currentPage === 'settings' && <Settings />}
      </main>
    </div>
  );
}
