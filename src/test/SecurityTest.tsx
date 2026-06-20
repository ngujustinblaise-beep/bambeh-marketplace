// @ts-nocheck
import React, { useState } from "react";
import { securityManager } from "../utils/security/SecurityHeaders";
import { rateLimiter }     from "../utils/security/RateLimiter";
import apiClient           from "../utils/api/SecureAPIClient";

const SecurityTest: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const run = async () => {
    const out: string[] = [];

    securityManager.applyHeaders();
    out.push("âœ… SecurityManager.applyHeaders()");

    const ok = rateLimiter.check("test", 5, 60_000);
    out.push(`âœ… RateLimiter: ${ok ? "allowed" : "blocked"}`);

    try {
      await apiClient.get("/health");
      out.push("âœ… SecureAPIClient GET /health");
    } catch (e) {
      out.push(`âš ï¸  SecureAPIClient: ${e instanceof Error ? e.message : String(e)}`);
    }

    setResults(out);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Security Tests</h1>
      <button onClick={run} className="bg-teal-600 text-white px-4 py-2 rounded mb-4">
        Run Tests
      </button>
      <ul className="space-y-2">
        {results.map((r, i) => (
          <li key={i} className="font-mono text-sm">{r}</li>
        ))}
      </ul>
    </div>
  );
};

export default SecurityTest;


