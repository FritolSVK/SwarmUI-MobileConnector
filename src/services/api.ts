import { API_CONFIG, MODEL_CONFIG } from '../constants/config';
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

class ApiService {
  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
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

  async fetchImage(filename: string, sessionId: string = ""): Promise<string> {
    try {
      // Use the correct URL pattern: /View/local/raw/{filename}
      const cleanFilename = stripRawPrefix(filename);
      const imageUrl = `${API_CONFIG.SWARM_BASE_URL}/View/local/raw/${encodeURIComponent(cleanFilename)}`;
      
      const response = await fetch(imageUrl, {
        method: 'GET',
      });

      if (!response.ok) {
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
    } catch (error) {
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