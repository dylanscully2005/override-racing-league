import React, { useState, useEffect } from 'react';
import { db, auth } from './services/firebase';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Trophy, Calendar, Users, LogOut } from 'lucide-react';

// Import our custom components and hooks
import AuthForm from './components/AuthForm';
import AdminPanel from './components/AdminPanel';
import { useStandings } from './hooks/useStandings';
import './styles/App.css';

function App() {
  const [view, setView] = useState('standings'); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- ADMIN CONFIGURATION ---
  // Simply add your email (and any other staff) to this list:
  const adminEmails = ['dylan1@override.com'];

  useEffect(() => {
  const repo = "YOUR_GITHUB_USERNAME/YOUR_REPO_NAME"; // Change this!
  let currentCommit = "";

  const checkForUpdates = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/commits/main`);
      const data = await response.json();
      const latestCommit = data.sha;

      if (currentCommit && currentCommit !== latestCommit) {
        // If the hash changed, show the loading screen and refresh
        setIsUpdating(true);
        setTimeout(() => {
          window.location.reload(true); // Force reload from server
        }, 3000);
      } else {
        currentCommit = latestCommit;
      }
    } catch (err) {
      console.log("Update check failed:", err);
    }
  };

  // Check immediately on load
  checkForUpdates();

  // Check every 5 minutes
  const interval = setInterval(checkForUpdates, 300000); 
  return () => clearInterval(interval);
}, []);


  // --- 1. AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const driversRef = ref(db, 'drivers'); 
    const unsubscribe = onValue(driversRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const driverList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
          points: Number(value.points) || 0,
          color: value.color || '#e10600'
        }));
        setDrivers(driverList);
      } else {
        setDrivers([]); 
      }
    }, (error) => {
      console.error("Firebase Sync Error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Calculate standings
  const { sortedDrivers, constructorStandings } = useStandings(drivers);

  // Check if current user is an admin
  const isAdmin = currentUser?.email && adminEmails.some(email => 
    email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
  );

  // Show loading screen while Firebase checks auth status
  if (loading) {
    return (
      <div className="loading-screen">
        <h2 className="animate-pulse">INITIALIZING TERMINAL...</h2>
      </div>
    );
  }

  // If no user is logged in, show the Login/Register form
  if (!currentUser) {
    return <AuthForm setCurrentUser={setCurrentUser} />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="sidebar">
        <div className="logo-section">
          <h1 style={{color: 'white', margin: 0}}>ORL <span style={{color: '#e10600'}}>RL</span></h1>
          {isAdmin && <div className="admin-badge">ADMIN ACCESS</div>}
        </div>
        
        <nav style={{ flex: 1 }}>
          <div 
            className={`nav-item ${view === 'standings' ? 'active' : ''}`} 
            onClick={() => setView('standings')}
          >
            <Trophy size={20} /> STANDINGS
          </div>

          <div 
            className={`nav-item ${view === 'calendar' ? 'active' : ''}`} 
            onClick={() => setView('calendar')}
          >
            <Calendar size={20} /> CALENDAR
          </div>
          
          {isAdmin && (
            <div 
              className={`nav-item admin-nav-item ${view === 'admin' ? 'active' : ''}`} 
              onClick={() => setView('admin')}
            >
              <Users size={20} /> ADMIN TOOLS
            </div>
          )}
        </nav>

        <div className="user-info-section">
          <p className="user-email-display">{currentUser.email}</p>
          <button 
            className="nav-item logout-btn" 
            onClick={() => signOut(auth)}
            style={{ background: 'transparent', border: 'none', color: '#666', width: '100%', textAlign: 'left', cursor: 'pointer', padding: '10px 20px' }}
          >
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
        
        {view === 'standings' && (
          <div className="standings-view animate-in">
            <div className="view-header">
              <h1>CHAMPIONSHIP STANDINGS</h1>
            </div>
            
            <div className="standings-stack" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <section className="f1-card">
                <div className="card-header">
                  <div className="red-tag"></div>
                  <h3>WORLD DRIVER CHAMPIONSHIP</h3>
                </div>
                <table className="f1-table">
                  <thead>
                    <tr>
                      <th>POS</th>
                      <th>DRIVER</th>
                      <th>TEAM</th>
                      <th style={{ textAlign: 'right' }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDrivers.map((d, i) => (
                      <tr key={d.id || i} className={i === 0 ? "p1-row" : ""}>
                        <td className="pos-col">{i + 1}</td>
                        <td className="name-col">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '4px', height: '18px', backgroundColor: d.color, borderRadius: '2px' }}></div>
                            {d.name?.toUpperCase() || "UNKNOWN DRIVER"}
                          </div>
                        </td>
                        <td className="team-col">{d.team?.toUpperCase() || "PRIVATEER"}</td>
                        <td className="pts-col" style={{ fontWeight: 'bold' }}>{d.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="f1-card">
                <div className="card-header">
                  <div className="red-tag constructor-tag"></div>
                  <h3>WORLD CONSTRUCTOR CHAMPIONSHIP</h3>
                </div>
                <table className="f1-table">
                  <thead>
                    <tr>
                      <th>POS</th>
                      <th>CONSTRUCTOR</th>
                      <th style={{ textAlign: 'right' }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constructorStandings.map((team, i) => (
                      <tr key={team.name || i} className={i === 0 ? "p1-row" : ""}>
                        <td className="pos-col">{i + 1}</td>
                        <td className="name-col">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '4px', height: '18px', backgroundColor: team.color, borderRadius: '2px' }}></div>
                            {team.name || "UNKNOWN TEAM"}
                          </div>
                        </td>
                        <td className="pts-col" style={{ fontWeight: 'bold' }}>{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="calendar-view animate-in">
            <div className="view-header">
              <h1>RACE CALENDAR</h1>
            </div>
            <section className="f1-card">
              <p style={{opacity: 0.5, padding: '20px'}}>Schedules and track telemetry loading...</p>
            </section>
          </div>
        )}

        {view === 'admin' && (
          isAdmin ? (
            <AdminPanel drivers={drivers} />
          ) : (
            <div className="denied-container">
              <h2 style={{ color: '#e10600' }}>RESTRICTED AREA</h2>
              <p>Your credentials do not permit access to the Pit Wall Terminal.</p>
              <button className="f1-btn-main" onClick={() => setView('standings')}>Back to Standings</button>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;