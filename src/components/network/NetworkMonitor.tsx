/**
 * NETWORK MONITOR - DETECT NETWORK STRENGTH & OPTIMIZE FOR POOR CONNECTIONS
 * FILE LOCATION: src/components/network/NetworkMonitor.tsx
 * © 2025 Bambeh. All rights reserved.
 */

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import {
  Wifi,
  WifiOff,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react";

type NetworkType =
  | "4g"
  | "3g"
  | "2g"
  | "slow-2g"
  | "wifi"
  | "ethernet"
  | "unknown"
  | "offline";
type NetworkStrength = "excellent" | "good" | "fair" | "poor" | "offline";

interface NetworkInfo {
  type: NetworkType;
  strength: NetworkStrength;
  downlink: number;
  rtt: number;
  saveData: boolean;
  isOnline: boolean;
  effectiveType: string;
}

interface NetworkContextType {
  networkInfo: NetworkInfo;
  isDataSaverEnabled: boolean;
  setDataSaverEnabled: (enabled: boolean) => void;
  retryConnection: () => void;
}

const defaultNetworkInfo: NetworkInfo = {
  type: "unknown",
  strength: "good",
  downlink: 10,
  rtt: 100,
  saveData: false,
  isOnline: true,
  effectiveType: "4g",
};

const NetworkContext = createContext<NetworkContextType>({
  networkInfo: defaultNetworkInfo,
  isDataSaverEnabled: false,
  setDataSaverEnabled: () => {},
  retryConnection: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

const getNetworkStrength = (
  downlink: number,
  rtt: number,
  effectiveType: string,
): NetworkStrength => {
  if (!navigator.onLine) return "offline";

  if (
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    downlink < 0.5 ||
    rtt > 500
  ) {
    return "poor";
  }
  if (
    effectiveType === "3g" ||
    (downlink >= 0.5 && downlink < 2) ||
    (rtt > 200 && rtt <= 500)
  ) {
    return "fair";
  }
  if ((downlink >= 2 && downlink < 10) || (rtt > 50 && rtt <= 200)) {
    return "good";
  }
  return "excellent";
};

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkInfo, setNetworkInfo] =
    useState<NetworkInfo>(defaultNetworkInfo);
  const [isDataSaverEnabled, setDataSaverEnabled] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  const updateNetworkInfo = () => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    const isOnline = navigator.onLine;

    if (connection) {
      const downlink = connection.downlink || 10;
      const rtt = connection.rtt || 100;
      const effectiveType = connection.effectiveType || "4g";
      const saveData = connection.saveData || false;

      const strength = getNetworkStrength(downlink, rtt, effectiveType);

      setNetworkInfo({
        type: effectiveType as NetworkType,
        strength,
        downlink,
        rtt,
        saveData,
        isOnline,
        effectiveType,
      });

      if (strength === "poor" || strength === "fair") {
        setDataSaverEnabled(true);
      }
    } else {
      setNetworkInfo((prev) => ({
        ...prev,
        isOnline,
        strength: isOnline ? "good" : "offline",
      }));
    }
  };

  const retryConnection = () => {
    updateNetworkInfo();
  };

  useEffect(() => {
    updateNetworkInfo();

    const handleOnline = () => {
      setShowOfflineToast(false);
      updateNetworkInfo();
    };

    const handleOffline = () => {
      setNetworkInfo((prev) => ({
        ...prev,
        isOnline: false,
        strength: "offline",
      }));
      setShowOfflineToast(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo);
    }

    const interval = setInterval(updateNetworkInfo, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
      clearInterval(interval);
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        networkInfo,
        isDataSaverEnabled,
        setDataSaverEnabled,
        retryConnection,
      }}
    >
      {children}
      {showOfflineToast && (
        <OfflineToast
          onDismiss={() => setShowOfflineToast(false)}
          onRetry={retryConnection}
        />
      )}
    </NetworkContext.Provider>
  );
}

function OfflineToast({
  onDismiss,
  onRetry,
}: {
  onDismiss: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <WifiOff className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">You're Offline</p>
          <p className="text-sm text-gray-400">
            Check your internet connection
          </p>
        </div>
        <button onClick={onRetry} className="p-2 hover:bg-white/10 rounded-lg">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={onDismiss}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function NetworkIndicator({ compact = false }: { compact?: boolean }) {
  const { networkInfo } = useNetwork();

  const getIcon = () => {
    switch (networkInfo.strength) {
      case "offline":
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case "poor":
        return <SignalLow className="w-4 h-4 text-red-500" />;
      case "fair":
        return <SignalMedium className="w-4 h-4 text-yellow-500" />;
      case "good":
        return <SignalHigh className="w-4 h-4 text-green-500" />;
      case "excellent":
        return <Signal className="w-4 h-4 text-green-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getColor = () => {
    switch (networkInfo.strength) {
      case "offline":
        return "bg-red-100 text-red-700";
      case "poor":
        return "bg-red-100 text-red-700";
      case "fair":
        return "bg-yellow-100 text-yellow-700";
      case "good":
        return "bg-green-100 text-green-700";
      case "excellent":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (compact) {
    return <div className={`p-1.5 rounded-lg ${getColor()}`}>{getIcon()}</div>;
  }

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded-lg ${getColor()}`}
    >
      {getIcon()}
      <span className="text-xs font-medium capitalize">
        {networkInfo.strength === "offline"
          ? "Offline"
          : networkInfo.effectiveType.toUpperCase()}
      </span>
    </div>
  );
}

export function NetworkStatusBar() {
  const { networkInfo, isDataSaverEnabled, setDataSaverEnabled } = useNetwork();

  if (networkInfo.strength === "excellent" || networkInfo.strength === "good") {
    return null;
  }

  if (networkInfo.strength === "offline") {
    return (
      <div className="bg-red-600 text-white px-4 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            You're offline. Some features may not be available.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-500 text-yellow-900 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {networkInfo.strength === "poor"
              ? "Very slow connection"
              : "Slow connection detected"}
          </span>
        </div>
        <button
          onClick={() => setDataSaverEnabled(!isDataSaverEnabled)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            isDataSaverEnabled
              ? "bg-green-600 text-white"
              : "bg-yellow-700 text-white"
          }`}
        >
          {isDataSaverEnabled ? "? Data Saver On" : "Enable Data Saver"}
        </button>
      </div>
    </div>
  );
}

export function useNetworkOptimizedImage(
  highQualitySrc: string,
  lowQualitySrc: string,
): string {
  const { networkInfo, isDataSaverEnabled } = useNetwork();

  if (
    isDataSaverEnabled ||
    networkInfo.strength === "poor" ||
    networkInfo.strength === "fair"
  ) {
    return lowQualitySrc;
  }

  return highQualitySrc;
}

export default NetworkProvider;




