
export interface VideoGenerationState {
  status: 'idle' | 'uploading' | 'generating' | 'polling' | 'completed' | 'error';
  progressMessage: string;
  videoUrl?: string;
  error?: string;
}

export interface ImagePreview {
  file: File;
  base64: string;
  previewUrl: string;
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16'
}

export enum Resolution {
  R720P = '720p',
  R1080P = '1080p'
}
