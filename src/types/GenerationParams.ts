export interface GenerationParams {
  session_id: string;
  images: number;
  prompt: string;
  model: string;
  width: number;
  height: number;
  sampler: string;
  scheduler: string;
  steps: number;
  cfg_scale: number;
  seed: number;
} 