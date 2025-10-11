export interface AppConfig {
  backendUrl: string;
  socketUrl: string; 
}
export const __version = '1.0.0';

declare global {
  interface Window {
    __env: AppConfig;
  }
}
