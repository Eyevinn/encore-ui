import React from 'react';
import { Link } from 'react-router-dom';
import { useQueue, useJobsByStatus } from '../hooks/useApi';
import { 
  ClockIcon, 
  PlayIcon, 
  QueueListIcon, 
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import clsx from 'clsx';

const Queue: React.FC = () => {
  const { data: queue, isLoading: queueLoading, error: queueError } = useQueue();
  const { data: queuedJobs, isLoading: jobsLoading } = useJobsByStatus('QUEUED');
  const { data: inProgressJobs } = useJobsByStatus('IN_PROGRESS');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Queue Management</h2>
        <Link
          to="/jobs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Job to Queue
        </Link>
      </div>

      {/* Error State */}
      {queueError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">
              Unable to load queue data. Please check your connection to the Encore API.
            </span>
          </div>
        </div>
      )}

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <QueueListIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Queue Length</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {queueLoading ? '...' : queue?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Queued Jobs</h3>
              <p className="text-2xl font-semibold text-yellow-600">
                {jobsLoading ? '...' : queuedJobs?._embedded?.encoreJobs?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Processing</h3>
              <p className="text-2xl font-semibold text-green-600">
                {inProgressJobs?._embedded?.encoreJobs?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Queue Items</h3>
        </div>
        
        {queueLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : !queue || queue.length === 0 ? (
          <div className="p-8 text-center">
            <QueueListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Queue is empty. Jobs will appear here when they are submitted for processing.
            </p>
            <Link
              to="/jobs/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Your First Job
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Queue Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Segment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {queue
                  .sort((a, b) => b.priority - a.priority || new Date(a.created).getTime() - new Date(b.created).getTime())
                  .map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/jobs/${item.id}`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
                        >
                          {item.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          item.priority >= 50 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : item.priority >= 25
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        )}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(item.created), 'MMM d, HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.segment ?? '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Currently Processing */}
      {inProgressJobs && inProgressJobs._embedded?.encoreJobs && inProgressJobs._embedded.encoreJobs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Currently Processing</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {inProgressJobs._embedded.encoreJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-4">
                    <PlayIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <Link 
                        to={`/jobs/${job.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {job.baseName}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Profile: {job.profile}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{job.progress}%</p>
                      {job.speed && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{job.speed.toFixed(2)}x</p>
                      )}
                    </div>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Queue;