import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../hooks/useApi';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { JobStatus } from '../types/api';
import clsx from 'clsx';

const statusConfig: Record<JobStatus, { icon: React.ElementType; color: string; label: string }> = {
  NEW: { icon: PlayIcon, color: 'text-gray-500', label: 'New' },
  QUEUED: { icon: PauseIcon, color: 'text-yellow-500', label: 'Queued' },
  IN_PROGRESS: { icon: PlayIcon, color: 'text-blue-500', label: 'In Progress' },
  SUCCESSFUL: { icon: CheckCircleIcon, color: 'text-green-500', label: 'Successful' },
  FAILED: { icon: ExclamationCircleIcon, color: 'text-red-500', label: 'Failed' },
  CANCELLED: { icon: XCircleIcon, color: 'text-gray-500', label: 'Cancelled' },
};

const Jobs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  
  const { data, isLoading, error } = useJobs({ 
    page, 
    size: 20, 
    ...(statusFilter !== 'all' && { status: statusFilter })
  });

  const filteredJobs = data?._embedded?.encoreJobs?.filter(job => {
    if (!searchTerm) return true;
    return (
      job.baseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.externalId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Jobs</h2>
        <Link
          to="/jobs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Create Job
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
            className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Failed to load jobs. Please check your connection to the Encore API.
            </p>
          </div>
        ) : !filteredJobs || filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {data?._embedded?.encoreJobs?.length === 0 
                ? 'No jobs found. Create your first encoding job to get started.'
                : 'No jobs match your search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredJobs.map((job) => {
                  const StatusIcon = statusConfig[job.status].icon;
                  return (
                    <tr 
                      key={job.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/jobs/${job.id}`} className="block">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {job.baseName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {job.externalId || job.id.slice(0, 8)}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={clsx('h-5 w-5 mr-2', statusConfig[job.status].color)} />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {statusConfig[job.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={clsx(
                                'h-2 rounded-full',
                                job.status === 'SUCCESSFUL' 
                                  ? 'bg-green-500' 
                                  : job.status === 'FAILED' 
                                    ? 'bg-red-500'
                                    : 'bg-blue-500'
                              )}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">
                            {job.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {job.profile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(job.createdDate), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          job.priority >= 50 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : job.priority >= 25
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        )}>
                          {job.priority}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.page && data.page.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{page * 20 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((page + 1) * 20, data.page.totalElements)}
                </span>{' '}
                of <span className="font-medium">{data.page.totalElements}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.page.totalPages - 1}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;