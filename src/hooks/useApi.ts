import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSafeEncoreApi } from '../lib/api';
import { useConfig } from './useConfig';
import type {
  EncoreJobRequestBody,
  JobListParams,
  JobStatus,
  EncoreJob
} from '../types/api';

// Hook to get the configured API client
const useApiClient = () => {
  const { config } = useConfig();
  return createSafeEncoreApi(config.encoreApiUrl, config.bearerToken);
};

// Query keys
export const queryKeys = {
  jobs: (params?: JobListParams) => ['jobs', params] as const,
  job: (id: string) => ['job', id] as const,
  jobsByStatus: (status: JobStatus, params?: JobListParams) => 
    ['jobs', 'by-status', status, params] as const,
  queue: () => ['queue'] as const,
};

// Custom hooks for job management
export const useJobs = (params?: JobListParams) => {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: queryKeys.jobs(params),
    queryFn: () => apiClient.getJobs(params),
    staleTime: 30000, // 30 seconds
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

export const useJob = (id: string) => {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => apiClient.getJobById(id),
    enabled: !!id,
    staleTime: 10000, // 10 seconds
    refetchInterval: 2000, // Refetch every 2 seconds for progress updates
  });
};

export const useJobsByStatus = (status: JobStatus, params?: JobListParams) => {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: queryKeys.jobsByStatus(status, params),
    queryFn: () => apiClient.getJobsByStatus(status, params),
    staleTime: 30000,
    refetchInterval: 5000,
  });
};

export const useQueue = () => {
  const apiClient = useApiClient();
  
  return useQuery({
    queryKey: queryKeys.queue(),
    queryFn: apiClient.getQueue,
    staleTime: 10000,
    refetchInterval: 3000, // Refetch every 3 seconds
  });
};

// Mutations for job operations
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: (jobData: EncoreJobRequestBody) => apiClient.createJob(jobData),
    onSuccess: () => {
      // Invalidate and refetch job lists
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: ({ id, jobData }: { id: string; jobData: EncoreJobRequestBody }) =>
      apiClient.updateJob(id, jobData),
    onSuccess: (data, variables) => {
      // Update the specific job in cache
      queryClient.setQueryData(queryKeys.job(variables.id), data);
      // Invalidate job lists
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteJob(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.job(id) });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useCancelJob = () => {
  const queryClient = useQueryClient();
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: (jobId: string) => apiClient.cancelJob(jobId),
    onSuccess: (_, jobId) => {
      // Invalidate the specific job and job lists
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
  });
};

// Utility hooks
export const useJobStatusCounts = () => {
  const { data: allJobs, ...query } = useJobs();
  
  const counts = {
    total: allJobs?.page?.totalElements || 0,
    new: 0,
    queued: 0,
    inProgress: 0,
    successful: 0,
    failed: 0,
    cancelled: 0,
  };

  if (allJobs?.page?.totalElements === 0) {
    return { counts, ...query };
  }

  // Note: This is a simplified approach. For better performance with large datasets,
  // you might want to implement server-side aggregation or separate endpoints
  allJobs?._embedded?.encoreJobs?.forEach((job: EncoreJob) => {
    switch (job.status) {
      case 'NEW':
        counts.new++;
        break;
      case 'QUEUED':
        counts.queued++;
        break;
      case 'IN_PROGRESS':
        counts.inProgress++;
        break;
      case 'SUCCESSFUL':
        counts.successful++;
        break;
      case 'FAILED':
        counts.failed++;
        break;
      case 'CANCELLED':
        counts.cancelled++;
        break;
    }
  });

  return { counts, ...query };
};