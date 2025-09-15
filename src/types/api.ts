// API Types based on the OpenAPI specification

export type JobStatus = 
  | 'NEW' 
  | 'QUEUED' 
  | 'IN_PROGRESS' 
  | 'SUCCESSFUL' 
  | 'FAILED' 
  | 'CANCELLED';

export type InputType = 'AudioVideo' | 'Video' | 'Audio';
export type MediaFileType = 'AudioFile' | 'VideoFile' | 'ImageFile' | 'SubtitleFile';

export interface AudioStream {
  format?: string;
  codec?: string;
  duration?: number;
  channels: number;
  channelLayout?: string;
  samplingRate?: number;
  bitrate?: number;
  profile?: string;
}

export interface VideoStream {
  format?: string;
  codec: string;
  profile?: string;
  level?: string;
  width: number;
  height: number;
  sampleAspectRatio?: string;
  displayAspectRatio?: string;
  pixelFormat?: string;
  frameRate: string;
  duration: number;
  bitrate?: number;
  bitDepth?: number;
  numFrames: number;
  isInterlaced: boolean;
  transferCharacteristics?: string;
  codecTagString?: string;
}

export interface MediaFile {
  type: MediaFileType;
  file: string;
  format: string;
  fileSize: number;
}

export interface AudioFile extends MediaFile {
  type: 'AudioFile';
  overallBitrate: number;
  duration: number;
  audioStreams: AudioStream[];
}

export interface VideoFile extends MediaFile {
  type: 'VideoFile';
  overallBitrate: number;
  duration: number;
  videoStreams: VideoStream[];
  audioStreams: AudioStream[];
}

export interface ImageFile extends MediaFile {
  type: 'ImageFile';
  width: number;
  height: number;
}

export interface SubtitleFile extends MediaFile {
  type: 'SubtitleFile';
}

export interface Input {
  type: InputType;
  uri: string;
  params: Record<string, string>;
  analyzed?: AudioFile | VideoFile | ImageFile | SubtitleFile;
  copyTs: boolean;
  accessUri: string;
  seekTo?: number;
}

export interface Link {
  href: string;
  hreflang?: string;
  title?: string;
  type?: string;
  deprecation?: string;
  profile?: string;
  name?: string;
  templated?: boolean;
}

export interface Links {
  [key: string]: Link;
}

export interface EncoreJob {
  id: string;
  externalId?: string;
  profile: string;
  profileParams: Record<string, unknown>;
  outputFolder: string;
  baseName: string;
  createdDate: string;
  progressCallbackUri?: string;
  priority: number;
  segmentLength?: number;
  message?: string;
  progress: number;
  speed?: number;
  startedDate?: string;
  completedDate?: string;
  debugOverlay: boolean;
  logContext: Record<string, string>;
  seekTo?: number;
  duration?: number;
  thumbnailTime?: number;
  inputs: Input[];
  output: MediaFile[];
  status: JobStatus;
  _links?: Links;
}

export interface EncoreJobRequestBody {
  externalId?: string;
  profile: string;
  profileParams?: Record<string, unknown>;
  outputFolder: string;
  baseName: string;
  progressCallbackUri?: string;
  priority?: number;
  segmentLength?: number;
  debugOverlay?: boolean;
  logContext?: Record<string, string>;
  seekTo?: number;
  duration?: number;
  thumbnailTime?: number;
  inputs: Input[];
}

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface PagedModelEncoreJob {
  _embedded: {
    encoreJobs: EncoreJob[];
  };
  _links: Links;
  page: PageMetadata;
}

export interface QueueItem {
  id: string;
  priority: number;
  created: string;
  segment?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Query parameters for job listing
export interface JobListParams {
  page?: number;
  size?: number;
  sort?: string[];
  status?: JobStatus;
}