import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";

const PassengerRegistration = () => {
  const [form, setForm] = useState({
    fullName: "",
    nicPassport: "",
    phone: "",
    email: "",
    gender: "",
    dateOfBirth: "",
  });
  const [status, setStatus] = useState(null);
  const [nextPassengerId, setNextPassengerId] = useState("P-00001");

  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

  // Compute next Passenger ID from existing passengers
  const fetchNextPassengerId = async () => {
    try {
      const snap = await getDocs(collection(db, "passengers"));
      let maxNum = 0;
      snap.docs.forEach((docSnap) => {
        const id = docSnap.data().passengerId || "";
        const match = id.match(/^P-(\d+)$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (n > maxNum) maxNum = n;
        }
      });
      setNextPassengerId(`P-${String(maxNum + 1).padStart(5, "0")}`);
    } catch (err) {
      console.error("Error fetching next passenger ID:", err);
      setNextPassengerId("P-00001");
    }
  };

  useEffect(() => {
    fetchNextPassengerId();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName?.trim() || !form.nicPassport?.trim() || !form.phone?.trim()) {
      toast.error("Full Name, NIC/Passport and Phone are required.");
      return;
    }
    if (!form.gender) {
      toast.error("Please select Gender.");
      return;
    }
    if (!form.dateOfBirth) {
      toast.error("Date of Birth is required.");
      return;
    }

    setStatus({ type: "loading" });

    try {
      await addDoc(collection(db, "passengers"), {
        passengerId: nextPassengerId,
        fullName: form.fullName.trim(),
        nicPassport: form.nicPassport.trim(),
        phone: form.phone.trim(),
        email: (form.email || "").trim() || null,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        status: "Active",
        createdAt: serverTimestamp(),
      });

      toast.success(`Passenger registered successfully. ID: ${nextPassengerId}`);
      setForm({
        fullName: "",
        nicPassport: "",
        phone: "",
        email: "",
        gender: "",
        dateOfBirth: "",
      });
      await fetchNextPassengerId();
    } catch (err) {
      console.error(err);
      toast.error("Failed to register passenger.");
    } finally {
      setStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-start justify-center p-4">
      <div className="w-full max-w-3xl">
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
                  Passenger Registration
                </h2>
                <p className="mt-1 text-sm text-white/90">
                  Add a new passenger. Passenger ID is auto-generated.
                </p>
              </div>
              <div className="rounded-2xl bg-white/20 px-4 py-2 text-sm text-white font-medium">
                Next ID: <span className="font-bold">{nextPassengerId}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">
                  Passenger details
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Full Name, NIC/Passport, Phone, Gender and Date of Birth are required.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="e.g. John Doe"
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      NIC / Passport No <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nicPassport"
                      value={form.nicPassport}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="e.g. 199012345678 or AB1234567"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="e.g. +94 7X XXX XXXX"
                      type="tel"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Email (optional)</label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. john@example.com"
                      type="email"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
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
                    <label className={labelClass}>
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        fullName: "",
                        nicPassport: "",
                        phone: "",
                        email: "",
                        gender: "",
                        dateOfBirth: "",
                      });
                      setStatus(null);
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={status?.type === "loading"}
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold text-white shadow-sm transition
                      ${
                        status?.type === "loading"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                      }`}
                  >
                    {status?.type === "loading" ? "Saving..." : "Add Passenger"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerRegistration;
