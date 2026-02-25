import React from "react";

const SalesPayments = () => {
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
                >
                  <option value="today" style={{ color: '#333' }}>Today</option>
                  <option value="7days" style={{ color: '#333' }}>Last 7 days</option>
                  <option value="30days" style={{ color: '#333' }}>Last 30 days</option>
                  <option value="all" style={{ color: '#333' }}>All time</option>
                </select>
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-white text-emerald-600 shadow hover:bg-white/90 transition"
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
                  Rs. 0.00
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
                  Rs. 0.00
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
                  Rs. 0.00
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
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Search by ticket ID, route, passenger..."
                    className="w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
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
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-gray-400"
                        colSpan={6}
                      >
                        No sales or payment records yet. Once tickets are issued,
                        they will appear here.
                      </td>
                    </tr>
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
