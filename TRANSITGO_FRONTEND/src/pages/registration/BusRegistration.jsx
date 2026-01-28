import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';
// added: qrcode generator
import QRCode from 'qrcode';

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

  const labelClass = "block text-sm font-medium text-gray-700";
  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // fetch buses (include qrCode)
  const fetchBuses = async () => {
    try {
      const q = query(collection(db, 'buses'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(docSnap => {
        const d = docSnap.data() || {};
        let createdAt = null;
        if (d.createdAt && d.createdAt.toDate) createdAt = d.createdAt.toDate().toISOString();
        else if (d.createdAtClient) createdAt = d.createdAtClient;
        else if (d.createdAt) createdAt = String(d.createdAt);
        return {
          id: docSnap.id,
          busNumber: d.busNumber || null,
          driverName: d.driverName || null,
          route: d.route || null,
          capacity: d.capacity ?? null,
          contact: d.contact ?? null,
          createdAt,
          qrCode: d.qrCode ?? null, // include qrCode
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

      // create the doc first to obtain id
      const docRef = await addDoc(collection(db, 'buses'), {
        busNumber: form.busNumber,
        driverName: form.driverName,
        route: form.route,
        capacity: form.capacity ? Number(form.capacity) : null,
        contact: form.contact || null,
        createdAt: serverTimestamp(),
        createdAtClient: clientCreatedAt
      });

      // generate QR payload - you can change this to a URL or structured payload
      const qrPayload = `transitgo://bus/${docRef.id}`; // use document id for uniqueness

      // generate data URL (PNG) for the QR code
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 2, width: 300 });

      // update doc with qrCode field
      await updateDoc(doc(db, 'buses', docRef.id), { qrCode: qrDataUrl });

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-start justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">Bus Registration</h2>
                <p className="mt-1 text-sm text-blue-100">
                  Register a new bus and generate a QR code for quick identification.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/90">
                Fields marked <span className="font-semibold text-white">*</span> are required
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bus details</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the bus number, driver, route and optional details.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Bus Number */}
                  <div>
                    <label className={labelClass}>
                      Bus Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="busNumber"
                      value={form.busNumber}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="e.g. NB-1234"
                      autoComplete="off"
                    />
                  </div>

                  {/* Driver Name */}
                  <div>
                    <label className={labelClass}>
                      Driver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="driverName"
                      value={form.driverName}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Driver full name"
                      autoComplete="name"
                    />
                  </div>

                  {/* Route */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Route <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="route"
                      value={form.route}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="e.g. Colombo – Kandy"
                      autoComplete="off"
                    />
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className={labelClass}>Capacity</label>
                    <input
                      name="capacity"
                      type="number"
                      min="0"
                      value={form.capacity}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. 54"
                      inputMode="numeric"
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. +94 7X XXX XXXX"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Status Messages */}
                {status?.type === 'success' && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                    <div className="font-medium">{status.msg}</div>
                  </div>
                )}

                {status?.type === 'error' && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                    <div className="font-medium">{status.msg}</div>
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ busNumber: '', driverName: '', route: '', capacity: '', contact: '' });
                      setStatus(null);
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    Clear
                  </button>

                  <button
                    type="submit"
                    disabled={status?.type === 'loading'}
                    className={`inline-flex items-center justify-center rounded-xl px-4 py-2 font-semibold text-white shadow-sm transition
                      ${status?.type === 'loading'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200'}
                    `}
                  >
                    {status?.type === 'loading' ? 'Saving...' : 'Register Bus'}
                  </button>
                </div>
              </div>
            </form>

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
                  <th className="px-4 py-2">QR</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {buses.length === 0 && (
                  <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-500">No buses registered yet.</td></tr>
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
                    <td className="px-4 py-2">
                      {b.qrCode ? (
                        <img
                          src={b.qrCode}
                          alt={`QR for ${b.busNumber}`}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                          title="Click row to view full QR"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
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
                {/* QR Code display */}
                <div className="sm:col-span-2">
                  <div className="text-sm text-gray-500">QR Code</div>
                  {selectedBus.qrCode ? (
                    <img src={selectedBus.qrCode} alt="Bus QR" style={{ width: 160, height: 160 }} />
                  ) : (
                    <div className="text-gray-500">No QR available</div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <button onClick={() => setSelectedBus(null)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusRegistration;
