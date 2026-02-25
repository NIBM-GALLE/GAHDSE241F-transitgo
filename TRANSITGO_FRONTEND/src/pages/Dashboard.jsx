import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

const Home = () => {
  const [kpis, setKpis] = useState({
    buses: 0,
    passengersTotal: 0,
    passengersActive: 0,
    passengersBlocked: 0,
    routesTotal: 0,
    routesActive: 0,
    upcomingSchedules: 0,
  });

  const [signupSeries, setSignupSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [busSnap, passengerSnap, routeSnap, scheduleSnap] = await Promise.all([
          getDocs(collection(db, "buses")),
          getDocs(collection(db, "passengers")),
          getDocs(collection(db, "routes")),
          getDocs(collection(db, "schedules")),
        ]);

        // Buses
        const buses = busSnap.size;

        // Prepare last 7 days buckets for passenger registrations
        const perDayCounts = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayEntries = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          perDayCounts[key] = 0;
          dayEntries.push({ key, date: d });
        }

        // Passengers
        let passengersTotal = 0;
        let passengersActive = 0;
        let passengersBlocked = 0;

        passengerSnap.forEach((docSnap) => {
          const data = docSnap.data() || {};
          passengersTotal++;

          const status = data.status || "Active";
          if (status === "Active") passengersActive++;
          if (status === "Blocked") passengersBlocked++;

          let createdAt = data.createdAt;
          let createdDate = null;
          if (createdAt?.toDate) {
            createdDate = createdAt.toDate();
          } else if (createdAt) {
            const parsed = new Date(createdAt);
            if (!isNaN(parsed.getTime())) createdDate = parsed;
          }
          if (!createdDate) return;
          createdDate.setHours(0, 0, 0, 0);
          const key = createdDate.toISOString().slice(0, 10);
          if (perDayCounts[key] != null) {
            perDayCounts[key] += 1;
          }
        });

        const signupSeriesData = dayEntries.map(({ key, date }) => ({
          label: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
          value: perDayCounts[key] || 0,
        }));

        // Routes
        let routesTotal = 0;
        let routesActive = 0;
        routeSnap.forEach((docSnap) => {
          const data = docSnap.data() || {};
          routesTotal++;
          if ((data.status || "Active") === "Active") routesActive++;
        });

        // Schedules - upcoming from today onwards
        let upcomingSchedules = 0;
        const todayKey = new Date().toISOString().slice(0, 10);
        scheduleSnap.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const dateStr = data.date;
          if (typeof dateStr === "string" && dateStr >= todayKey) {
            upcomingSchedules++;
          }
        });

        setKpis({
          buses,
          passengersTotal,
          passengersActive,
          passengersBlocked,
          routesTotal,
          routesActive,
          upcomingSchedules,
        });
        setSignupSeries(signupSeriesData);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const maxSignup = signupSeries.reduce((max, d) => Math.max(max, d.value), 0) || 1;
  const totalSignup = signupSeries.reduce((sum, d) => sum + d.value, 0);
  const routesUsagePercent =
    kpis.routesTotal > 0 ? Math.round((kpis.routesActive / kpis.routesTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div
            className="rounded-t-3xl px-6 py-5"
            style={{
              background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
            }}
          >
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="mt-1 text-sm text-white/90">
              High-level overview of live TransitGo data from Firebase.
            </p>
          </div>
          <div className="p-6 sm:p-8 space-y-8">
            {error && (
              <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                {error}
              </div>
            )}
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    Registered Buses
                  </p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">
                    🚌
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">
                  {loading ? "…" : kpis.buses}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Total documents in <span className="font-semibold">buses</span> collection
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    Passengers
                  </p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">
                    👥
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">
                  {loading ? "…" : kpis.passengersTotal}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  {loading
                    ? "Loading passenger stats…"
                    : `${kpis.passengersActive} active · ${kpis.passengersBlocked} blocked`}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    Upcoming Trips
                  </p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">
                    ⏱
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">
                  {loading ? "…" : kpis.upcomingSchedules}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Schedules from today onwards in <span className="font-semibold">schedules</span>
                  {" "}collection
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    Active Routes
                  </p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">
                    🛣️
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">
                  {loading ? "…" : kpis.routesActive}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  {loading
                    ? "Loading route stats…"
                    : `${kpis.routesTotal} total routes in system`}
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Daily Ridership Chart (Bar-like) */}
              <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      New Passengers — last 7 days
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Based on passenger registrations in Firestore
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {loading ? "…" : `Total: ${totalSignup}`}
                  </span>
                </div>
                <div className="mt-4 h-40 flex items-end justify-between gap-1 sm:gap-2">
                  {(signupSeries.length ? signupSeries : Array.from({ length: 7 }, () => ({ label: "", value: 0 }))).map(
                    (day, idx) => (
                    <div key={`${day.label}-${idx}`} className="flex flex-1 flex-col items-center">
                      <div className="relative flex h-32 w-full items-end rounded-lg bg-emerald-50/60">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-emerald-500 to-emerald-300"
                          style={{
                            height:
                              day.value === 0
                                ? "4%"
                                : `${Math.max(10, (day.value / maxSignup) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="mt-1 text-[10px] font-medium text-gray-500">
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* On-time Performance (Line-like / sparkline) */}
              <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Route Availability
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Share of active routes vs total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-emerald-600">
                      {loading ? "…" : `${routesUsagePercent}%`}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Target ≥ 80% active
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-36 w-full rounded-xl bg-slate-50 p-3">
                  <div className="flex h-full w-full flex-col justify-center gap-3">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all"
                        style={{ width: `${routesUsagePercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>
                        Active:{" "}
                        {loading
                          ? "…"
                          : `${kpis.routesActive}/${kpis.routesTotal} routes`}
                      </span>
                      <span>Higher is better</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                    <span>Data source: routes collection</span>
                    <span>Updated on load</span>
                  </div>
                </div>

                {/* Quick links */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button className="inline-flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition">
                    View delayed trips
                    <span className="ml-2 text-[11px] text-emerald-900">12</span>
                  </button>
                  <button className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                    Optimize routes
                    <span className="ml-2 text-[11px] text-gray-500">Suggestions</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
