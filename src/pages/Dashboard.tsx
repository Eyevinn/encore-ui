import React from 'react';
import { Link } from 'react-router-dom';
import { useJobStatusCounts, useQueue } from '../hooks/useApi';
import { PlayIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { counts, isLoading: jobsLoading, error: jobsError } = useJobStatusCounts();
  const { data: queue, isLoading: queueLoading, error: queueError } = useQueue();

  if (jobsError || queueError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800 dark:text-red-200">
            Unable to connect to Encore API. Please check if the service is running.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Welcome to Encore UI
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your video encoding jobs and system status in real-time.
        </p>
      </div>
      
      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jobs</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {jobsLoading ? '...' : counts.total}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
              <p className="text-2xl font-semibold text-blue-600">
                {jobsLoading ? '...' : counts.inProgress}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful</h3>
              <p className="text-2xl font-semibold text-green-600">
                {jobsLoading ? '...' : counts.successful}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</h3>
              <p className="text-2xl font-semibold text-red-600">
                {jobsLoading ? '...' : counts.failed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Queue Status</h3>
              <Link
                to="/queue"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500"
              >
                View All
              </Link>
            </div>
            {queueLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ) : queue && queue.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {queue.length} job(s) in queue
                </p>
                <div className="space-y-1">
                  {queue.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">Job {item.id.slice(0, 8)}</span>
                      <span className="text-gray-500 dark:text-gray-400">Priority: {item.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Queue is empty</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/jobs/new"
                className="block w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create New Job
              </Link>
              <Link
                to="/jobs"
                className="block w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
              >
                View All Jobs
              </Link>
              <Link
                to="/queue"
                className="block w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
              >
                Monitor Queue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;