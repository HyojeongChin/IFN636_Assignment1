import { useState } from "react";
import axios, { authHeader } from "../axiosConfig";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function Scan() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const sendScan = async (text) => {
    if (!text || busy) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { data } = await axios.post("/api/attendance/scan", { qrCode: String(text) }, 
    { headers: authHeader() }
    );
    
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Entry Validation</h1>

      <div className="rounded overflow-hidden shadow">
        <Scanner
          constraints={{ facingMode: "environment" }}
          onDecode={(text) => sendScan(text)}
          onError={(err) => setError(String(err))}
        />
      </div>

      {busy && <p className="mt-3">검증 중…</p>}
      {error && <p className="mt-3 text-red-600">{error}</p>}
      {result && (
        <div
          className={`mt-3 p-3 rounded ${
            result.status === "granted" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <b>{result.status?.toUpperCase()}</b>
          {result.reason ? <div className="text-sm">({result.reason})</div> : null}
        </div>
      )}
    </div>
  );
}
