// BAMBEH_DEPLOY_TOKEN__NETWORKMONITOR_FIX391_CLEAN
/**
 * NETWORK MONITOR - FIX391. The feedback loop is closed.
 * FILE LOCATION: src/components/network/NetworkMonitor.tsx
 *
 * ===================================================================
 * WHAT THIS FILE WAS DOING
 * ===================================================================
 * NetworkProvider wraps the ENTIRE application (App.tsx: NetworkProvider ->
 * AuthProvider -> everything). Its updateNetworkInfo() ended with:
 *
 *     setNetworkInfo({ type, strength, downlink, rtt, saveData, isOnline,
 *                      effectiveType });
 *
 * A brand new object, unconditionally, on EVERY call. React only skips a
 * re-render when the value is identical by reference, and a fresh object
 * never is. So every call re-rendered the provider and every single thing
 * underneath it.
 *
 * And it was called from here:
 *
 *     connection.addEventListener("change", updateNetworkInfo);
 *
 * navigator.connection fires "change" whenever Chrome revises its rtt and
 * downlink estimates - and Chrome revises those FROM OBSERVED REQUEST
 * FAILURES. So the loop ran itself:
 *
 *     requests fail -> Chrome lowers its estimate -> "change" fires
 *       -> new object -> WHOLE APP RE-RENDERS -> every page refetches
 *       -> more failures -> Chrome revises again -> "change" fires ...
 *
 * A live console went from 125 errors to 227 in one minute on a page nobody
 * was touching. That is this loop, accelerating exactly when the connection
 * is already struggling.
 *
 * Two more accelerants in the same file: the context value was a fresh object
 * literal on every render, so every useNetwork() consumer re-rendered too;
 * and the fair/poor boundary sat at rtt 500, so a jittering number flipped
 * strength back and forth, firing again each time.
 *
 * ===================================================================
 * WHAT FIX391 CHANGES
 * ===================================================================
 *
 *   1. STATE IS ONLY SET WHEN SOMETHING ACTUALLY CHANGED. sameInfo()
 *      compares every field first and bails out if they match. This alone
 *      closes the loop: a "change" event that reports the same numbers now
 *      costs nothing at all.
 *
 *   2. THE CONTEXT VALUE IS MEMOISED. Consumers re-render when the network
 *      genuinely changed, not on every provider render.
 *
 *   3. A CHANGE MUST BE SEEN TWICE BEFORE IT COUNTS. One noisy sample can no
 *      longer flip the whole app. Jitter across a boundary is absorbed.
 *
 *   4. THE "change" EVENT IS DEBOUNCED by 1.5s, so a burst of revisions
 *      becomes one sample.
 *
 *   5. THE THRESHOLDS ARE HONEST ABOUT AFRICAN NETWORKS. The old file called
 *      anything over 200 ms "fair" and anything over 500 ms "poor". A
 *      measured round trip from Yaounde to this Supabase project is 210-270
 *      ms - completely normal. So EVERY Cameroonian user was permanently
 *      told their connection was slow, on every page, forever. The bands are
 *      now set where a real fault begins, not where distance begins.
 *
 *   6. A MANUAL DATA SAVER CHOICE STICKS. The old code re-enabled it on
 *      every sample, so a user who turned it off had it turned back on
 *      seconds later.
 *
 * Every export is unchanged: NetworkProvider (named and default),
 * useNetwork, NetworkIndicator, NetworkStatusBar, useNetworkOptimizedImage.
 * Nothing that imports this file has to change.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
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

/* ------------------------------------------------------------------ *
 * FIX391 - tuning
 * ------------------------------------------------------------------ */

const SAMPLE_MS = 60000;    // heartbeat. Was 30s; nothing needs it that often.
const DEBOUNCE_MS = 1500;   // coalesce a burst of "change" events into one
const CONFIRM_SAMPLES = 2;  // a change must be seen twice before it counts

/**
 * FIX391 - thresholds that reflect where Bambeh's users actually are.
 *
 * Measured, from Yaounde, on an ordinary connection: 210-270 ms round trip
 * to this Supabase project, and 60 parallel requests all succeeding. That is
 * a HEALTHY connection that simply has an ocean in the way.
 *
 * The old bands (fair above 200 ms, poor above 500 ms) classified that as
 * degraded and showed a warning banner to every user in the country, on
 * every page. These bands start where a genuine fault starts.
 */
