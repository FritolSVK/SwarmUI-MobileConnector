import { API_CONFIG, MODEL_CONFIG, getSwarmPassword } from '../constants/config';
import { GenerationParams, GenerationResponse, SessionResponse } from '../types';

// Update ListImagesResponse to match API docs
interface ListImagesResponse {
  folders: string[];
  files: {
    src: string;
    metadata?: string;
  }[];
}

// Helper to strip leading "raw/" if present
function stripRawPrefix(path: string) {
  return path.startsWith('raw/') ? path.slice(4) : path;
}

// Helper function to create a timeout promise
function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeoutMs);
  });
}

class ApiService {
  private onSessionError?: () => void;
  private requestTimeout = 60000; // 60 seconds timeout for Mac compatibility

  setSessionErrorCallback(callback: () => void) {
    this.onSessionError = callback;
  }

  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      console.log('Making API request to:', url);
      
      // Create a timeout promise
      const timeoutPromise = createTimeoutPromise(this.requestTimeout);
      
      // Create the fetch promise
      const fetchPromise = fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getSwarmPassword(),
          ...options.headers,
        },
        ...options,
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        // Check if this is a session-related error
        if (response.status === 401 || response.status === 403) {
          console.log('Session error detected, marking session as invalid');
          this.onSessionError?.();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      // Handle timeout errors silently
      if (error.message === 'Request timeout') {
        console.log('Request timed out:', url);
        throw new Error('Network request timed out');
      }
      
      // Handle network errors silently
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.log('Network error:', error.message);
        throw new Error('Network connection failed');
      }
      
      console.error('API request failed:', error);
      throw error;
    }
  }

  async createSession(): Promise<string> {
    const response = await this.makeRequest<SessionResponse>(API_CONFIG.SWARM_SESSION_URL, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    if (!response.session_id) {
      throw new Error('No session_id received');
    }

    return response.session_id;
  }

  async listImages(
    path: string = "",
    depth: number = 2,
    sortBy: string = "Name",
    sortReverse: boolean = false,
    sessionId: string = ""
  ): Promise<ListImagesResponse> {
    return await this.makeRequest<ListImagesResponse>(API_CONFIG.SWARM_LIST_IMAGES_URL, {
      method: 'POST',
      body: JSON.stringify({
        path,
        depth,
        sortBy,
        sortReverse,
        session_id: sessionId
      }),
    });
  }

  async generateImage(params: Omit<GenerationParams, 'session_id'> & { sessionId: string }): Promise<string> {
    const generationParams: GenerationParams = {
      session_id: params.sessionId,
      images: params.images,
      prompt: params.prompt,
      model: params.model,
      width: params.width,
      height: params.height,
      sampler: params.sampler,
      scheduler: params.scheduler,
      steps: params.steps,
      cfg_scale: params.cfg_scale,
      seed: params.seed ?? 0,
    };

    const response = await this.makeRequest<GenerationResponse>(API_CONFIG.SWARM_GENERATE_URL, {
      method: 'POST',
      body: JSON.stringify(generationParams),
    });

    if (!response.images || !response.images[0]) {
      throw new Error('No image returned');
    }

    return `${API_CONFIG.SWARM_BASE_URL}/${response.images[0]}`;
  }

  async generateImageWithSession(
    prompt: string,
    sampler: string,
    scheduler: string,
    steps: number,
    cfgScale: number,
    images: number,
    seed: number,
    width: number,
    height: number,
    sessionId: string
  ): Promise<string> {
    const imageUrl = await this.generateImage({
      sessionId,
      images,
      prompt,
      model: MODEL_CONFIG.DEFAULT_MODEL,
      width,
      height,
      sampler,
      scheduler,
      steps,
      cfg_scale: cfgScale,
      seed,
    });
    return imageUrl;
  }

  async fetchImage(filename: string, sessionId?: string): Promise<string> {
    try {
      console.log('Original filename:', filename);
      console.log('Session ID:', sessionId);
      // Use the endpoint from API_CONFIG
      const cleanFilename = stripRawPrefix(filename);
      console.log('Clean filename:', cleanFilename);
      const imageUrl = API_CONFIG.SWARM_IMAGE_FETCH_URL(cleanFilename);
      console.log('Fetching image from:', imageUrl);

      // Create a timeout promise
      const timeoutPromise = createTimeoutPromise(this.requestTimeout);

      // Create the fetch promise
      const fetchPromise = fetch(imageUrl, {
        method: 'GET',
        headers: {
          'X-Password': getSwarmPassword(),
        },
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        // Check if this is a session-related error
        if (response.status === 401 || response.status === 403) {
          console.log('Session error detected in fetchImage, marking session as invalid');
          this.onSessionError?.();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Convert the response to blob and then to base64
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      // Handle timeout errors silently
      if (error.message === 'Request timeout') {
        console.log('Image fetch timed out:', filename);
        throw new Error('Image fetch timed out');
      }
      // Handle network errors silently
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.log('Image fetch network error:', error.message);
        throw new Error('Image fetch network error');
      }
      console.error('Failed to fetch image:', error);
      throw error;
    }
  }

  async restartBackends(): Promise<any> {
    return await this.makeRequest<any>(API_CONFIG.SWARM_RESTART_BACKENDS_URL, {
      method: 'POST',
      body: JSON.stringify({ backend: 'all' }),
    });
  }
}

export const apiService = new ApiService(); 