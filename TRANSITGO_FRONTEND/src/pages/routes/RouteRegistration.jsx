import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { toast } from "react-toastify";

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
  const [editingRoute, setEditingRoute] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  // 🔹 Save or Update route
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.routeNumber || !form.start || !form.destination) {
      toast.error("Required fields missing");
      return;
    }

    try {
      setStatus({ type: "loading" });

      if (editingRoute) {
        await updateDoc(doc(db, "routes", editingRoute.id), {
          routeNumber: form.routeNumber,
          start: form.start,
          destination: form.destination,
          via: form.via || "",
          fare: Number(form.fare) || 0,
        });

        toast.success("Route updated successfully 🚏");
        setEditingRoute(null);
      } else {
        await addDoc(collection(db, "routes"), {
          routeNumber: form.routeNumber,
          start: form.start,
          destination: form.destination,
          via: form.via || "",
          fare: Number(form.fare) || 0,
          status: "Active",
          createdAt: serverTimestamp()
        });

        toast.success("Route saved successfully 🚏");
      }

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
      toast.error(editingRoute ? "Failed to update route" : "Failed to save route");
    } finally {
      setStatus(null);
    }
  };

  // 🔹 Handle Edit
  const handleEdit = (route) => {
    setEditingRoute(route);
    setForm({
      routeNumber: route.routeNumber || "",
      start: route.start || "",
      destination: route.destination || "",
      via: route.via || "",
      fare: route.fare || ""
    });
    setStatus(null);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingRoute(null);
    setForm({
      routeNumber: "",
      start: "",
      destination: "",
      via: "",
      fare: ""
    });
    setStatus(null);
  };

  // 🔹 Handle Delete
  const handleDelete = async (routeId) => {
    try {
      setStatus({ type: "loading" });
      await deleteDoc(doc(db, "routes", routeId));
      toast.success("Route deleted successfully 🗑️");
      setDeleteConfirm(null);
      fetchRoutes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete route");
      setDeleteConfirm(null);
    } finally {
      setStatus(null);
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
          <h2 className="text-2xl font-bold text-white">
            {editingRoute ? "Edit Route" : "Route Registration"}
          </h2>
          <p className="text-white/90 text-sm mt-1">
            {editingRoute ? "Update route details" : "Register official bus routes"}
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

              <div className="md:col-span-2 flex justify-end gap-3">
                {editingRoute && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-5 py-2 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={status?.type === "loading"}
                  className={`px-5 py-2 rounded-xl font-semibold text-white transition ${
                    status?.type === "loading"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                  }`}
                >
                  {status?.type === "loading" 
                    ? (editingRoute ? "Updating..." : "Saving...") 
                    : (editingRoute ? "Update Route" : "Save Route")}
                </button>
              </div>
            </form>

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
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
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
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
                            disabled={editingRoute?.id === r.id}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(r)}
                            className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {routes.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center px-4 py-8 text-gray-500">
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete route <strong>{deleteConfirm.routeNumber}</strong> ({deleteConfirm.start} → {deleteConfirm.destination})?
              </p>
              <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={status?.type === "loading"}
                  className={`px-4 py-2 rounded-xl font-semibold text-white transition ${
                    status?.type === "loading"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {status?.type === "loading" ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteRegistration;
