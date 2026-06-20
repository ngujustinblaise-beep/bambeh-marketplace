/**
 * ðŸ”’ SECURITY PROVIDER - Centralized Security Context
 */
import React, { createContext, useContext, useEffect, useState } from "react";

interface SecurityContextType {
  isSecure: boolean;
  threatLevel: "safe" | "warning" | "danger";
  checkSecurity: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined,
);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isSecure, setIsSecure] = useState(true);
  const [threatLevel, setThreatLevel] = useState<"safe" | "warning" | "danger">(
    "safe",
  );

  const checkSecurity = async (): Promise<boolean> => {
    console.log("ðŸ” Running security check...");

    // Perform security checks
    const checks = {
      httpsEnabled: window.location.protocol === "https:",
      secureContext: window.isSecureContext,
      noDebugger: true, // Additional checks here
    };

    const allSecure = Object.values(checks).every((check) => check === true);
    setIsSecure(allSecure);
    setThreatLevel(allSecure ? "safe" : "warning");

    return allSecure;
  };

  useEffect(() => {
    checkSecurity();
  }, []);

  return (
    <SecurityContext.Provider value={{ isSecure, threatLevel, checkSecurity }}>
      {children}
    </SecurityContext.Provider>
  );

}
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error("useSecurity must be used within SecurityProvider");
  return context;
};
}