function classify(
  downlink: number,
  rtt: number,
  effectiveType: string,
): NetworkStrength {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "offline";

  if (effectiveType === "slow-2g" || effectiveType === "2g") return "poor";
  if (downlink > 0 && downlink < 0.3) return "poor";
  if (rtt >= 1500) return "poor";

  if (effectiveType === "3g") return "fair";
  if (downlink > 0 && downlink < 1) return "fair";
  if (rtt >= 900) return "fair";

  if (rtt >= 400) return "good";
  if (downlink > 0 && downlink < 8) return "good";

  return "excellent";
}

/** True when two readings are identical - the whole point of FIX391. */
function sameInfo(a: NetworkInfo, b: NetworkInfo): boolean {
  return (
    a.type === b.type &&
    a.strength === b.strength &&
    a.downlink === b.downlink &&
    a.rtt === b.rtt &&
    a.saveData === b.saveData &&
    a.isOnline === b.isOnline &&
    a.effectiveType === b.effectiveType
  );
}

function readConnection(): {
  downlink: number;
  rtt: number;
  effectiveType: string;
  saveData: boolean;
} | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as unknown as Record<string, unknown>;
  const c = (nav.connection || nav.mozConnection || nav.webkitConnection) as
    | Record<string, unknown>
    | undefined;
  if (!c) return null;
  return {
    downlink: typeof c.downlink === "number" ? c.downlink : 10,
    rtt: typeof c.rtt === "number" ? c.rtt : 100,
    effectiveType: typeof c.effectiveType === "string" ? c.effectiveType : "4g",
    saveData: c.saveData === true,
  };
}

