import { Dispatch, SetStateAction } from 'react';

export interface SamplingSectionProps {
  sampler: string;
  setSampler: Dispatch<SetStateAction<string>>;
  scheduler: string;
  setScheduler: Dispatch<SetStateAction<string>>;
  loading: boolean;
} 