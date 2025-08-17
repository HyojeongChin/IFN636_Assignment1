import { useEffect, useState } from "react";
import axios from "../axiosConfig";
import QRPassCard from "../components/QRPassCard";

export default function MyPass() {
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get("/api/passes/me"); // A2
        setPass(data);
      } catch (e) {
        setError("Unable to load pass.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!pass) return <div className="p-6">No passes registered.</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <QRPassCard pass={pass} />
      <div className="mt-4 text-sm text-gray-600">
        Status description: active = valid, revoked = cancelled, used = admission completed
      </div>
    </div>
  );
}
"// DEPG-5: render QR + pass status" 
