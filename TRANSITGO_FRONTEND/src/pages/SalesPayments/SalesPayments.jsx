import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";

const SalesPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "payments"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap, index) => {
        const d = docSnap.data() || {};
        let createdAt = null;
        if (d.createdAt?.toDate) createdAt = d.createdAt.toDate();
        else if (d.createdAt) createdAt = new Date(d.createdAt);

        return {
          id: docSnap.id,
          ticketId: `TKT-${String(index + 1).padStart(5, "0")}`,
          routeNumber: d.routeNumber ?? "-",
          userName: d.userName ?? "-",
          date: d.date ?? (createdAt ? createdAt.toISOString().split("T")[0] : "-"),
          time: d.time ?? "-",
          amount: d.amount ?? 0,
          status: d.status ?? "Pending",
          paymentMethod: d.paymentMethod ?? "-",
          busNumber: d.busNumber ?? "-",
          start: d.start ?? "-",
          destination: d.destination ?? "-",
          createdAt,
        };
      });
      setPayments(list);
    } catch (err) {
      console.error("fetchPayments error:", err);
      toast.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Date filtering
  const getFilteredByDate = (list) => {
    if (dateRange === "all") return list;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let cutoff;

    if (dateRange === "today") {
      cutoff = startOfToday;
    } else if (dateRange === "7days") {
      cutoff = new Date(startOfToday);
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (dateRange === "30days") {
      cutoff = new Date(startOfToday);
      cutoff.setDate(cutoff.getDate() - 30);
    }

    return list.filter((p) => {
      if (!p.createdAt) return false;
      return p.createdAt >= cutoff;
    });
  };

  // Search filtering
  const getFilteredBySearch = (list) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (p) =>
        p.ticketId.toLowerCase().includes(term) ||
        p.routeNumber.toLowerCase().includes(term) ||
        p.userName.toLowerCase().includes(term) ||
        p.busNumber.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term) ||
        p.start.toLowerCase().includes(term) ||
        p.destination.toLowerCase().includes(term)
    );
  };

  const filteredPayments = getFilteredBySearch(getFilteredByDate(payments));

  // Summary computations on date-filtered data (before search)
  const dateFiltered = getFilteredByDate(payments);
  const totalSales = dateFiltered.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayments = dateFiltered
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = totalSales - completedPayments;

  const formatCurrency = (val) => {
    return `Rs. ${val.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className="rounded-t-3xl px-6 py-5"
            style={{
              background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Sales &amp; Payments
                </h2>
                <p className="mt-1 text-sm text-white/90">
                  View, filter, and manage ticket sales and payment records.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-sm text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/70"
                  style={{ color: 'white' }}
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="today" style={{ color: '#333' }}>Today</option>
                  <option value="7days" style={{ color: '#333' }}>Last 7 days</option>
                  <option value="30days" style={{ color: '#333' }}>Last 30 days</option>
                  <option value="all" style={{ color: '#333' }}>All time</option>
                </select>
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white text-emerald-600 shadow hover:bg-white/90 transition"
                  onClick={() => {
                    toast.info("Export feature coming soon!");
                  }}
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total Sales
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-800">
                  {loading ? "..." : formatCurrency(totalSales)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Ticket revenue for selected period
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pending Payments
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-500">
                  {loading ? "..." : formatCurrency(pendingPayments)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Outstanding payments to be collected
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Completed Payments
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-500">
                  {loading ? "..." : formatCurrency(completedPayments)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Successfully settled amounts
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-700">
                  Ticket sales &amp; payment history
                  {!loading && (
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      ({filteredPayments.length} record{filteredPayments.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Search by ticket ID, route, passenger..."
                    className="w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-600 text-white">
                      <th className="px-4 py-3 text-left font-semibold">
                        Ticket ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Route
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Passenger
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-gray-400"
                          colSpan={6}
                        >
                          Loading payment records...
                        </td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-gray-400"
                          colSpan={6}
                        >
                          {payments.length === 0
                            ? "No sales or payment records yet. Once tickets are issued, they will appear here."
                            : "No records match your search or filter criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-gray-100 hover:bg-gray-50/50 transition"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {p.ticketId}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {p.routeNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {p.userName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div>{p.date}</div>
                            <div className="text-xs text-gray-400">{p.time}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            Rs. {(p.amount || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor:
                                  p.status === "Completed"
                                    ? "#d1fae5"
                                    : p.status === "Pending"
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                color:
                                  p.status === "Completed"
                                    ? "#065f46"
                                    : p.status === "Pending"
                                      ? "#92400e"
                                      : "#991b1b",
                              }}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPayments;
