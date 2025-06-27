import { Dispatch, SetStateAction } from 'react';

export interface CoreParametersSectionProps {
  steps: number;
  setSteps: Dispatch<SetStateAction<number>>;
  cfgScale: number;
  setCfgScale: Dispatch<SetStateAction<number>>;
  loading: boolean;
  images: number;
  setImages: Dispatch<SetStateAction<number>>;
  seed: number;
  setSeed: Dispatch<SetStateAction<number>>;
  aspectRatio: string;
  setAspectRatio: Dispatch<SetStateAction<string>>;
  width: number;
  height: number;
} 