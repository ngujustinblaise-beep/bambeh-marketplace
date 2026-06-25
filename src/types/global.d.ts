interface Window {
  Sentry?: {
    captureException: (error: Error) => void;
    captureMessage: (message: string) => void;
  };
}
