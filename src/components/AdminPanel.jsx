import React, { useState } from 'react';
import { db } from '../services/firebase'; 
import { ref, push, update, remove } from 'firebase/database';
import { Trash2, X, Plus, Save } from 'lucide-react';

const AdminPanel = ({ drivers }) => {
  const [showModal, setShowModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', team: '', points: 0 });
  
  // State for Race Result form
  const [results, setResults] = useState({
    p1: '', p2: '', p3: ''
  });

  const POINTS_MAP = {
    p1: 25, p2: 18, p3: 15, p4: 12, p5: 10, 
    p6: 8, p7: 6, p8: 4, p9: 2, p10: 1
  };

  // --- HANDLERS ---
  const handleAddDriver = (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.team) return;
    const driversRef = ref(db, 'drivers');
    push(driversRef, { ...newDriver, points: Number(newDriver.points) });
    setNewDriver({ name: '', team: '', points: 0 });
    setShowModal(false);
  };

  const submitRaceResults = async () => {
    if (!results.p1 || !results.p2 || !results.p3) {
      alert("Please fill P1, P2, and P3 results.");
      return;
    }

    for (const [pos, driverId] of Object.entries(results)) {
      const pointsToSet = POINTS_MAP[pos];
      const driver = drivers.find(d => d.id === driverId);
      
      if (driver) {
        const driverRef = ref(db, `drivers/${driverId}`);
        await update(driverRef, { points: Number(driver.points) + pointsToSet });
      }
    }

    alert("Championship Standings Updated!");
    setResults({ p1: '', p2: '', p3: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this driver?")) remove(ref(db, `drivers/${id}`));
  };

  // --- RENDER ---
  return (
    <div className="admin-view animate-in">
      <header className="view-header">
        <h1>ADMIN TELEMETRY</h1>
        <button className="f1-btn-main" onClick={() => setShowModal(true)}>
          <Plus size={18} /> REGISTER DRIVER
        </button>
      </header>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        {/* LEFT: RACE RESULTS ENTRY */}
        <section className="f1-card">
          <div className="card-header">
            <div className="red-tag"></div>
            <h3>SUBMIT RACE RESULTS</h3>
          </div>
          <div className="admin-form" style={{ padding: '15px' }}>
            <div className="input-group">
              <label>P1 (25 PTS)</label>
              <select className="f1-input" value={results.p1} onChange={e => setResults({...results, p1: e.target.value})}>
                <option value="">SELECT WINNER</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>P2 (18 PTS)</label>
              <select className="f1-input" value={results.p2} onChange={e => setResults({...results, p2: e.target.value})}>
                <option value="">SELECT SECOND</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>P3 (15 PTS)</label>
              <select className="f1-input" value={results.p3} onChange={e => setResults({...results, p3: e.target.value})}>
                <option value="">SELECT THIRD</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button className="f1-btn-main" style={{ width: '100%', marginTop: '10px' }} onClick={submitRaceResults}>
              <Save size={18} /> BROADCAST RESULTS
            </button>
          </div>
        </section>

        {/* RIGHT: CURRENT GRID */}
        <section className="f1-card">
          <div className="card-header">
            <div className="red-tag"></div>
            <h3>CURRENT GRID</h3>
          </div>
          <div className="driver-manage-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {drivers.map(d => (
              <div key={d.id} className="admin-driver-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #333', alignItems: 'center' }}>
                <div className="info">
                  <div className="name" style={{ fontWeight: 'bold' }}>{d.name}</div>
                  <div className="team" style={{ fontSize: '12px', color: '#888' }}>{d.team}</div>
                </div>
                <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span className="current-pts" style={{ fontWeight: 'bold', color: '#e10600' }}>{d.points} PTS</span>
                  <button onClick={() => handleDelete(d.id)} className="delete-btn" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content animate-in" style={{ background: '#1f1f27', padding: '30px', borderRadius: '8px', width: '400px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>REGISTER NEW ENTRY</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'white' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleAddDriver} className="admin-form">
              <div className="input-group">
                <label>DRIVER NAME</label>
                <input className="f1-input" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>TEAM NAME</label>
                <input className="f1-input" value={newDriver.team} onChange={e => setNewDriver({...newDriver, team: e.target.value})} required />
              </div>
              <button type="submit" className="f1-btn-main" style={{ width: '100%', marginTop: '10px' }}>CONFIRM GRID ENTRY</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;