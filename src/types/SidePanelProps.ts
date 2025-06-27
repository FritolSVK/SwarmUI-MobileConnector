import { Dispatch, SetStateAction } from 'react';

export interface SidePanelProps {
  showCoreParams: boolean;
  setShowCoreParams: (value: boolean) => void;
  showSampling: boolean;
  setShowSampling: (value: boolean) => void;
  steps: number;
  setSteps: Dispatch<SetStateAction<number>>;
  cfgScale: number;
  setCfgScale: Dispatch<SetStateAction<number>>;
  loading: boolean;
  sampler: string;
  setSampler: Dispatch<SetStateAction<string>>;
  scheduler: string;
  setScheduler: Dispatch<SetStateAction<string>>;
  showSidePanel: boolean;
  setShowSidePanel: (value: boolean) => void;
  images: number;
  setImages: Dispatch<SetStateAction<number>>;
  seed: number;
  setSeed: Dispatch<SetStateAction<number>>;
  aspectRatio: string;
  setAspectRatio: Dispatch<SetStateAction<string>>;
  width: number;
  height: number;
  showResolution: boolean;
  setShowResolution: (value: boolean) => void;
} 