/* ------------------------------------------------------------------ */

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(defaultNetworkInfo);
  const [isDataSaverEnabled, setDataSaverState] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  // Live mirror of the current reading, so the sampler can compare without
  // depending on state and re-creating itself on every render.
  const infoRef = useRef<NetworkInfo>(defaultNetworkInfo);

  // A candidate change and how many times we have seen it.
  const pendingRef = useRef<{ info: NetworkInfo; seen: number } | null>(null);

  // Once the user decides for themselves, we stop deciding for them.
  const userChoseRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sample = useCallback((): void => {
    if (typeof navigator === "undefined") return;

    const isOnline = navigator.onLine;
    const c = readConnection();

    let next: NetworkInfo;
    if (c) {
      next = {
        type: c.effectiveType as NetworkType,
        strength: classify(c.downlink, c.rtt, c.effectiveType),
        downlink: c.downlink,
        rtt: c.rtt,
        saveData: c.saveData,
        isOnline,
        effectiveType: c.effectiveType,
      };
    } else {
      // No Network Information API (Firefox, Safari, iOS). Do NOT invent
      // numbers that then look like changes - keep what we have and only
      // track online/offline, which is the one thing we truly know.
      next = {
        ...infoRef.current,
        isOnline,
        strength: isOnline
          ? infoRef.current.strength === "offline"
            ? "good"
            : infoRef.current.strength
          : "offline",
      };
    }

    // ---- THE FIX. Nothing below runs unless something really changed. ----
    if (sameInfo(next, infoRef.current)) {
      pendingRef.current = null;
      return;
    }

    // Going offline, or coming back online, is never a false alarm.
    const urgent = next.isOnline !== infoRef.current.isOnline;

    if (!urgent) {
      const pending = pendingRef.current;
      if (pending && sameInfo(pending.info, next)) {
        pending.seen = pending.seen + 1;
      } else {
        pendingRef.current = { info: next, seen: 1 };
      }
      // One noisy reading must not move the whole application.
      if ((pendingRef.current as { seen: number }).seen < CONFIRM_SAMPLES) return;
    }

    pendingRef.current = null;
    infoRef.current = next;
    setNetworkInfo(next);

    // Suggest data saver once, on a genuinely bad line, and never again
    // afterwards if the user has expressed a preference.
    if (!userChoseRef.current && (next.strength === "poor" || next.saveData)) {
      setDataSaverState(true);
    }
  }, []);

  const setDataSaverEnabled = useCallback((enabled: boolean): void => {
    userChoseRef.current = true;
    setDataSaverState(enabled);
  }, []);

  const retryConnection = useCallback((): void => {
    pendingRef.current = null;
    sample();
  }, [sample]);

  useEffect(() => {
    sample();

    const onOnline = (): void => {
      setShowOfflineToast(false);
      sample();
    };

    const onOffline = (): void => {
      const next: NetworkInfo = {
        ...infoRef.current,
        isOnline: false,
        strength: "offline",
      };
      infoRef.current = next;
      setNetworkInfo(next);
      setShowOfflineToast(true);
    };

    // FIX391 - debounced. Chrome fires "change" in bursts while it is
    // re-estimating, and each one used to re-render the entire application.
    const onConnectionChange = (): void => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        sample();
      }, DEBOUNCE_MS);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const nav = navigator as unknown as Record<string, unknown>;
    const conn = nav.connection as
      | { addEventListener?: (t: string, f: () => void) => void;
          removeEventListener?: (t: string, f: () => void) => void }
      | undefined;
    if (conn && typeof conn.addEventListener === "function") {
      conn.addEventListener("change", onConnectionChange);
    }

    const timer = setInterval(sample, SAMPLE_MS);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (conn && typeof conn.removeEventListener === "function") {
        conn.removeEventListener("change", onConnectionChange);
      }
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
      clearInterval(timer);
    };
  }, [sample]);

  // FIX391 - memoised. Was a fresh object literal on every render, which made
  // every useNetwork() consumer re-render whether or not anything changed.
  const value = useMemo<NetworkContextType>(
    () => ({
      networkInfo,
      isDataSaverEnabled,
      setDataSaverEnabled,
      retryConnection,
    }),
    [networkInfo, isDataSaverEnabled, setDataSaverEnabled, retryConnection],
  );

  return (
    <NetworkContext.Provider value={value}>
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
          <p className="font-semibold">You are offline</p>
          <p className="text-sm text-gray-400">Check your internet connection</p>
        </div>
        <button onClick={onRetry} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Retry">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button onClick={onDismiss} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Dismiss">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function NetworkIndicator({ compact = false }: { compact?: boolean }) {
  const { networkInfo } = useNetwork();

  const icon =
    networkInfo.strength === "offline" ? (
      <WifiOff className="w-4 h-4 text-red-500" />
    ) : networkInfo.strength === "poor" ? (
      <SignalLow className="w-4 h-4 text-red-500" />
    ) : networkInfo.strength === "fair" ? (
      <SignalMedium className="w-4 h-4 text-yellow-500" />
    ) : networkInfo.strength === "good" ? (
      <SignalHigh className="w-4 h-4 text-green-500" />
    ) : networkInfo.strength === "excellent" ? (
      <Signal className="w-4 h-4 text-green-500" />
    ) : (
      <Wifi className="w-4 h-4 text-gray-500" />
    );

  const color =
    networkInfo.strength === "offline" || networkInfo.strength === "poor"
      ? "bg-red-100 text-red-700"
      : networkInfo.strength === "fair"
        ? "bg-yellow-100 text-yellow-700"
        : networkInfo.strength === "good" || networkInfo.strength === "excellent"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700";

  if (compact) {
    return <div className={"p-1.5 rounded-lg " + color}>{icon}</div>;
  }

  return (
    <div className={"flex items-center gap-2 px-2 py-1 rounded-lg " + color}>
      {icon}
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

  // FIX391 - "fair" no longer shows a banner. On this continent a 250 ms
  // round trip is ordinary, and warning every user about it on every page
  // was noise that told them nothing they could act on.
  if (
    networkInfo.strength === "excellent" ||
    networkInfo.strength === "good" ||
    networkInfo.strength === "fair"
  ) {
    return null;
  }

  if (networkInfo.strength === "offline") {
    return (
      <div className="bg-red-600 text-white px-4 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            You are offline. Some features may not be available.
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
          <span className="text-sm font-medium">Very slow connection</span>
        </div>
        <button
          onClick={() => setDataSaverEnabled(!isDataSaverEnabled)}
          className={
            "text-xs px-3 py-1 rounded-full font-medium transition-colors " +
            (isDataSaverEnabled
              ? "bg-green-600 text-white"
              : "bg-yellow-700 text-white")
          }
        >
          {isDataSaverEnabled ? "\u2713 Data Saver On" : "Enable Data Saver"}
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
  if (isDataSaverEnabled || networkInfo.strength === "poor") {
    return lowQualitySrc;
  }
  return highQualitySrc;
}

export default NetworkProvider;
// BAMBEH_END_TOKEN__NETWORKMONITOR_FIX391__COMPLETE
