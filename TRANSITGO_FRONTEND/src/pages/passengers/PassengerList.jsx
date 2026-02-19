import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  MdVisibility,
  MdEdit,
  MdBlock,
  MdCheckCircle,
  MdDelete,
  MdClose,
} from "react-icons/md";

const PassengerList = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewPassenger, setViewPassenger] = useState(null);
  const [editPassenger, setEditPassenger] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [status, setStatus] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

  const fetchPassengers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "passengers"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => {
        const d = docSnap.data() || {};
        let createdAt = null;
        if (d.createdAt?.toDate) createdAt = d.createdAt.toDate().toISOString();
        else if (d.createdAtClient) createdAt = d.createdAtClient;
        else if (d.createdAt) createdAt = String(d.createdAt);
        return {
          id: docSnap.id,
          passengerId: d.passengerId ?? "-",
          fullName: d.fullName ?? "-",
          nicPassport: d.nicPassport ?? "-",
          phone: d.phone ?? "-",
          email: d.email ?? null,
          gender: d.gender ?? "-",
          dateOfBirth: d.dateOfBirth ?? null,
          status: d.status ?? "Active",
          createdAt,
        };
      });
      setPassengers(list);
    } catch (err) {
      console.error("fetchPassengers error:", err);
      setStatus({ type: "error", msg: "Failed to load passengers." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const openEdit = (p) => {
    setEditPassenger(p);
    setEditForm({
      fullName: p.fullName,
      nicPassport: p.nicPassport,
      phone: p.phone,
      email: p.email || "",
      gender: p.gender,
      dateOfBirth: p.dateOfBirth || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editPassenger) return;
    if (!editForm.fullName?.trim() || !editForm.nicPassport?.trim() || !editForm.phone?.trim()) {
      setStatus({ type: "error", msg: "Full Name, NIC/Passport and Phone are required." });
      return;
    }
    setStatus({ type: "loading" });
    try {
      await updateDoc(doc(db, "passengers", editPassenger.id), {
        fullName: editForm.fullName.trim(),
        nicPassport: editForm.nicPassport.trim(),
        phone: editForm.phone.trim(),
        email: (editForm.email || "").trim() || null,
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth || null,
        updatedAt: new Date().toISOString(),
      });
      setStatus({ type: "success", msg: "Passenger updated successfully." });
      setEditPassenger(null);
      fetchPassengers();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to update passenger." });
    }
  };

  const toggleStatus = async (p) => {
    const newStatus = p.status === "Active" ? "Blocked" : "Active";
    setConfirmAction(null);
    try {
      await updateDoc(doc(db, "passengers", p.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setStatus({
        type: "success",
        msg: `Passenger ${newStatus === "Blocked" ? "deactivated" : "activated"} successfully.`,
      });
      fetchPassengers();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to update status." });
    }
  };

  const handleDelete = async (p) => {
    setConfirmAction(null);
    try {
      await deleteDoc(doc(db, "passengers", p.id));
      setStatus({ type: "success", msg: "Passenger deleted permanently." });
      setViewPassenger(null);
      fetchPassengers();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to delete passenger." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div
            className="px-6 py-5"
            style={{
              background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
            }}
          >
            <h2 className="text-2xl font-bold text-white">
              Passenger List
            </h2>
            <p className="mt-1 text-sm text-white/90">
              View, edit and manage registered passengers.
            </p>
          </div>

          <div className="p-6">
            {status?.type === "success" && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                {status.msg}
              </div>
            )}
            {status?.type === "error" && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                {status.msg}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-gray-500">
                Loading passengers...
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                      <th className="px-4 py-3">Passenger ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No passengers registered yet.
                        </td>
                      </tr>
                    )}
                    {passengers.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-gray-100 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {p.passengerId}
                        </td>
                        <td className="px-4 py-3">{p.fullName}</td>
                        <td className="px-4 py-3">{p.phone}</td>
                        <td className="px-4 py-3">{p.email || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor:
                                p.status === "Active"
                                  ? "#d1fae5"
                                  : "#fee2e2",
                              color:
                                p.status === "Active"
                                  ? "#065f46"
                                  : "#991b1b",
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setViewPassenger(p)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition"
                              title="View details"
                            >
                              <MdVisibility size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-emerald-600 transition"
                              title="Edit passenger"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  type: "status",
                                  passenger: p,
                                  message:
                                    p.status === "Active"
                                      ? "Deactivate this passenger? They will be marked as Blocked."
                                      : "Activate this passenger?",
                                })
                              }
                              className={`p-2 rounded-lg transition ${
                                p.status === "Active"
                                  ? "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                  : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                              }`}
                              title={p.status === "Active" ? "Deactivate" : "Activate"}
                            >
                              {p.status === "Active" ? (
                                <MdBlock size={18} />
                              ) : (
                                <MdCheckCircle size={18} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({
                                  type: "delete",
                                  passenger: p,
                                  message:
                                    "Permanently delete this passenger? This cannot be undone.",
                                })
                              }
                              className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View details modal */}
      {viewPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div
              className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
              style={{
                background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
              }}
            >
              <h3 className="text-lg font-bold text-white">
                Passenger Details
              </h3>
              <button
                type="button"
                onClick={() => setViewPassenger(null)}
                className="p-1 rounded-lg text-white hover:bg-white/20"
              >
                <MdClose size={24} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Passenger ID</div>
                <div className="font-semibold text-gray-900">{viewPassenger.passengerId}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</div>
                <div className="text-gray-900">{viewPassenger.fullName}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">NIC / Passport</div>
                <div className="text-gray-900">{viewPassenger.nicPassport}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</div>
                <div className="text-gray-900">{viewPassenger.phone}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</div>
                <div className="text-gray-900">{viewPassenger.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</div>
                <div className="text-gray-900">{viewPassenger.gender}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</div>
                <div className="text-gray-900">
                  {viewPassenger.dateOfBirth
                    ? new Date(viewPassenger.dateOfBirth).toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor:
                      viewPassenger.status === "Active" ? "#d1fae5" : "#fee2e2",
                    color: viewPassenger.status === "Active" ? "#065f46" : "#991b1b",
                  }}
                >
                  {viewPassenger.status}
                </span>
              </div>
              {viewPassenger.createdAt && (
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registered</div>
                  <div className="text-gray-600 text-sm">
                    {new Date(viewPassenger.createdAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = viewPassenger;
                  setViewPassenger(null);
                  openEdit(p);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewPassenger(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div
              className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
              style={{
                background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
              }}
            >
              <h3 className="text-lg font-bold text-white">
                Edit Passenger — {editPassenger.passengerId}
              </h3>
              <button
                type="button"
                onClick={() => setEditPassenger(null)}
                className="p-1 rounded-lg text-white hover:bg-white/20"
              >
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>NIC / Passport No *</label>
                  <input
                    name="nicPassport"
                    value={editForm.nicPassport}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    required
                    type="tel"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email (optional)</label>
                  <input
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    type="email"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  >
                    <option value="">-- Select --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={handleEditChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditPassenger(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status?.type === "loading"}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {status?.type === "loading" ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm action modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <p className="text-gray-700 mb-4">{confirmAction.message}</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction.type === "status")
                    toggleStatus(confirmAction.passenger);
                  else if (confirmAction.type === "delete") {
                    handleDelete(confirmAction.passenger);
                  }
                }}
                className={`px-4 py-2 rounded-xl font-medium text-white ${
                  confirmAction.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {confirmAction.type === "delete" ? "Delete" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerList;
