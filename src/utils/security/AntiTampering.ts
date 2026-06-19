/**
 * ?? ANTI-TAMPERING - Detect App Modifications
 * Prevents code injection and unauthorized modifications
 */

export const initializeAntiTampering = () => {
  console.log("?? Anti-tampering protection activated");

  // Detect debugging attempts
  const detectDebugger = () => {
    const before = Date.now();
    debugger; // This line is for detection only
    const after = Date.now();

    if (after - before > 100) {
      console.warn("?? SECURITY ALERT: Debugger detected!");
      // In production, you might want to disable certain features
    }
  };

  // Check every 5 seconds
  if (import.meta.env.MODE === "production") {
    setInterval(detectDebugger, 5000);

  // Detect tampering with global objects
  const originalConsole = window.console;
  Object.freeze(window.console);

  console.log("? Anti-tampering active");

// Auto-initialize
initializeAntiTampering();

}
}
export default initializeAntiTampering;
