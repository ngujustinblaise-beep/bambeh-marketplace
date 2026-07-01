export type NetInterceptorOptions = {
  enabled?: boolean;
  onRequest?: (input: RequestInfo | URL, init?: RequestInit) => void;
  onResponse?: (response: Response) => void;
};

let initialized = false;

export function initNetInterceptor(options: NetInterceptorOptions = {}): void {
  if (initialized || options.enabled === false) return;
  initialized = true;
}

export function isNetInterceptorInitialized(): boolean {
  return initialized;
}
