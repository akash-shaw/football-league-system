import { useState, useEffect } from 'react';
import { 
  getAllTeams, getAllStadiums, getAllMatches, 
  createTeam, createPlayer, createStadium, createMatch, updateMatchScore , getAllTeamManagers, getPlayerUsers
} from '../services/api';

function LeagueAdmin() {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [teamForm, setTeamForm] = useState({ name: '', manager_id: '', formation: '', strategy: '' });
  const [playerForm, setPlayerForm] = useState({ user_id: '', team_id: '', position: '', age: '', height: '', weight: '' });
  const [stadiumForm, setStadiumForm] = useState({ name: '', location: '', capacity: '', manager_id: '' });
  const [matchForm, setMatchForm] = useState({ home_team_id: '', away_team_id: '', stadium_id: '', referee_id: '', match_date: '' });
  const [scoreForm, setScoreForm] = useState({ match_id: '', home_score: '', away_score: '' });
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [teamsData, playersData, stadiumsData, matchesData, managersData] = await Promise.all([
          getAllTeams(),
          // getAllPlayers(),
          getPlayerUsers(),
          getAllStadiums(),
          getAllMatches(),
          getAllTeamManagers()
        ]);
        
        setTeams(teamsData);
        setPlayers(playersData);
        setStadiums(stadiumsData);
        setMatches(matchesData);
        setManagers(managersData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const newTeam = await createTeam(teamForm);
      setTeams([...teams, newTeam]);
      setTeamForm({ name: '', manager_id: '', formation: '', strategy: '' });
      setSuccess('Team created successfully!');
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team. Please try again.');
    }
  };

  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const newPlayer = await createPlayer(playerForm);
      setPlayers([...players, newPlayer]);
      setPlayerForm({ user_id: '', team_id: '', position: '', age: '', height: '', weight: '' });
      setSuccess('Player created successfully!');
    } catch (error) {
      console.error('Error creating player:', error);
      setError('Failed to create player. Please try again.');
    }
  };

  const handleStadiumSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const newStadium = await createStadium(stadiumForm);
      setStadiums([...stadiums, newStadium]);
      setStadiumForm({ name: '', location: '', capacity: '', manager_id: '' });
      setSuccess('Stadium created successfully!');
    } catch (error) {
      console.error('Error creating stadium:', error);
      setError('Failed to create stadium. Please try again.');
    }
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const newMatch = await createMatch(matchForm);
      setMatches([...matches, newMatch]);
      setMatchForm({ home_team_id: '', away_team_id: '', stadium_id: '', referee_id: '', match_date: '' });
      setSuccess('Match created successfully!');
    } catch (error) {
      console.error('Error creating match:', error);
      setError('Failed to create match. Please try again.');
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const updatedMatch = await updateMatchScore(scoreForm.match_id, {
        home_score: scoreForm.home_score,
        away_score: scoreForm.away_score,
        status: 'completed'
      });
      
      setMatches(matches.map(match => 
        match.id === updatedMatch.id ? updatedMatch : match
      ));
      
      setScoreForm({ match_id: '', home_score: '', away_score: '' });
      setSuccess('Match score updated successfully!');
    } catch (error) {
      console.error('Error updating score:', error);
      setError('Failed to update score. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div>
      <h2 className="mb-4">League Administration</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stadiums' ? 'active' : ''}`}
            onClick={() => setActiveTab('stadiums')}
          >
            Stadiums
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'scores' ? 'active' : ''}`}
            onClick={() => setActiveTab('scores')}
          >
            Update Scores
          </button>
        </li>
      </ul>
      
      <div className="tab-content">
        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div>
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Create Team</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleTeamSubmit}>
                      <div className="mb-3">
                        <label htmlFor="team-name" className="form-label">Team Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="team-name"
                          value={teamForm.name}
                          onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="team-manager" className="form-label">Team Manager</label>
                        <select
                          className="form-select"
                          id="team-manager"
                          value={teamForm.manager_id}
                          onChange={(e) => setTeamForm({...teamForm, manager_id: e.target.value})}
                          required
                        >
                          <option value="">Select Manager</option>
                          {managers.map(manager => (
                            <option key={manager.id} value={manager.id}>
                              {manager.name || manager.username}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="team-formation" className="form-label">Formation</label>
                        <select
                          className="form-select"
                          id="team-formation"
                          value={teamForm.formation}
                          onChange={(e) => setTeamForm({...teamForm, formation: e.target.value})}
                        >
                          <option value="">Select Formation</option>
                          <option value="4-4-2">4-4-2</option>
                          <option value="4-3-3">4-3-3</option>
                          <option value="3-5-2">3-5-2</option>
                          <option value="5-3-2">5-3-2</option>
                          <option value="4-2-3-1">4-2-3-1</option>
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="team-strategy" className="form-label">Strategy</label>
                        <select
                          className="form-select"
                          id="team-strategy"
                          value={teamForm.strategy}
                          onChange={(e) => setTeamForm({...teamForm, strategy: e.target.value})}
                        >
                          <option value="">Select Strategy</option>
                          <option value="Attacking">Attacking</option>
                          <option value="Defensive">Defensive</option>
                          <option value="Possession">Possession</option>
                          <option value="Counter-attack">Counter-attack</option>
                          <option value="High Press">High Press</option>
                        </select>
                      </div>
                      
                      <button type="submit" className="btn btn-primary">Create Team</button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Teams List</h5>
                  </div>
                  <div className="card-body">
                    {teams.length === 0 ? (
                      <p>No teams available.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Formation</th>
                              <th>Strategy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teams.map(team => (
                              <tr key={team.id}>
                                <td>{team.id}</td>
                                <td>{team.name}</td>
                                <td>{team.formation || 'N/A'}</td>
                                <td>{team.strategy || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Players Tab */}
        {activeTab === 'players' && (
          <div>
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Create Player</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handlePlayerSubmit}>
                    <div className="mb-3">
                      <label htmlFor="player-user" className="form-label">User</label>
                      <select
                        className="form-select"
                        id="player-user"
                        value={playerForm.user_id}
                        onChange={(e) => setPlayerForm({...playerForm, user_id: e.target.value})}
                        required
                      >
                        <option value="">Select User</option>
                        {players && players.length > 0 ? 
                          players.filter(player => player.role === 'player').map(user => (
                            <option key={user.id} value={user.id}>
                              {user.username || user.name}
                            </option>
                          )) : 
                          <option value="" disabled>No users available</option>
                        }
                      </select>
                    </div>
                      
                      <div className="mb-3">
                        <label htmlFor="player-team" className="form-label">Team</label>
                        <select
                          className="form-select"
                          id="player-team"
                          value={playerForm.team_id}
                          onChange={(e) => setPlayerForm({...playerForm, team_id: e.target.value})}
                        >
                          <option value="">Select Team (Optional)</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="player-position" className="form-label">Position</label>
                        <select
                          className="form-select"
                          id="player-position"
                          value={playerForm.position}
                          onChange={(e) => setPlayerForm({...playerForm, position: e.target.value})}
                          required
                        >
                          <option value="">Select Position</option>
                          <option value="Goalkeeper">Goalkeeper</option>
                          <option value="Defender">Defender</option>
                          <option value="Midfielder">Midfielder</option>
                          <option value="Forward">Forward</option>
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="player-age" className="form-label">Age</label>
                        <input
                          type="number"
                          className="form-control"
                          id="player-age"
                          value={playerForm.age}
                          onChange={(e) => setPlayerForm({...playerForm, age: e.target.value})}
                          min="15"
                          max="50"
                          required
                        />
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="player-height" className="form-label">Height (cm)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="player-height"
                              value={playerForm.height}
                              onChange={(e) => setPlayerForm({...playerForm, height: e.target.value})}
                              step="0.1"
                              min="150"
                              max="220"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="player-weight" className="form-label">Weight (kg)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="player-weight"
                              value={playerForm.weight}
                              onChange={(e) => setPlayerForm({...playerForm, weight: e.target.value})}
                              step="0.1"
                              min="40"
                              max="150"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button type="submit" className="btn btn-primary">Create Player</button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Players List</h5>
                  </div>
                  <div className="card-body">
                    {players.length === 0 ? (
                      <p>No players available.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Position</th>
                              <th>Team</th>
                            </tr>
                          </thead>
                          <tbody>
                            {players.map(player => (
                              <tr key={player.id}>
                                <td>{player.id}</td>
                                <td>{player.name || player.username}</td>
                                <td>{player.position || 'N/A'}</td>
                                <td>{player.team_name || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Stadiums Tab */}
        {activeTab === 'stadiums' && (
          <div>
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Create Stadium</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleStadiumSubmit}>
                      <div className="mb-3">
                        <label htmlFor="stadium-name" className="form-label">Stadium Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="stadium-name"
                          value={stadiumForm.name}
                          onChange={(e) => setStadiumForm({...stadiumForm, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="stadium-location" className="form-label">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          id="stadium-location"
                          value={stadiumForm.location}
                          onChange={(e) => setStadiumForm({...stadiumForm, location: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="stadium-capacity" className="form-label">Capacity</label>
                        <input
                          type="number"
                          className="form-control"
                          id="stadium-capacity"
                          value={stadiumForm.capacity}
                          onChange={(e) => setStadiumForm({...stadiumForm, capacity: e.target.value})}
                          min="1000"
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="stadium-manager" className="form-label">Stadium Manager</label>
                        <select
                          className="form-select"
                          id="stadium-manager"
                          value={stadiumForm.manager_id}
                          onChange={(e) => setStadiumForm({...stadiumForm, manager_id: e.target.value})}
                          required
                        >
                          <option value="">Select Manager</option>
                          {players.filter(player => player.role === 'stadium_manager').map(manager => (
                            <option key={manager.id} value={manager.id}>
                              {manager.username}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <button type="submit" className="btn btn-primary">Create Stadium</button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Stadiums List</h5>
                  </div>
                  <div className="card-body">
                    {stadiums.length === 0 ? (
                      <p>No stadiums available.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Location</th>
                              <th>Capacity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stadiums.map(stadium => (
                              <tr key={stadium.id}>
                                <td>{stadium.id}</td>
                                <td>{stadium.name}</td>
                                <td>{stadium.location}</td>
                                <td>{stadium.capacity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div>
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Create Match</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleMatchSubmit}>
                      <div className="mb-3">
                        <label htmlFor="match-home" className="form-label">Home Team</label>
                        <select
                          className="form-select"
                          id="match-home"
                          value={matchForm.home_team_id}
                          onChange={(e) => setMatchForm({...matchForm, home_team_id: e.target.value})}
                          required
                        >
                          <option value="">Select Home Team</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="match-away" className="form-label">Away Team</label>
                        <select
                          className="form-select"
                          id="match-away"
                          value={matchForm.away_team_id}
                          onChange={(e) => setMatchForm({...matchForm, away_team_id: e.target.value})}
                          required
                        >
                          <option value="">Select Away Team</option>
                          {teams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="match-stadium" className="form-label">Stadium</label>
                        <select
                          className="form-select"
                          id="match-stadium"
                          value={matchForm.stadium_id}
                          onChange={(e) => setMatchForm({...matchForm, stadium_id: e.target.value})}
                          required
                        >
                          <option value="">Select Stadium</option>
                          {stadiums.map(stadium => (
                            <option key={stadium.id} value={stadium.id}>
                              {stadium.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="match-referee" className="form-label">Referee</label>
                        <select
                          className="form-select"
                          id="match-referee"
                          value={matchForm.referee_id}
                          onChange={(e) => setMatchForm({...matchForm, referee_id: e.target.value})}
                          required
                        >
                          <option value="">Select Referee</option>
                          {players.filter(player => player.role === 'referee').map(referee => (
                            <option key={referee.id} value={referee.id}>
                              {referee.username}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="match-date" className="form-label">Match Date & Time</label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="match-date"
                          value={matchForm.match_date}
                          onChange={(e) => setMatchForm({...matchForm, match_date: e.target.value})}
                          required
                        />
                      </div>
                      
                      <button type="submit" className="btn btn-primary">Create Match</button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Matches List</h5>
                  </div>
                  <div className="card-body">
                    {matches.length === 0 ? (
                      <p>No matches available.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Teams</th>
                              <th>Date</th>
                              <th>Status</th>
                              <th>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matches.map(match => (
                              <tr key={match.id}>
                                <td>{match.id}</td>
                                <td>{match.home_team} vs {match.away_team}</td>
                                <td>{new Date(match.match_date).toLocaleString()}</td>
                                <td>{match.status}</td>
                                <td>
                                  {match.status === 'completed' ? 
                                    `${match.home_score} - ${match.away_score}` : 
                                    'TBD'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Scores Tab */}
        {activeTab === 'scores' && (
          <div>
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">Update Match Score</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleScoreSubmit}>
                      <div className="mb-3">
                        <label htmlFor="score-match" className="form-label">Select Match</label>
                        <select
                          className="form-select"
                          id="score-match"
                          value={scoreForm.match_id}
                          onChange={(e) => setScoreForm({...scoreForm, match_id: e.target.value})}
                          required
                        >
                          <option value="">Select Match</option>
                          {matches
                            .filter(match => match.status !== 'completed')
                            .map(match => (
                              <option key={match.id} value={match.id}>
                                {match.home_team} vs {match.away_team} ({new Date(match.match_date).toLocaleDateString()})
                              </option>
                            ))}
                        </select>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="home-score" className="form-label">Home Score</label>
                            <input
                              type="number"
                              className="form-control"
                              id="home-score"
                              value={scoreForm.home_score}
                              onChange={(e) => setScoreForm({...scoreForm, home_score: e.target.value})}
                              min="0"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="away-score" className="form-label">Away Score</label>
                            <input
                              type="number"
                              className="form-control"
                              id="away-score"
                              value={scoreForm.away_score}
                              onChange={(e) => setScoreForm({...scoreForm, away_score: e.target.value})}
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button type="submit" className="btn btn-primary">Update Score</button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Completed Matches</h5>
                  </div>
                  <div className="card-body">
                    {matches.filter(match => match.status === 'completed').length === 0 ? (
                      <p>No completed matches available.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Teams</th>
                              <th>Date</th>
                              <th>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {matches
                              .filter(match => match.status === 'completed')
                              .map(match => (
                                <tr key={match.id}>
                                  <td>{match.id}</td>
                                  <td>{match.home_team} vs {match.away_team}</td>
                                  <td>{new Date(match.match_date).toLocaleDateString()}</td>
                                  <td>{match.home_score} - {match.away_score}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeagueAdmin;

