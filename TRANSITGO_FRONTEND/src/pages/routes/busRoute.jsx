import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";

const BusRoute = () => {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const navigate = useNavigate();
  

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

  const filteredRoutes = routes.filter(route =>
    route.start.toLowerCase().includes(start.toLowerCase()) &&
    route.destination.toLowerCase().includes(destination.toLowerCase())
  );

  // Get buses for selected route
  const busesForRoute = selectedRoute
    ? buses.filter(bus => bus.route === selectedRoute.routeNumber)
    : [];

  const handleScheduleRoute = (route) => {
    navigate("/home/bus_schedule", { state: { selectedRoute: route } });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚌 Bus Route Management</h2>

      {/* Route Search Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Search Routes</h3>
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="Start Location"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      {loading && <p style={styles.message}>⏳ Loading routes...</p>}
      {error && <p style={styles.error}>❌ {error}</p>}
      {!loading && filteredRoutes.length === 0 && !error && (
        <p style={styles.message}>📭 No routes found</p>
      )}

      {/* Routes Table */}
      {!loading && filteredRoutes.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Available Routes</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Route No</th>
                  <th style={styles.th}>From</th>
                  <th style={styles.th}>To</th>
                  <th style={styles.th}>Via</th>
                  <th style={styles.th}>Fare</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route, idx) => (
                  <tr 
                    key={route.id} 
                    style={{
                      ...styles.row,
                      backgroundColor: selectedRoute?.id === route.id ? '#e8f5e9' : (idx % 2 === 0 ? '#f9f9f9' : '#fff')
                    }}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <td style={styles.td}>{route.routeNumber}</td>
                    <td style={styles.td}>{route.start}</td>
                    <td style={styles.td}>{route.destination}</td>
                    <td style={styles.td}>{route.via}</td>
                    <td style={styles.td}>Rs. {route.fare}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: route.status === 'Active' ? '#d4edda' : '#f8d7da',
                        color: route.status === 'Active' ? '#155724' : '#721c24',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {route.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleRoute(route);
                        }}
                        style={styles.actionBtn}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1e8449'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
                      >
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Buses for Selected Route */}
      {selectedRoute && (
        <div style={styles.section}>
          <div style={styles.routeHeader}>
            <div>
              <h3 style={styles.sectionTitle}>
                Buses on Route {selectedRoute.routeNumber}
              </h3>
              <p style={styles.routeSubtitle}>
                {selectedRoute.start} → {selectedRoute.destination}
              </p>
            </div>
            <button
              onClick={() => setSelectedRoute(null)}
              style={styles.clearBtn}
            >
              ✕ Clear Selection
            </button>
          </div>

          {busesForRoute.length === 0 ? (
            <div style={styles.noDataMessage}>
              <p>📭 No buses assigned to this route yet.</p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                Go to Bus Registration to assign buses to this route.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.th}>Bus Number</th>
                    <th style={styles.th}>Driver</th>
                    <th style={styles.th}>Capacity</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>QR Code</th>
                  </tr>
                </thead>
                <tbody>
                  {busesForRoute.map((bus, idx) => (
                    <tr key={bus.id} style={{
                      ...styles.row,
                      backgroundColor: idx % 2 === 0 ? '#f9f9f9' : '#fff'
                    }}>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 'bold', color: '#27ae60' }}>
                          {bus.busNumber}
                        </span>
                      </td>
                      <td style={styles.td}>{bus.driverName}</td>
                      <td style={styles.td}>
                        <span style={{ 
                          backgroundColor: '#e3f2fd',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {bus.capacity} seats
                        </span>
                      </td>
                      <td style={styles.td}>{bus.contact || '-'}</td>
                      <td style={styles.td}>
                        {bus.qrCode ? (
                          <img
                            src={bus.qrCode}
                            alt={`QR for ${bus.busNumber}`}
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: 'cover',
                              borderRadius: 6,
                              cursor: 'pointer',
                              border: '2px solid #27ae60'
                            }}
                            title="Click to view full QR code"
                          />
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
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
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#27ae60',
  },
  section: {
    marginBottom: '30px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  routeSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginTop: '4px'
  },
  routeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  filters: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    flex: '1 1 200px',
    minWidth: '200px'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff'
  },
  headerRow: {
    backgroundColor: '#27ae60',
    color: '#fff'
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #27ae60'
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #eee'
  },
  row: {
    transition: 'background-color 0.2s ease',
    cursor: 'pointer'
  },
  message: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
    fontSize: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  noDataMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    fontSize: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    border: '2px dashed #ddd'
  },
  error: {
    textAlign: 'center',
    padding: '20px',
    color: '#c0392b',
    fontSize: '16px',
    backgroundColor: '#fadbd8',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  actionBtn: {
    padding: '8px 16px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  clearBtn: {
    padding: '10px 16px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  }
};

export default BusRoute;
