import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const BusRoute = () => {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: ""
  });
  const [scheduleStatus, setScheduleStatus] = useState(null);
  

  useEffect(() => {
    fetchRoutesAndBuses();
  }, []);

  const fetchRoutesAndBuses = async () => {
    try {
      setLoading(true);
      
      // Fetch routes
      const routeSnapshot = await getDocs(collection(db, "routes"));
      const routeList = routeSnapshot.docs.map(doc => ({
        id: doc.id,
        routeNumber: doc.data().routeNumber || "",
        start: doc.data().start || "",
        destination: doc.data().destination || "",
        via: doc.data().via || "",
        fare: doc.data().fare || 0,
        status: doc.data().status || "Active"
      }));
      setRoutes(routeList);

      // Fetch buses
      const busQuery = query(collection(db, "buses"), orderBy("createdAt", "desc"));
      const busSnapshot = await getDocs(busQuery);
      const busList = busSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          busNumber: data.busNumber || "",
          driverName: data.driverName || "",
          route: data.route || "",
          routeNumber: data.routeNumber || data.route || "",
          capacity: data.capacity || 0,
          contact: data.contact || "",
          qrCode: data.qrCode || null
        };
      });
      setBuses(busList);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load routes and buses");
    } finally {
      setLoading(false);
    }
  };

  // Get unique destinations from routes
  const uniqueDestinations = [...new Set(routes.map(route => route.destination).filter(Boolean))].sort();

  const filteredRoutes = routes.filter(route =>
    route.start.toLowerCase().includes(start.toLowerCase()) &&
    (!destination || route.destination === destination)
  );

  // Get buses for selected destination
  const busesForDestination = destination
    ? buses.filter(bus => {
        const routeNumbers = routes
          .filter(route => route.destination === destination)
          .map(route => route.routeNumber);
        return routeNumbers.includes(bus.routeNumber) || routeNumbers.includes(bus.route);
      })
    : [];

  // Get buses for selected route (for backward compatibility)
  const busesForRoute = selectedRoute
    ? buses.filter(bus => bus.routeNumber === selectedRoute.routeNumber || bus.route === selectedRoute.routeNumber)
    : [];

  const handleScheduleBus = (bus) => {
    setSelectedBus(bus);
    setShowScheduleModal(true);
    setScheduleForm({ date: "", time: "" });
    setScheduleStatus(null);
  };

  const handleCloseModal = () => {
    setShowScheduleModal(false);
    setSelectedBus(null);
    setScheduleForm({ date: "", time: "" });
    setScheduleStatus(null);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (!scheduleForm.date || !scheduleForm.time) {
      setScheduleStatus({ type: "error", msg: "Please fill in both date and time" });
      return;
    }

    try {
      setScheduleStatus({ type: "loading" });

      // Find the route for this bus
      const busRoute = routes.find(r => 
        r.routeNumber === selectedBus.routeNumber || r.routeNumber === selectedBus.route
      );

      await addDoc(collection(db, "schedules"), {
        busId: selectedBus.id,
        busNumber: selectedBus.busNumber,
        driverName: selectedBus.driverName,
        routeId: busRoute?.id || null,
        routeNumber: busRoute?.routeNumber || selectedBus.routeNumber || selectedBus.route,
        destination: destination || busRoute?.destination || "",
        date: scheduleForm.date,
        time: scheduleForm.time,
        status: "Scheduled",
        createdAt: serverTimestamp()
      });

      setScheduleStatus({ type: "success", msg: "Schedule saved successfully! 🎉" });
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      console.error("Error saving schedule:", err);
      setScheduleStatus({ type: "error", msg: "Failed to save schedule" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className="rounded-t-3xl px-6 py-5"
            style={{
              background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
            }}
          >
            <h2 className="text-2xl font-bold text-white">
              🚌 Bus Route Management
            </h2>
            <p className="mt-1 text-sm text-white/90">
              Search routes and manage bus schedules by destination.
            </p>
          </div>

          <div className="p-6">
            {/* Route Search Section */}
            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Routes</h3>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Start Location"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
                <select
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setSelectedRoute(null);
                  }}
                  className="flex-1 min-w-[200px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select Destination</option>
                  {uniqueDestinations.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                ⏳ Loading routes...
              </div>
            )}
            
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                ❌ {error}
              </div>
            )}

            {/* Buses Table for Selected Destination */}
            {!loading && destination && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Buses for Destination: {destination}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {busesForDestination.length} bus{busesForDestination.length !== 1 ? 'es' : ''} available
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDestination("");
                      setSelectedRoute(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                  >
                    ✕ Clear Selection
                  </button>
                </div>

                {busesForDestination.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2">📭 No buses registered for this destination.</p>
                    <p className="text-sm text-gray-400">
                      Go to Bus Registration to assign buses to routes with this destination.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-emerald-600 text-white">
                          <th className="px-4 py-3 text-left font-semibold">Bus Number</th>
                          <th className="px-4 py-3 text-left font-semibold">Driver</th>
                          <th className="px-4 py-3 text-left font-semibold">Route</th>
                          <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                          <th className="px-4 py-3 text-left font-semibold">Contact</th>
                          <th className="px-4 py-3 text-left font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {busesForDestination.map((bus, idx) => {
                          const busRoute = routes.find(r => 
                            r.routeNumber === bus.routeNumber || r.routeNumber === bus.route
                          );
                          return (
                            <tr
                              key={bus.id}
                              className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                            >
                              <td className="px-4 py-3">
                                <span className="font-bold text-emerald-600">
                                  {bus.busNumber}
                                </span>
                              </td>
                              <td className="px-4 py-3">{bus.driverName}</td>
                              <td className="px-4 py-3">
                                {busRoute ? (
                                  <span>
                                    {busRoute.routeNumber} - {busRoute.start} → {busRoute.destination}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">{bus.routeNumber || bus.route || '-'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                  {bus.capacity} seats
                                </span>
                              </td>
                              <td className="px-4 py-3">{bus.contact || '-'}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleScheduleBus(bus)}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-sm"
                                >
                                  Schedule
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Routes Table (shown when no destination is selected) */}
            {!loading && !destination && filteredRoutes.length > 0 && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Routes</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="px-4 py-3 text-left font-semibold">Route No</th>
                        <th className="px-4 py-3 text-left font-semibold">From</th>
                        <th className="px-4 py-3 text-left font-semibold">To</th>
                        <th className="px-4 py-3 text-left font-semibold">Via</th>
                        <th className="px-4 py-3 text-left font-semibold">Fare</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoutes.map((route, idx) => (
                        <tr
                          key={route.id}
                          className={`border-t border-gray-100 cursor-pointer transition ${
                            selectedRoute?.id === route.id
                              ? 'bg-emerald-50'
                              : idx % 2 === 0
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50/50 hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedRoute(route)}
                        >
                          <td className="px-4 py-3 font-semibold text-emerald-600">{route.routeNumber}</td>
                          <td className="px-4 py-3">{route.start}</td>
                          <td className="px-4 py-3">{route.destination}</td>
                          <td className="px-4 py-3">{route.via || '-'}</td>
                          <td className="px-4 py-3">Rs. {route.fare}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                route.status === 'Active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {route.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && !destination && filteredRoutes.length === 0 && !error && (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                📭 Select a destination to view buses
              </div>
            )}

            {/* Buses for Selected Route */}
            {selectedRoute && (
              <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Buses on Route {selectedRoute.routeNumber}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedRoute.start} → {selectedRoute.destination}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                  >
                    ✕ Clear Selection
                  </button>
                </div>

                {busesForRoute.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2">📭 No buses assigned to this route yet.</p>
                    <p className="text-sm text-gray-400">
                      Go to Bus Registration to assign buses to this route.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-emerald-600 text-white">
                          <th className="px-4 py-3 text-left font-semibold">Bus Number</th>
                          <th className="px-4 py-3 text-left font-semibold">Driver</th>
                          <th className="px-4 py-3 text-left font-semibold">Capacity</th>
                          <th className="px-4 py-3 text-left font-semibold">Contact</th>
                          <th className="px-4 py-3 text-left font-semibold">QR Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {busesForRoute.map((bus, idx) => (
                          <tr
                            key={bus.id}
                            className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                          >
                            <td className="px-4 py-3">
                              <span className="font-bold text-emerald-600">
                                {bus.busNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3">{bus.driverName}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                {bus.capacity} seats
                              </span>
                            </td>
                            <td className="px-4 py-3">{bus.contact || '-'}</td>
                            <td className="px-4 py-3">
                              {bus.qrCode ? (
                                <img
                                  src={bus.qrCode}
                                  alt={`QR for ${bus.busNumber}`}
                                  className="w-12 h-12 object-cover rounded-lg border-2 border-emerald-600 cursor-pointer"
                                  title="Click to view full QR code"
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div
              className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
              style={{
                background: "linear-gradient(135deg, #27ae60 0%, #16c98d 100%)",
              }}
            >
              <h3 className="text-lg font-bold text-white">Schedule Bus</h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-white hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-5 rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-700 mb-2"><strong>Bus Number:</strong> {selectedBus.busNumber}</p>
                <p className="text-sm text-gray-700 mb-2"><strong>Driver:</strong> {selectedBus.driverName}</p>
                <p className="text-sm text-gray-700"><strong>Destination:</strong> {destination}</p>
              </div>

              <form onSubmit={handleScheduleSubmit}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                {scheduleStatus && (
                  <div
                    className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${
                      scheduleStatus.type === 'success'
                        ? 'border border-green-200 bg-green-50 text-green-800'
                        : 'border border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    {scheduleStatus.msg}
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleStatus?.type === 'loading'}
                    className={`px-4 py-2 rounded-xl font-semibold text-white transition ${
                      scheduleStatus?.type === 'loading'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200'
                    }`}
                  >
                    {scheduleStatus?.type === 'loading' ? 'Saving...' : 'Save Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusRoute;
