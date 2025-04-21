import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PlayerProfile from './pages/PlayerProfile';
import TeamManager from './pages/TeamManager';
import RefereeSchedule from './pages/RefereeSchedule';
import StadiumManager from './pages/StadiumManager';
import LeagueAdmin from './pages/LeagueAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} handleLogout={handleLogout} />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            
            <Route path="/player-profile" element={
              <ProtectedRoute user={user} role="player">
                <PlayerProfile user={user} />
              </ProtectedRoute>
            } />
            
            <Route path="/team-manager" element={
              <ProtectedRoute user={user} role="team_manager">
                <TeamManager user={user} />
              </ProtectedRoute>
            } />
            
            <Route path="/referee-schedule" element={
              <ProtectedRoute user={user} role="referee">
                <RefereeSchedule user={user} />
              </ProtectedRoute>
            } />
            
            <Route path="/stadium-manager" element={
              <ProtectedRoute user={user} role="stadium_manager">
                <StadiumManager user={user} />
              </ProtectedRoute>
            } />
            
            <Route path="/league-admin" element={
              <ProtectedRoute user={user} role="league_admin">
                <LeagueAdmin user={user} />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
