import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query
} from "firebase/firestore";

const RouteRegistration = () => {
  const [form, setForm] = useState({
    routeNumber: "",
    start: "",
    destination: "",
    via: "",
    fare: ""
  });

  const [routes, setRoutes] = useState([]);
  const [status, setStatus] = useState(null);

  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔹 Fetch routes
  const fetchRoutes = async () => {
    const q = query(collection(db, "routes"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    setRoutes(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    );
  };

  // 🔹 Save route
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.routeNumber || !form.start || !form.destination) {
      setStatus({ type: "error", msg: "Required fields missing" });
      return;
    }

    try {
      setStatus({ type: "loading" });

      await addDoc(collection(db, "routes"), {
        routeNumber: form.routeNumber,
        start: form.start,
        destination: form.destination,
        via: form.via || "",
        fare: Number(form.fare) || 0,
        status: "Active",
        createdAt: serverTimestamp()
      });

      setStatus({ type: "success", msg: "Route saved successfully 🚏" });
      setForm({
        routeNumber: "",
        start: "",
        destination: "",
        via: "",
        fare: ""
      });

      fetchRoutes();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to save route" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">

        {/* Header */}
        <div
          className="rounded-t-3xl px-6 py-5"
          style={{
            background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
          }}
        >
          <h2 className="text-2xl font-bold text-white">Route Registration</h2>
          <p className="text-white/90 text-sm mt-1">
            Register official bus routes
          </p>
        </div>

          <div className="p-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

            <div>
              <label className={labelClass}>
                Route Number <span className="text-red-500">*</span>
              </label>
              <input
                name="routeNumber"
                value={form.routeNumber}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 138"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Fare (Rs)</label>
              <input
                name="fare"
                type="number"
                value={form.fare}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div>
              <label className={labelClass}>
                Start <span className="text-red-500">*</span>
              </label>
              <input
                name="start"
                value={form.start}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Galle"
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                name="destination"
                value={form.destination}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Kadawatha"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Via (optional)</label>
              <input
                name="via"
                value={form.via}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Kalutara, Panadura"
              />
            </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  disabled={status?.type === "loading"}
                  className={`px-5 py-2 rounded-xl font-semibold text-white transition ${
                    status?.type === "loading"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                  }`}
                >
                  {status?.type === "loading" ? "Saving..." : "Save Route"}
                </button>
              </div>
            </form>

            {/* Status */}
            {status?.type === "success" && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                <div className="font-medium">{status.msg}</div>
              </div>
            )}

            {status?.type === "error" && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                <div className="font-medium">{status.msg}</div>
              </div>
            )}

            {/* Table */}
            <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200">
              <h3 className="font-semibold mb-3 text-gray-900">Registered Routes</h3>
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Route</th>
                    <th className="px-4 py-3 text-left font-semibold">From</th>
                    <th className="px-4 py-3 text-left font-semibold">To</th>
                    <th className="px-4 py-3 text-left font-semibold">Via</th>
                    <th className="px-4 py-3 text-left font-semibold">Fare</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((r, idx) => (
                    <tr key={r.id} className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-bold text-emerald-600">{r.routeNumber}</td>
                      <td className="px-4 py-3">{r.start}</td>
                      <td className="px-4 py-3">{r.destination}</td>
                      <td className="px-4 py-3">{r.via || "-"}</td>
                      <td className="px-4 py-3">Rs. {r.fare}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-700">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {routes.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center px-4 py-8 text-gray-500">
                        No routes registered yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRegistration;
