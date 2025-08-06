import { useCallback, useRef, useState } from 'react';
import { SLIDER_CONFIG } from '../constants/config';
import { useSession } from '../contexts';
import { apiService } from '../services/api';

interface GenerationRequest {
  id: string;
  prompt: string;
  sampler: string;
  scheduler: string;
  steps: number;
  cfgScale: number;
  images: number;
  seed: number;
  width: number;
  height: number;
}

export const useImageGeneration = () => {
  const { sessionId } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>('some prompt');
  const [sampler, setSampler] = useState('dpmpp_sde');
  const [scheduler, setScheduler] = useState('karras');
  const [steps, setSteps] = useState<number>(SLIDER_CONFIG.STEPS.DEFAULT);
  const [cfgScale, setCfgScale] = useState<number>(SLIDER_CONFIG.CFG_SCALE.DEFAULT);
  
  // Track generation queue and status
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingGenerations, setPendingGenerations] = useState<GenerationRequest[]>([]);
  const [completedGenerations, setCompletedGenerations] = useState<GenerationRequest[]>([]);
  const generationQueueRef = useRef<GenerationRequest[]>([]);
  const isProcessingRef = useRef(false);

  const processGenerationQueue = useCallback(async () => {
    if (isProcessingRef.current || generationQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    setIsGenerating(true);

    while (generationQueueRef.current.length > 0) {
      const request = generationQueueRef.current.shift()!;
      
      try {
        setLoading(true);
        
        const imageUrl = await apiService.generateImageWithSession(
          request.prompt,
          request.sampler,
          request.scheduler,
          request.steps,
          request.cfgScale,
          request.images,
          request.seed,
          request.width,
          request.height,
          sessionId!
        );
        
        // For now, use the URL directly since fetching is failing
        // The ImageViewer should be able to handle URLs
        console.log('Using generated image URL directly:', imageUrl);
        setImageUrl(imageUrl);
        setCompletedGenerations(prev => [...prev, { ...request, id: imageUrl }]);
        
        // Remove from pending
        setPendingGenerations(prev => prev.filter(req => req.id !== request.id));
        
      } catch (error: any) {
        // Don't show error alert - just log to console
        if (error.message && (error.message.includes('timeout') || error.message.includes('network'))) {
          console.log('Network/timeout error during image generation:', error.message);
        } else {
          console.log('Image generation failed:', error.message || 'Failed to generate image');
        }
        // Remove failed request from pending
        setPendingGenerations(prev => prev.filter(req => req.id !== request.id));
      } finally {
        setLoading(false);
      }
    }

    isProcessingRef.current = false;
    setIsGenerating(false);
  }, [sessionId]);

  const generateImage = async (options?: Partial<Omit<GenerationRequest, 'id'>>) : Promise<string | null> => {
    if (!sessionId) {
      // Don't show error alert - just log to console
      console.log('No session available for image generation');
      return null;
    }
    
    const requestId = Date.now().toString();
    const request: GenerationRequest = {
      id: requestId,
      prompt,
      sampler,
      scheduler,
      steps,
      cfgScale,
      images: options?.images ?? 1,
      seed: options?.seed ?? 0,
      width: options?.width ?? 512,
      height: options?.height ?? 768,
      ...options,
    };
    
    // Add to queue
    generationQueueRef.current.push(request);
    setPendingGenerations(prev => [...prev, request]);
    
    // Start processing if not already processing
    if (!isProcessingRef.current) {
      processGenerationQueue();
    }
    
    // Return the request ID so caller can track it
    return requestId;
  };

  const resetGeneration = () => {
    setImageUrl(null);
    setPendingGenerations([]);
    setCompletedGenerations([]);
    generationQueueRef.current = [];
    isProcessingRef.current = false;
    setIsGenerating(false);
  };

  const getPendingCount = () => pendingGenerations.length - 1;

  return {
    // State
    imageUrl,
    loading,
    sessionId,
    prompt,
    sampler,
    scheduler,
    steps,
    cfgScale,
    isGenerating,
    pendingGenerations,
    completedGenerations,
    
    // Setters
    setPrompt,
    setSampler,
    setScheduler,
    setSteps,
    setCfgScale,
    
    // Actions
    generateImage,
    resetGeneration,
    getPendingCount,
  };
}; 