import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

const BusRegistration = () => {
  const [form, setForm] = useState({
    busNumber: '',
    driverName: '',
    route: '',
    capacity: '',
    contact: ''
  });
  const [status, setStatus] = useState(null);

  // added: buses list and selected bus
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // added: fetch buses from Firestore
  const fetchBuses = async () => {
    try {
      const q = query(collection(db, 'buses'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => {
        const d = doc.data() || {};
        let createdAt = null;
        if (d.createdAt && d.createdAt.toDate) {
          createdAt = d.createdAt.toDate().toISOString();
        } else if (d.createdAtClient) {
          createdAt = d.createdAtClient;
        } else if (d.createdAt) {
          createdAt = String(d.createdAt);
        }
        return {
          id: doc.id,
          busNumber: d.busNumber || null,
          driverName: d.driverName || null,
          route: d.route || null,
          capacity: d.capacity ?? null,
          contact: d.contact ?? null,
          createdAt,
        };
      });
      setBuses(list);
    } catch (err) {
      console.error('fetchBuses error:', err);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.busNumber || !form.driverName || !form.route) {
      setStatus({ type: 'error', msg: 'Please fill all required fields.' });
      return;
    }

    setStatus({ type: 'loading' });

    try {
      const clientCreatedAt = new Date().toISOString();
      await addDoc(collection(db, 'buses'), {
        busNumber: form.busNumber,
        driverName: form.driverName,
        route: form.route,
        capacity: form.capacity ? Number(form.capacity) : null,
        contact: form.contact || null,
        createdAt: serverTimestamp(),
        createdAtClient: clientCreatedAt
      });

      setStatus({ type: 'success', msg: 'Bus registered successfully 🚍' });
      setForm({ busNumber: '', driverName: '', route: '', capacity: '', contact: '' });

      // refresh list and clear selection
      await fetchBuses();
      setSelectedBus(null);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Failed to register bus.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-6">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🚌 Bus Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bus Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Bus Number <span className="text-red-500">*</span>
            </label>
            <input
              name="busNumber"
              value={form.busNumber}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. NB-1234"
            />
          </div>

          {/* Driver Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              name="driverName"
              value={form.driverName}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Driver full name"
            />
          </div>

          {/* Route */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Route <span className="text-red-500">*</span>
            </label>
            <input
              name="route"
              value={form.route}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Colombo – Kandy"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Capacity
            </label>
            <input
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 54"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Contact Number
            </label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+94 7X XXX XXXX"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={status?.type === 'loading'}
            className={`w-full py-2 rounded-lg text-white font-semibold transition
              ${status?.type === 'loading'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {status?.type === 'loading' ? 'Saving...' : 'Register Bus'}
          </button>
        </form>

        {/* Status Messages */}
        {status?.type === 'success' && (
          <p className="mt-4 text-green-600 text-center font-medium">
            {status.msg}
          </p>
        )}

        {status?.type === 'error' && (
          <p className="mt-4 text-red-600 text-center font-medium">
            {status.msg}
          </p>
        )}

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
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {buses.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">No buses registered yet.</td></tr>
                )}
                {buses.map((b) => (
                  <tr
                    key={b.id}
                    className={`border-t cursor-pointer ${selectedBus && selectedBus.id === b.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedBus(b)}
                  >
                    <td className="px-4 py-2">{b.busNumber}</td>
                    <td className="px-4 py-2">{b.driverName}</td>
                    <td className="px-4 py-2">{b.route}</td>
                    <td className="px-4 py-2">{b.capacity ?? '-'}</td>
                    <td className="px-4 py-2">{b.contact ?? '-'}</td>
                    <td className="px-4 py-2">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '-'}</td>
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
                  <div className="font-medium">{selectedBus.driverName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Route</div>
                  <div className="font-medium">{selectedBus.route}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Capacity</div>
                  <div className="font-medium">{selectedBus.capacity ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact</div>
                  <div className="font-medium">{selectedBus.contact ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Created At</div>
                  <div className="font-medium">{selectedBus.createdAt ? new Date(selectedBus.createdAt).toLocaleString() : '-'}</div>
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
  );
};

export default BusRegistration;
