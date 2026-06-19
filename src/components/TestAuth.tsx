// @ts-nocheck
import React, { useState } from "react";

const TestAuth: React.FC = () => {
  const [result, setResult] = useState("");

  const test = async () => {
    setResult("Testingâ€¦");
    try {
      const res  = await fetch("/api/products?pageSize=3");
      const data = await res.json() as unknown;
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(String(e));
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Auth / API Test</h1>
      <button onClick={test} className="bg-teal-600 text-white px-4 py-2 rounded">
        Test Products API
      </button>
      {result && (
        <pre className="mt-4 p-3 bg-gray-100 rounded text-xs overflow-auto">{result}</pre>
      )}
    </div>
  );
};

export default TestAuth;
