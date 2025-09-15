import axios, { type AxiosInstance } from 'axios';
import type {
  EncoreJob,
  EncoreJobRequestBody,
  PagedModelEncoreJob,
  QueueItem,
  JobListParams,
  JobStatus
} from '../types/api';

// Create API client factory function
export const createApiClient = (baseURL: string, bearerToken?: string): AxiosInstance => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (bearerToken && bearerToken.trim()) {
    headers.Authorization = `Bearer ${bearerToken.trim()}`;
  }
  
  return axios.create({
    baseURL,
    headers,
  });
};

// API Client functions factory
export const createEncoreApi = (apiClient: AxiosInstance) => ({
  // Job management
  getJobs: async (params: JobListParams = {}): Promise<PagedModelEncoreJob> => {
    const response = await apiClient.get('/encoreJobs', { params });
    return response.data;
  },

  getJobById: async (id: string): Promise<EncoreJob> => {
    const response = await apiClient.get(`/encoreJobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: EncoreJobRequestBody): Promise<EncoreJob> => {
    const response = await apiClient.post('/encoreJobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: EncoreJobRequestBody): Promise<EncoreJob> => {
    const response = await apiClient.put(`/encoreJobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/encoreJobs/${id}`);
  },

  cancelJob: async (jobId: string): Promise<string> => {
    const response = await apiClient.post(`/encoreJobs/${jobId}/cancel`);
    return response.data;
  },

  // Job search
  getJobsByStatus: async (status: JobStatus, params: JobListParams = {}): Promise<PagedModelEncoreJob> => {
    const response = await apiClient.get('/encoreJobs/search/findByStatus', {
      params: { status, ...params }
    });
    return response.data;
  },

  // Queue management
  getQueue: async (): Promise<QueueItem[]> => {
    const response = await apiClient.get('/queue');
    return response.data;
  },
});

// Error handling wrapper
export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`API Error: ${message}`);
      }
      throw error;
    }
  };
};

// Create safe API functions with error handling
export const createSafeEncoreApi = (baseURL: string, bearerToken?: string) => {
  const apiClient = createApiClient(baseURL, bearerToken);
  const encoreApi = createEncoreApi(apiClient);
  
  return {
    getJobs: withErrorHandling(encoreApi.getJobs),
    getJobById: withErrorHandling(encoreApi.getJobById),
    createJob: withErrorHandling(encoreApi.createJob),
    updateJob: withErrorHandling(encoreApi.updateJob),
    deleteJob: withErrorHandling(encoreApi.deleteJob),
    cancelJob: withErrorHandling(encoreApi.cancelJob),
    getJobsByStatus: withErrorHandling(encoreApi.getJobsByStatus),
    getQueue: withErrorHandling(encoreApi.getQueue),
  };
};