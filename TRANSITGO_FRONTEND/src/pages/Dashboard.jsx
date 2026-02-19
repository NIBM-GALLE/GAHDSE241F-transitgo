import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div
            className="rounded-t-3xl px-6 py-5"
            style={{
              background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
            }}
          >
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="mt-1 text-sm text-white/90">
              Welcome to TransitGo. Use the sidebar to manage buses, routes, and more.
            </p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🚌 Bus Management</h3>
                <p className="text-sm text-gray-600">
                  Register buses and manage bus information
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🛣️ Route Management</h3>
                <p className="text-sm text-gray-600">
                  Create and manage bus routes and schedules
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Passenger Management</h3>
                <p className="text-sm text-gray-600">
                  Register and manage passenger information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
