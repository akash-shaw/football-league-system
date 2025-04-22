import { useState, useEffect } from 'react';
import { getRefereeUpcomingMatches, getRefereePastMatches } from '../services/api';
import MatchCard from '../components/MatchCard';

function RefereeSchedule() {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Referee | Football League Management System";
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        const [upcomingData, pastData] = await Promise.all([
          getRefereeUpcomingMatches(),
          getRefereePastMatches()
        ]);
        
        setUpcomingMatches(upcomingData);
        setPastMatches(pastData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to load match data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Referee Schedule</h2>
      
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Matches
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Matches
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'upcoming' && (
            <>
              <h5 className="card-title">Your Upcoming Matches</h5>
              {upcomingMatches.length === 0 ? (
                <p>No upcoming matches assigned to you.</p>
              ) : (
                upcomingMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))
              )}
            </>
          )}
          
          {activeTab === 'past' && (
            <>
              <h5 className="card-title">Your Past Matches</h5>
              {pastMatches.length === 0 ? (
                <p>No past matches found.</p>
              ) : (
                pastMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RefereeSchedule;
