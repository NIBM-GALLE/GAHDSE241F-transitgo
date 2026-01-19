import React, { useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BusRegistration = () => {
  const [form, setForm] = useState({
    busNumber: '',
    driverName: '',
    route: '',
    capacity: '',
    contact: ''
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.busNumber || !form.driverName || !form.route) {
      setStatus({ type: 'error', msg: 'Please fill all required fields.' });
      return;
    }

    setStatus({ type: 'loading' });

    try {
      await addDoc(collection(db, 'buses'), {
        busNumber: form.busNumber,
        driverName: form.driverName,
        route: form.route,
        capacity: form.capacity ? Number(form.capacity) : null,
        contact: form.contact || null,
        createdAt: serverTimestamp()
      });

      setStatus({ type: 'success', msg: 'Bus registered successfully 🚍' });
      setForm({ busNumber: '', driverName: '', route: '', capacity: '', contact: '' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Failed to register bus.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6">
        
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
      </div>
    </div>
  );
};

export default BusRegistration;
