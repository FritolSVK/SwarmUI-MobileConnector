import React, { Dispatch, SetStateAction } from 'react';


export interface PromptInputProps {
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
  onGenerate: () => void;
  loading: boolean;
  generationStatus?: React.ReactNode;
} 