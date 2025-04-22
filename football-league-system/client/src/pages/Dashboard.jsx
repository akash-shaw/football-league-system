import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../services/api';

function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfile(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header">
          <h4 className="mb-0">Dashboard</h4>
        </div>
        <div className="card-body">
          <h5>Welcome, {profile?.name || profile?.username}!</h5>
          <p>Your role: <span className="badge bg-primary">{profile?.role.replace('_', ' ')}</span></p>
          <p>Email: {profile?.email}</p>
          
          <div className="mt-4">
            <h6>Quick Links</h6>
            <div className="list-group">
              {user.role === 'league_admin' && (
                <Link to="/league-admin" className="list-group-item list-group-item-action">
                  League Administration Panel
                </Link>
              )}
              
              {user.role === 'team_manager' && (
                <Link to="/team-manager" className="list-group-item list-group-item-action">
                  Manage Your Team
                </Link>
              )}
              
              {user.role === 'player' && (
                <Link to="/player-profile" className="list-group-item list-group-item-action">
                  View Player Profile
                </Link>
              )}
              
              {user.role === 'referee' && (
                <Link to="/referee-schedule" className="list-group-item list-group-item-action">
                  View Match Schedule
                </Link>
              )}
              
              {user.role === 'stadium_manager' && (
                <Link to="/stadium-manager" className="list-group-item list-group-item-action">
                  Manage Stadium
                </Link>
              )}
              
              <Link to="/" className="list-group-item list-group-item-action">
                View League Homepage
              </Link>
              
              <a 
                href="/manual.html" 
                className="list-group-item list-group-item-action"
                target="_blank" 
                rel="noopener noreferrer"
              >
                User Manual
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
