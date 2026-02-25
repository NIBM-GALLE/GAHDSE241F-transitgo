import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import QRCode from "qrcode";
import { toast } from "react-toastify";

const BusRegistration = () => {
  const [form, setForm] = useState({
    busNumber: "",
    driverName: "",
    routeId: "",
    capacity: "",
    contact: "",
  });
  const [status, setStatus] = useState(null);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

  // Fetch available routes from Firestore
  const fetchAvailableRoutes = async () => {
    try {
      setRouteLoading(true);
      const snapshot = await getDocs(collection(db, "routes"));
      const routeList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        routeNumber: docSnap.data().routeNumber,
        start: docSnap.data().start,
        destination: docSnap.data().destination,
        via: docSnap.data().via || "",
        fare: docSnap.data().fare || 0,
        status: docSnap.data().status || "Active",
        displayText: `${docSnap.data().routeNumber} - ${docSnap.data().start} to ${docSnap.data().destination}`,
      }));
      setAvailableRoutes(routeList);
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    fetchAvailableRoutes();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchBuses = async () => {
    try {
      const q = query(collection(db, "buses"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => {
        const d = docSnap.data() || {};
        let createdAt = null;
        if (d.createdAt && d.createdAt.toDate)
          createdAt = d.createdAt.toDate().toISOString();
        else if (d.createdAtClient) createdAt = d.createdAtClient;
        else if (d.createdAt) createdAt = String(d.createdAt);
        return {
          id: docSnap.id,
          busNumber: d.busNumber || null,
          driverName: d.driverName || null,
          route: d.route || null,
          routeNumber: d.routeNumber || d.route || null,
          capacity: d.capacity ?? null,
          contact: d.contact ?? null,
          createdAt,
          qrCode: d.qrCode ?? null,
        };
      });
      setBuses(list);
    } catch (err) {
      console.error("fetchBuses error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.busNumber || !form.driverName || !form.routeId) {
      toast.error("Please fill all required fields.");
      return;
    }

    setStatus({ type: "loading" });

    try {
      const selectedRoute = availableRoutes.find((r) => r.id === form.routeId);

      if (editingBus) {
        await updateDoc(doc(db, "buses", editingBus.id), {
          busNumber: form.busNumber,
          driverName: form.driverName,
          routeId: selectedRoute.id,
          routeNumber: selectedRoute.routeNumber,
          capacity: form.capacity ? Number(form.capacity) : null,
          contact: form.contact || null,
        });

        toast.success("Bus updated successfully 🚍");
        setEditingBus(null);
      } else {
        const docRef = await addDoc(collection(db, "buses"), {
          busNumber: form.busNumber,
          driverName: form.driverName,
          routeId: selectedRoute.id,
          routeNumber: selectedRoute.routeNumber,
          capacity: form.capacity ? Number(form.capacity) : null,
          contact: form.contact || null,
          createdAt: serverTimestamp(),
        });

        const qrPayload = `transitgo://bus/${docRef.id}`;
        const qrDataUrl = await QRCode.toDataURL(qrPayload);

        await updateDoc(doc(db, "buses", docRef.id), {
          qrCode: qrDataUrl,
        });

        toast.success("Bus registered successfully 🚍");
      }

      setForm({
        busNumber: "",
        driverName: "",
        routeId: "",
        capacity: "",
        contact: "",
      });
      fetchBuses();
    } catch (err) {
      console.error(err);
      toast.error(editingBus ? "Failed to update bus." : "Failed to register bus.");
    } finally {
      setStatus(null);
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setForm({
      busNumber: bus.busNumber || "",
      driverName: bus.driverName || "",
      routeId: bus.routeId || "",
      capacity: bus.capacity || "",
      contact: bus.contact || "",
    });
    setStatus(null);
    setSelectedBus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  
  const handleCancelEdit = () => {
    setEditingBus(null);
    setForm({
      busNumber: "",
      driverName: "",
      routeId: "",
      capacity: "",
      contact: "",
    });
    setStatus(null);
  };

  const handleDelete = async (busId) => {
    try {
      setStatus({ type: "loading" });
      await deleteDoc(doc(db, "buses", busId));
      toast.success("Bus deleted successfully 🗑️");
      setDeleteConfirm(null);
      setSelectedBus(null);
      fetchBuses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete bus");
      setDeleteConfirm(null);
    } finally {
      setStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-start justify-center p-4">
      <div className="w-full max-w-8xl">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div
            className="rounded-t-3xl px-6 py-5"
            style={{
              background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingBus ? "Edit Bus" : "Bus Registration"}
                </h2>
                <p className="mt-1 text-sm text-white/90">
                  {editingBus ? "Update bus details" : "Register a new bus and generate a QR code for quick identification."}
                </p>
              </div>
              <div className="rounded-2xl bg-white/20 px-4 py-2 text-sm text-white font-medium">
                Fields marked{" "}
                <span className="font-semibold text-white">*</span> are required
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Route List Section */}
            {!routeLoading && availableRoutes.length > 0 && (
              <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  📋 Available Routes
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {availableRoutes.map((route) => (
                    <div
                      key={route.id}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          route: route.displayText,
                        }))
                      }
                      style={{
                        cursor: "pointer",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border:
                          form.route === route.displayText
                            ? "2px solid #27ae60"
                            : "1px solid #e5e7eb",
                        backgroundColor:
                          form.route === route.displayText ? "#d1fae5" : "#fff",
                        transition: "all 0.2s ease",
                        boxShadow:
                          form.route === route.displayText
                            ? "0 0 0 3px rgba(39, 174, 96, 0.1)"
                            : "none",
                      }}
                      className="hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-emerald-600">
                            {route.routeNumber}
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            {route.start}
                          </p>
                          <p className="text-sm text-gray-600">
                            → {route.destination}
                          </p>
                          {route.via && (
                            <p className="mt-1 text-xs text-gray-500">
                              Via: {route.via}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 text-right">
                          <p className="text-sm font-semibold text-green-600">
                            Rs.{route.fare}
                          </p>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor:
                                route.status === "Active"
                                  ? "#d4edda"
                                  : "#f8d7da",
                              color:
                                route.status === "Active"
                                  ? "#155724"
                                  : "#721c24",
                              fontSize: "11px",
                              fontWeight: "bold",
                              marginTop: "4px",
                            }}
                          >
                            {route.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bus details
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the bus number, driver, route and optional details.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Bus Number */}
                  <div>
                    <label className={labelClass}>
                      Bus Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="busNumber"
                      value={form.busNumber}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="e.g. NB-1234"
                      autoComplete="off"
                    />
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className={labelClass}>
                      Driver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="driverName"
                      value={form.driverName}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Driver full name"
                      autoComplete="name"
                    />
                  </div>

                  {/* Route */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Route <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="routeId"
                      value={form.routeId}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">-- Select a route --</option>
                      {availableRoutes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.routeNumber} - {route.start} to{" "}
                          {route.destination}
                        </option>
                      ))}
                    </select>

                    {form.routeId &&
                      (() => {
                        const r = availableRoutes.find(
                          (rt) => rt.id === form.routeId,
                        );
                        if (!r) return null;
                        return (
                          <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-sm">
                            <p>
                              <b>Route No:</b> {r.routeNumber}
                            </p>
                            <p>
                              <b>From:</b> {r.start}
                            </p>
                            <p>
                              <b>To:</b> {r.destination}
                            </p>
                            {r.via && (
                              <p>
                                <b>Via:</b> {r.via}
                              </p>
                            )}
                            <p>
                              <b>Fare:</b> Rs. {r.fare}
                            </p>
                          </div>
                        );
                      })()}
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className={labelClass}>Capacity</label>
                    <input
                      name="capacity"
                      type="number"
                      min="0"
                      value={form.capacity}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. 54"
                      inputMode="numeric"
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. +94 7X XXX XXXX"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  {editingBus ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({
                          busNumber: "",
                          driverName: "",
                          routeId: "",
                          capacity: "",
                          contact: "",
                        });
                        setStatus(null);
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={status?.type === "loading"}
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold text-white shadow-sm transition
                      ${
                        status?.type === "loading"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                      }
                    `}
                  >
                    {status?.type === "loading" 
                      ? (editingBus ? "Updating..." : "Saving...") 
                      : (editingBus ? "Update Bus" : "Register Bus")}
                  </button>
                </div>
              </div>
            </form>

            {/* Buses Table */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Registered Buses</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-2">Bus Number</th>
                      <th className="px-4 py-2">Driver</th>
                      <th className="px-4 py-2">Route</th>
                      <th className="px-4 py-2">Capacity</th>
                      <th className="px-4 py-2">Contact</th>
                      <th className="px-4 py-2">QR</th>
                      <th className="px-4 py-2">Created At</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.length === 0 && (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-6 text-center text-gray-500"
                        >
                          No buses registered yet.
                        </td>
                      </tr>
                    )}
                    {buses.map((b) => (
                      <tr
                        key={b.id}
                        className={`border-t ${selectedBus && selectedBus.id === b.id ? "bg-emerald-50" : ""}`}
                      >
                        <td className="px-4 py-2 cursor-pointer" onClick={() => setSelectedBus(b)}>{b.busNumber}</td>
                        <td className="px-4 py-2 cursor-pointer" onClick={() => setSelectedBus(b)}>{b.driverName}</td>
                        <td className="px-4 py-2 cursor-pointer" onClick={() => setSelectedBus(b)}>{b.routeNumber ?? b.route ?? "-"}</td>
                        <td className="px-4 py-2 cursor-pointer" onClick={() => setSelectedBus(b)}>{b.capacity ?? "-"}</td>
                        <td className="px-4 py-2 cursor-pointer" onClick={() => setSelectedBus(b)}>{b.contact ?? "-"}</td>
                        <td className="px-4 py-2 cursor-pointer" onClick={() => setSelectedBus(b)}>
                          {b.qrCode ? (
                            <img
                              src={b.qrCode}
                              alt={`QR for ${b.busNumber}`}
                              style={{
                                width: 48,
                                height: 48,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-2 cursor-pointer" onClick={() => setSelectedBus(b)}>
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(b)}
                              className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
                              disabled={editingBus?.id === b.id}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(b)}
                              className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected Bus Details */}
              {selectedBus && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="text-lg font-semibold mb-2">Bus Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Bus Number</div>
                      <div className="font-medium">{selectedBus.busNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Driver</div>
                      <div className="font-medium">
                        {selectedBus.driverName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Route</div>
                      <div className="font-medium">{selectedBus.routeNumber ?? selectedBus.route ?? "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Capacity</div>
                      <div className="font-medium">
                        {selectedBus.capacity ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Contact</div>
                      <div className="font-medium">
                        {selectedBus.contact ?? "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Created At</div>
                      <div className="font-medium">
                        {selectedBus.createdAt
                          ? new Date(selectedBus.createdAt).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-sm text-gray-500">QR Code</div>
                      {selectedBus.qrCode ? (
                        <img
                          src={selectedBus.qrCode}
                          alt="Bus QR"
                          style={{ width: 160, height: 160 }}
                        />
                      ) : (
                        <div className="text-gray-500">No QR available</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setSelectedBus(null)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
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
                Are you sure you want to delete bus <strong>{deleteConfirm.busNumber}</strong> (Driver: {deleteConfirm.driverName})?
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

export default BusRegistration;
