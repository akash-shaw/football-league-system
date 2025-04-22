import { useState, useEffect } from 'react';
import { getAllTeams, getTeamPlayers, updateTeam, addPlayerToTeam, removePlayerFromTeam, getAllPlayers, getTeamStatistics } from '../services/api';
import TeamStatistics from '../components/TeamStatistics';

function TeamManager() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    formation: '',
    strategy: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [activeSection, setActiveSection] = useState('team');

  useEffect(() => {
    document.title = "Team Management | Football League Management System";
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await getAllTeams();
        setTeams(teamsData);
        
        // Find team managed by current user
        const managedTeam = teamsData.find(team => team.manager_id === parseInt(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 0));
        
        if (managedTeam) {
          setSelectedTeam(managedTeam);
          setFormData({
            name: managedTeam.name || '',
            formation: managedTeam.formation || '',
            strategy: managedTeam.strategy || ''
          });
          
          // Fetch team players
          const playersData = await getTeamPlayers(managedTeam.id);
          setTeamPlayers(playersData);
          
          // Fetch all players to determine available players
          const allPlayers = await getAllPlayers();
          const availablePlayers = allPlayers.filter(player => 
            !player.team_id || player.team_id !== managedTeam.id
          );
          setAvailablePlayers(availablePlayers);

          // Fetch team statistics
          const statsData = await getTeamStatistics(managedTeam.id);
          setStatistics(statsData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load team data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedTeam = await updateTeam(selectedTeam.id, formData);
      setSelectedTeam(updatedTeam);
      
      // Update teams list
      setTeams(teams.map(team => 
        team.id === updatedTeam.id ? updatedTeam : team
      ));
      setSuccess('Team updated successfully!');
    } catch (error) {
      console.error('Error updating team:', error);
      setError('Failed to update team. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPlayer = async (playerId) => {
    try {
      setUpdating(true);
      await addPlayerToTeam(selectedTeam.id, playerId);
      
      // Refresh team players
      const playersData = await getTeamPlayers(selectedTeam.id);
      setTeamPlayers(playersData);
      
      // Update available players
      const allPlayers = await getAllPlayers();
      const availablePlayers = allPlayers.filter(player => 
        !player.team_id || player.team_id !== selectedTeam.id
      );
      setAvailablePlayers(availablePlayers);
      
      setSuccess('Player added to team successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      setError('Failed to add player. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      setUpdating(true);
      await removePlayerFromTeam(selectedTeam.id, playerId);
      
      // Refresh team players
      const playersData = await getTeamPlayers(selectedTeam.id);
      setTeamPlayers(playersData);
      
      // Update available players
      const allPlayers = await getAllPlayers();
      const availablePlayers = allPlayers.filter(player => 
        !player.team_id || player.team_id !== selectedTeam.id
      );
      setAvailablePlayers(availablePlayers);
      
      setSuccess('Player removed from team successfully!');
    } catch (error) {
      console.error('Error removing player:', error);
      setError('Failed to remove player. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Add a function to refresh statistics
  const refreshStatistics = async () => {
    if (selectedTeam) {
      try {
        const statsData = await getTeamStatistics(selectedTeam.id);
        setStatistics(statsData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (!selectedTeam) {
    return (
      <div className="alert alert-warning">
        You are not managing any team. Please contact a league administrator to be assigned as a team manager.
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Team Management</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}
            onClick={() => setActiveSection('team')}
          >
            Team Details
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeSection === 'players' ? 'active' : ''}`}
            onClick={() => setActiveSection('players')}
          >
            Players
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeSection === 'statistics' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('statistics');
              refreshStatistics();
            }}
          >
            Team Statistics
          </button>
        </li>
      </ul>
      
      {activeSection === 'team' && (
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Team Details</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="formation" className="form-label">Formation</label>
                <select
                  className="form-select"
                  id="formation"
                  name="formation"
                  value={formData.formation}
                  onChange={handleChange}
                >
                  <option value="">Select formation</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="4-3-3">4-3-3</option>
                  <option value="3-5-2">3-5-2</option>
                  <option value="5-3-2">5-3-2</option>
                  <option value="4-2-3-1">4-2-3-1</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="strategy" className="form-label">Strategy</label>
                <select
                  className="form-select"
                  id="strategy"
                  name="strategy"
                  value={formData.strategy}
                  onChange={handleChange}
                >
                  <option value="">Select strategy</option>
                  <option value="Attacking">Attacking</option>
                  <option value="Defensive">Defensive</option>
                  <option value="Possession">Possession</option>
                  <option value="Counter-attack">Counter-attack</option>
                  <option value="High Press">High Press</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={updating}
              >
                {updating ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </span>
                ) : 'Update Team'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {activeSection === 'players' && (
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Available Players</h4>
              </div>
              <div className="card-body">
                {availablePlayers.length === 0 ? (
                  <p>No available players to add.</p>
                ) : (
                  <div className="list-group">
                    {availablePlayers.map(player => (
                      <div key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{player.name || player.username}</strong>
                          {player.position && <span className="ms-2 badge bg-secondary">{player.position}</span>}
                        </div>
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => handleAddPlayer(player.id)}
                          disabled={updating}
                        >
                          Add to Team
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Team Players</h4>
              </div>
              <div className="card-body">
                {teamPlayers.length === 0 ? (
                  <p>No players in the team yet.</p>
                ) : (
                  <div className="list-group">
                    {teamPlayers.map(player => (
                      <div key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{player.name || player.username}</strong>
                          {player.position && <span className="ms-2 badge bg-primary">{player.position}</span>}
                        </div>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleRemovePlayer(player.id)}
                          disabled={updating}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeSection === 'statistics' && (
        <TeamStatistics statistics={statistics} />
      )}
    </div>
  );
}

export default TeamManager;
