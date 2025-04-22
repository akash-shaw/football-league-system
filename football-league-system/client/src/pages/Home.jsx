import { useState, useEffect } from 'react';
import { getUpcomingMatches, getPastMatches, getPointsTable, getAllTeams, getAllPlayers } from '../services/api';
import MatchCard from '../components/MatchCard';
import PointsTable from '../components/PointsTable';

function Home() {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [pointsTable, setPointsTable] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Home | Football League Management System";
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [upcomingData, pastData, tableData, teamsData, playersData] = await Promise.all([
          getUpcomingMatches(),
          getPastMatches(),
          getPointsTable(),
          getAllTeams(),
          getAllPlayers()
        ]);
        
        setUpcomingMatches(upcomingData);
        setPastMatches(pastData);
        setPointsTable(tableData);
        setTeams(teamsData);
        setPlayers(playersData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="jumbotron bg-light p-4 mb-4 rounded">
        <h1 className="display-4">Football League Management System</h1>
        <p className="lead">Welcome to our football league platform. View matches, standings, teams, and players.</p>
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
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
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'table' ? 'active' : ''}`}
                    onClick={() => setActiveTab('table')}
                  >
                    Points Table
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === 'upcoming' && (
                <>
                  <h5 className="card-title">Upcoming Matches</h5>
                  {upcomingMatches.length === 0 ? (
                    <p>No upcoming matches scheduled.</p>
                  ) : (
                    upcomingMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))
                  )}
                </>
              )}
              
              {activeTab === 'past' && (
                <>
                  <h5 className="card-title">Past Matches</h5>
                  {pastMatches.length === 0 ? (
                    <p>No past matches found.</p>
                  ) : (
                    pastMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))
                  )}
                </>
              )}
              
              {activeTab === 'table' && (
                <>
                  <h5 className="card-title">League Standings</h5>
                  {pointsTable.length === 0 ? (
                    <p>No standings data available.</p>
                  ) : (
                    <PointsTable data={pointsTable} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Teams</h5>
            </div>
            <div className="card-body">
              {teams.length === 0 ? (
                <p>No teams available.</p>
              ) : (
                <ul className="list-group">
                  {teams.map(team => (
                    <li key={team.id} className="list-group-item">
                      {team.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Players</h5>
            </div>
            <div className="card-body">
              {players.length === 0 ? (
                <p>No players available.</p>
              ) : (
                <ul className="list-group">
                  {players.slice(0, 10).map(player => (
                    <li key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'inline-block'
                      }}
                    >
                      {player.name || player.username} - {player.position || 'N/A'}
                    </span>
                    {player.team_name && <span className="badge bg-primary">{player.team_name}</span>}
                  </li>
                  ))}
                  {players.length > 10 && (
                    <li className="list-group-item text-center text-muted">
                      And {players.length - 10} more players...
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
