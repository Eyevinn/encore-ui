import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJob, useCancelJob } from '../hooks/useApi';
import { 
  ArrowLeftIcon, 
  PlayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { JobStatus } from '../types/api';
import clsx from 'clsx';

const statusConfig: Record<JobStatus, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  NEW: { icon: PlayIcon, color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'New' },
  QUEUED: { icon: ClockIcon, color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Queued' },
  IN_PROGRESS: { icon: PlayIcon, color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'In Progress' },
  SUCCESSFUL: { icon: CheckCircleIcon, color: 'text-green-700', bgColor: 'bg-green-100', label: 'Successful' },
  FAILED: { icon: ExclamationCircleIcon, color: 'text-red-700', bgColor: 'bg-red-100', label: 'Failed' },
  CANCELLED: { icon: XCircleIcon, color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Cancelled' },
};

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id!);
  const cancelJobMutation = useCancelJob();

  if (!id) {
    return <div>Invalid job ID</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/jobs"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/jobs"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-center text-red-800 dark:text-red-200">
            Job not found or failed to load. Please check the job ID and try again.
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[job.status].icon;

  const handleCancelJob = async () => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      try {
        await cancelJobMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to cancel job:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/jobs"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Jobs
          </Link>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          {(job.status === 'NEW' || job.status === 'QUEUED' || job.status === 'IN_PROGRESS') && (
            <button
              onClick={handleCancelJob}
              disabled={cancelJobMutation.isPending}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <StopIcon className="h-4 w-4 mr-1" />
              {cancelJobMutation.isPending ? 'Cancelling...' : 'Cancel Job'}
            </button>
          )}
        </div>
      </div>

      {/* Job Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {job.baseName}
            </h1>
            <div className={clsx(
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              statusConfig[job.status].color,
              statusConfig[job.status].bgColor
            )}>
              <StatusIcon className="h-4 w-4 mr-2" />
              {statusConfig[job.status].label}
            </div>
          </div>
          {job.externalId && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              External ID: {job.externalId}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {job.status === 'IN_PROGRESS' && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            {job.speed && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Encoding speed: {job.speed.toFixed(2)}x
              </p>
            )}
          </div>
        )}

        {/* Job Details Grid */}
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job ID</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{job.id}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.profile}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</dt>
              <dd className="mt-1">
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
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {format(new Date(job.createdDate), 'PPpp')}
              </dd>
            </div>
            
            {job.startedDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Started</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {format(new Date(job.startedDate), 'PPpp')}
                </dd>
              </div>
            )}
            
            {job.completedDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {format(new Date(job.completedDate), 'PPpp')}
                </dd>
              </div>
            )}
            
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Output Folder</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{job.outputFolder}</dd>
            </div>
            
            {job.seekTo && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Seek To</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.seekTo}s</dd>
              </div>
            )}
            
            {job.duration && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.duration}s</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Error Message */}
      {job.message && job.status === 'FAILED' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Job Failed
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {job.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Files */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Input Files</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {job.inputs.map((input, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <DocumentIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Input {index + 1}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {input.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><span className="font-medium">URI:</span> {input.uri}</p>
                      {input.accessUri && (
                        <p><span className="font-medium">Access URI:</span> {input.accessUri}</p>
                      )}
                      {input.seekTo && (
                        <p><span className="font-medium">Seek To:</span> {input.seekTo}s</p>
                      )}
                      <p><span className="font-medium">Copy Timestamps:</span> {input.copyTs ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Output Files */}
      {job.output && job.output.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Output Files</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {job.output.map((output, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <DocumentIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {output.file}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {output.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p><span className="font-medium">Format:</span> {output.format}</p>
                        <p><span className="font-medium">Size:</span> {(output.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Job Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Configuration</h3>
        </div>
        <div className="p-6">
          <dl className="space-y-4">
            {job.debugOverlay && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Debug Overlay</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">Enabled</dd>
              </div>
            )}
            
            {job.progressCallbackUri && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress Callback URI</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{job.progressCallbackUri}</dd>
              </div>
            )}
            
            {job.segmentLength && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Segment Length</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.segmentLength}s</dd>
              </div>
            )}
            
            {job.thumbnailTime && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Thumbnail Time</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{job.thumbnailTime}s</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;