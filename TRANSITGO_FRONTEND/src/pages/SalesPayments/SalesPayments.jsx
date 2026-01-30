import React from "react";

const SalesPayments = () => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Sales &amp; Payments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View, filter, and manage ticket sales and payment records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <button
            className="px-4 py-2 text-sm font-medium rounded-md bg-emerald-500 text-white shadow hover:bg-emerald-600 transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">
            Ticket sales &amp; payment history
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search by ticket ID, route, passenger..."
              className="w-full sm:w-64 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Ticket ID
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Route
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Passenger
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="px-4 py-4 text-center text-gray-400"
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
  );
};

export default SalesPayments;
