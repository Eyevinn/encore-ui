import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeftIcon, PlusIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useCreateJob } from '../hooks/useApi';
import type { EncoreJobRequestBody, Input, InputType } from '../types/api';
import clsx from 'clsx';

interface JobFormData {
  baseName: string;
  externalId?: string;
  profile: string;
  outputFolder: string;
  priority: number;
  progressCallbackUri?: string;
  debugOverlay: boolean;
  seekTo?: number;
  duration?: number;
  thumbnailTime?: number;
  inputs: Input[];
}

const inputTypes: InputType[] = ['AudioVideo', 'Video', 'Audio'];

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const createJobMutation = useCreateJob();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      baseName: '',
      profile: 'program',
      outputFolder: '/usercontent',
      priority: 0,
      debugOverlay: false,
      inputs: [{
        type: 'AudioVideo',
        uri: '',
        params: {},
        copyTs: true,
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inputs',
  });

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    try {
      // Clean up the data before sending
      const jobData: EncoreJobRequestBody = {
        ...data,
        profileParams: {},
        logContext: {},
        inputs: data.inputs.map(input => ({
          ...input,
          params: typeof input.params === 'string' ? JSON.parse(input.params) : input.params,
        })),
      };

      await createJobMutation.mutateAsync(jobData);
      navigate('/jobs');
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addInput = () => {
    append({
      type: 'AudioVideo',
      uri: '',
      params: {},
      copyTs: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/jobs"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Jobs
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Basic Information
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('baseName', { required: 'Base name is required' })}
                  type="text"
                  placeholder="my_video_output"
                  className={clsx(
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
                    errors.baseName 
                      ? 'border-red-300 text-red-900 placeholder-red-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  )}
                />
                {errors.baseName && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  External ID
                </label>
                <input
                  {...register('externalId')}
                  type="text"
                  placeholder="Optional external reference"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Encoding Profile <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('profile', { required: 'Profile is required' })}
                  list="profile-suggestions"
                  placeholder="Enter a profile name"
                  className={clsx(
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
                    errors.profile
                      ? 'border-red-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  )}
                />
                {errors.profile && (
                  <p className="mt-1 text-sm text-red-600">{errors.profile.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter what transcoding profile you want to use
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output Folder <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('outputFolder', { required: 'Output folder is required' })}
                  type="text"
                  placeholder="/path/to/output"
                  className={clsx(
                    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500',
                    errors.outputFolder
                      ? 'border-red-300 text-red-900 placeholder-red-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  )}
                />
                {errors.outputFolder && (
                  <p className="mt-1 text-sm text-red-600">{errors.outputFolder.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority (0-100)
                </label>
                <input
                  {...register('priority', { min: 0, max: 100, valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seek To (seconds)
                </label>
                <input
                  {...register('seekTo', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  {...register('duration', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  placeholder="Auto"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progress Callback URI
                </label>
                <input
                  {...register('progressCallbackUri')}
                  type="url"
                  placeholder="http://example.com/callback"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail Time (seconds)
                </label>
                <input
                  {...register('thumbnailTime', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  placeholder="Auto"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                {...register('debugOverlay')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable debug overlay on video
              </label>
            </div>
          </div>
        </div>

        {/* Input Files */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Input Files
            </h3>
            <button
              type="button"
              onClick={addInput}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Input
            </button>
          </div>
          <div className="p-6 space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    Input {index + 1}
                  </h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Input Type
                    </label>
                    <select
                      {...register(`inputs.${index}.type` as const)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {inputTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URI <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`inputs.${index}.uri` as const, { required: 'URI is required' })}
                      type="text"
                      placeholder="/path/to/input.mp4"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Seek To (seconds)
                    </label>
                    <input
                      {...register(`inputs.${index}.seekTo` as const, { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    {...register(`inputs.${index}.copyTs` as const)}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Copy timestamps
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            to="/jobs"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              'px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            )}
          >
            {isSubmitting ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {createJobMutation.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error creating job
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {createJobMutation.error instanceof Error 
                  ? createJobMutation.error.message 
                  : 'An unexpected error occurred'
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateJob;