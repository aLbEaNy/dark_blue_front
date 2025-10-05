export interface AppConfig {
  backendUrl: string;
  socketUrl: string;
}

declare global {
  interface Window {
    __env: AppConfig;
  }
}
