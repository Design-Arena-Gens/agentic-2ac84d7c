'use client';

import { useStore, Release, ReleaseStatus } from '@/lib/store';
import { Search, Download, Edit, Trash2, Music } from 'lucide-react';
import { useState } from 'react';
import { exportToCSV } from '@/lib/utils';
import { format } from 'date-fns';

interface DashboardProps {
  onEditRelease: (release: Release) => void;
}

export default function Dashboard({ onEditRelease }: DashboardProps) {
  const { releases, deleteRelease } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReleaseStatus | 'all'>('all');

  const filteredReleases = releases.filter(release => {
    const matchesSearch =
      release.trackTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      release.primaryArtist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || release.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const exportData = filteredReleases.map(release => ({
      'Track Title': release.trackTitle,
      'Primary Artist': release.primaryArtist,
      'Album': release.albumTitle || 'N/A',
      'Album Type': release.albumType,
      'Status': release.status,
      'ISRC': release.isrc || 'N/A',
      'UPC': release.upc || 'N/A',
      'Genre': release.primaryGenre || 'N/A',
      'Release Date': release.releaseDate || 'N/A',
      'Created': format(release.createdAt, 'yyyy-MM-dd'),
    }));

    exportToCSV(exportData, `releases-${Date.now()}.csv`);
  };

  const getStatusColor = (status: ReleaseStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'under_review': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'distributed': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const stats = {
    total: releases.length,
    draft: releases.filter(r => r.status === 'draft').length,
    underReview: releases.filter(r => r.status === 'under_review').length,
    approved: releases.filter(r => r.status === 'approved').length,
    distributed: releases.filter(r => r.status === 'distributed').length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your music releases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Releases</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{stats.underReview}</div>
          <div className="text-sm text-gray-600">Under Review</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.distributed}</div>
          <div className="text-sm text-gray-600">Distributed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by track or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReleaseStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="distributed">Distributed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Releases List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredReleases.length === 0 ? (
          <div className="p-12 text-center">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No releases found</h3>
            <p className="text-gray-600">Start by uploading your first release</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Album</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReleases.map((release) => (
                <tr key={release.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{release.trackTitle}</div>
                    <div className="text-sm text-gray-500">{release.isrc || 'No ISRC'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {release.primaryArtist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{release.albumTitle || 'N/A'}</div>
                    <div className="text-sm text-gray-500 capitalize">{release.albumType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(release.status)} text-white`}>
                      {release.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(release.createdAt, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditRelease(release)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this release?')) {
                            deleteRelease(release.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
