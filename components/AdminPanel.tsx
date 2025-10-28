'use client';

import { useStore, Release, ReleaseStatus } from '@/lib/store';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { exportToCSV, generateISRC } from '@/lib/utils';

export default function AdminPanel() {
  const { releases, updateRelease } = useStore();
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReleaseStatus | 'all'>('under_review');

  const filteredReleases = releases.filter(
    release => statusFilter === 'all' || release.status === statusFilter
  );

  const handleApprove = (release: Release) => {
    updateRelease(release.id, {
      status: 'approved',
      isrc: release.isrc || generateISRC(),
    });
    setSelectedRelease(null);
  };

  const handleReject = (release: Release) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    updateRelease(release.id, {
      status: 'rejected',
      rejectionReason,
    });
    setSelectedRelease(null);
    setRejectionReason('');
  };

  const handleDistribute = (release: Release) => {
    updateRelease(release.id, { status: 'distributed' });
  };

  const handleExport = () => {
    const exportData = filteredReleases.map(release => ({
      'ID': release.id,
      'Track Title': release.trackTitle,
      'Primary Artist': release.primaryArtist,
      'Album': release.albumTitle || 'N/A',
      'Album Type': release.albumType,
      'Status': release.status,
      'ISRC': release.isrc || 'N/A',
      'UPC': release.upc || 'N/A',
      'Genre': release.primaryGenre || 'N/A',
      'Language': release.language || 'N/A',
      'Release Date': release.releaseDate || 'N/A',
      'Label': release.labelName || 'N/A',
      'Explicit': release.isExplicit ? 'Yes' : 'No',
      'Territories': release.territories || 'N/A',
      'Created': format(release.createdAt, 'yyyy-MM-dd HH:mm'),
      'Updated': format(release.updatedAt, 'yyyy-MM-dd HH:mm'),
      'Rejection Reason': release.rejectionReason || 'N/A',
    }));

    exportToCSV(exportData, `admin-releases-${Date.now()}.csv`);
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
    pending: releases.filter(r => r.status === 'under_review').length,
    approved: releases.filter(r => r.status === 'approved').length,
    rejected: releases.filter(r => r.status === 'rejected').length,
    distributed: releases.filter(r => r.status === 'distributed').length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Review and manage submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.distributed}</div>
              <div className="text-sm text-gray-600">Distributed</div>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReleaseStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="distributed">Distributed</option>
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
      <div className="grid grid-cols-1 gap-6">
        {filteredReleases.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600">No releases found</p>
          </div>
        ) : (
          filteredReleases.map((release) => (
            <div key={release.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{release.trackTitle}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(release.status)} text-white`}>
                      {release.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600">{release.primaryArtist}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Submitted: {format(release.createdAt, 'MMM dd, yyyy')}</p>
                  <p>Updated: {format(release.updatedAt, 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Album:</span>
                  <p className="font-medium">{release.albumTitle}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Type:</span>
                  <p className="font-medium capitalize">{release.albumType}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Genre:</span>
                  <p className="font-medium">{release.primaryGenre || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Language:</span>
                  <p className="font-medium">{release.language || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">ISRC:</span>
                  <p className="font-medium">{release.isrc || 'Not assigned'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">UPC:</span>
                  <p className="font-medium">{release.upc || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Release Date:</span>
                  <p className="font-medium">{release.releaseDate || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Explicit:</span>
                  <p className="font-medium">{release.isExplicit ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {release.composer && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Composer: </span>
                  <span className="font-medium">{release.composer}</span>
                </div>
              )}
              {release.producer && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Producer: </span>
                  <span className="font-medium">{release.producer}</span>
                </div>
              )}

              {release.status === 'rejected' && release.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{release.rejectionReason}</p>
                </div>
              )}

              {selectedRelease?.id === release.id && release.status === 'under_review' && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if rejecting):
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
              )}

              <div className="mt-4 flex space-x-3">
                {release.status === 'under_review' && (
                  <>
                    {selectedRelease?.id === release.id ? (
                      <>
                        <button
                          onClick={() => handleApprove(release)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(release)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Confirm Reject</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRelease(null);
                            setRejectionReason('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedRelease(release)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Review Release
                      </button>
                    )}
                  </>
                )}
                {release.status === 'approved' && (
                  <button
                    onClick={() => handleDistribute(release)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Distributed</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
