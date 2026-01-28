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

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

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
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg">

        {/* Header */}
        <div className="rounded-t-3xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
          <h2 className="text-2xl font-bold text-white">Route Registration</h2>
          <p className="text-green-100 text-sm mt-1">
            Register official bus routes
          </p>
        </div>

        <div className="p-6">

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

            <div>
              <label>Route Number *</label>
              <input
                name="routeNumber"
                value={form.routeNumber}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 138"
              />
            </div>

            <div>
              <label>Fare (Rs)</label>
              <input
                name="fare"
                type="number"
                value={form.fare}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label>Start *</label>
              <input
                name="start"
                value={form.start}
                onChange={handleChange}
                className={inputClass}
                placeholder="Galle"
              />
            </div>

            <div>
              <label>Destination *</label>
              <input
                name="destination"
                value={form.destination}
                onChange={handleChange}
                className={inputClass}
                placeholder="Kadawatha"
              />
            </div>

            <div className="md:col-span-2">
              <label>Via</label>
              <input
                name="via"
                value={form.via}
                onChange={handleChange}
                className={inputClass}
                placeholder="Kalutara, Panadura"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                disabled={status?.type === "loading"}
                className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                {status?.type === "loading" ? "Saving..." : "Save Route"}
              </button>
            </div>
          </form>

          {/* Status */}
          {status?.type === "success" && (
            <div className="mt-4 text-green-700 bg-green-50 p-3 rounded-lg">
              {status.msg}
            </div>
          )}

          {status?.type === "error" && (
            <div className="mt-4 text-red-700 bg-red-50 p-3 rounded-lg">
              {status.msg}
            </div>
          )}

          {/* Table */}
          <div className="mt-8 overflow-x-auto">
            <h3 className="font-semibold mb-3">Registered Routes</h3>
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Route</th>
                  <th className="p-2">From</th>
                  <th className="p-2">To</th>
                  <th className="p-2">Via</th>
                  <th className="p-2">Fare</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 font-bold text-green-600">{r.routeNumber}</td>
                    <td className="p-2">{r.start}</td>
                    <td className="p-2">{r.destination}</td>
                    <td className="p-2">{r.via || "-"}</td>
                    <td className="p-2">Rs. {r.fare}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-sm">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {routes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
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
  );
};

export default RouteRegistration;
