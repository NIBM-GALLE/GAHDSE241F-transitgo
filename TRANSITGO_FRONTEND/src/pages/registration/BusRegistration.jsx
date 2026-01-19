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
    // basic validation
    if (!form.busNumber || !form.driverName || !form.route) {
      setStatus({ type: 'error', msg: 'Please fill required fields.' });
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
      setStatus({ type: 'success', msg: 'Bus registered successfully.' });
      setForm({ busNumber: '', driverName: '', route: '', capacity: '', contact: '' });
    } catch (error) {
      console.error('Firestore write error:', error);
      setStatus({ type: 'error', msg: 'Failed to register bus.' });
    }
  };

  return (
    <div>
      <h2>Bus Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Bus Number *</label>
          <input name="busNumber" value={form.busNumber} onChange={handleChange} />
        </div>
        <div>
          <label>Driver Name *</label>
          <input name="driverName" value={form.driverName} onChange={handleChange} />
        </div>
        <div>
          <label>Route *</label>
          <input name="route" value={form.route} onChange={handleChange} />
        </div>
        <div>
          <label>Capacity</label>
          <input name="capacity" value={form.capacity} onChange={handleChange} type="number" />
        </div>
        <div>
          <label>Contact</label>
          <input name="contact" value={form.contact} onChange={handleChange} />
        </div>
        <button type="submit" disabled={status?.type === 'loading'}>
          {status?.type === 'loading' ? 'Saving...' : 'Register Bus'}
        </button>
      </form>

      {status?.type === 'success' && <p style={{ color: 'green' }}>{status.msg}</p>}
      {status?.type === 'error' && <p style={{ color: 'red' }}>{status.msg}</p>}
    </div>
  );
};

export default BusRegistration;