// Swarm base URL is now mutable and can be updated at runtime
let swarmBaseUrl = 'http://192.168.1.15:8443';

// Password configuration with default value
let swarmPassword = 'swarmsecure';

export function getSwarmBaseUrl() {
  return swarmBaseUrl;
}

export function setSwarmBaseUrl(url: string) {
  swarmBaseUrl = url;
  updateApiConfig();
}

export function getSwarmPassword() {
  return swarmPassword;
}

export function setSwarmPassword(password: string) {
  swarmPassword = password;
  updateApiConfig();
}

// API_CONFIG is now mutable and updates when the base URL changes
let API_CONFIG = createApiConfig(swarmBaseUrl);

function createApiConfig(baseUrl: string) {
  return {
    SWARM_BASE_URL: baseUrl,
    SWARM_SESSION_URL: `${baseUrl}/api/GetNewSession`,
    SWARM_GENERATE_URL: `${baseUrl}/api/GenerateText2Image`,
    SWARM_LIST_IMAGES_URL: `${baseUrl}/api/ListImages`,
    SWARM_RESTART_BACKENDS_URL: `${baseUrl}/api/RestartBackends`,
    SWARM_IMAGE_FETCH_URL: (filename: string) => `${baseUrl}/View/local/raw/${encodeURIComponent(filename).replace(/%2F/g, '/')}`,
  } as const;
}

function updateApiConfig() {
  API_CONFIG = createApiConfig(swarmBaseUrl);
}

export { API_CONFIG };

export const MODEL_CONFIG = {
  DEFAULT_MODEL: 'cyberrealisticPony_v110',
  DEFAULT_WIDTH: 512,
  DEFAULT_HEIGHT: 768,
} as const;

export const UI_CONFIG = {
  SIDE_PANEL_WIDTH: 280,
  COLLAPSED_PANEL_WIDTH: 36,
  BOTTOM_BAR_HEIGHT: 72,
  ANIMATION_DURATION: 300,
  ZOOM_SCALE: 2,
} as const;

export const THUMBNAIL_CONFIG = {
  SIZE: 128,
  COMPRESSION: 0.7,
  FORMAT: 'JPEG' as const,
} as const;

export const SAMPLER_OPTIONS = [
  { label: 'DPM++ SDE', value: 'dpmpp_sde' },
] as const;

export const SCHEDULER_OPTIONS = [
  { label: 'Karras', value: 'karras' },
] as const;

export const SLIDER_CONFIG = {
  STEPS: {
    MIN: 0,
    MAX: 100,
    STEP: 1,
    DEFAULT: 20,
  },
  CFG_SCALE: {
    MIN: 0,
    MAX: 20,
    STEP: 0.5,
    DEFAULT: 4,
  },
} as const; 