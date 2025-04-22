import { useState } from 'react';

function TeamStatistics({ statistics }) {
  const [activeTab, setActiveTab] = useState('summary');
  
  if (!statistics) {
    return <div>Loading statistics...</div>;
  }
  
  const { team, matches, stats } = statistics;
  
  // Convert percentages to degrees for the conic gradient
  const winDegrees = Math.round(3.6 * stats.winPercentage);
  const drawDegrees = Math.round(3.6 * stats.drawPercentage);
//   const lossDegrees = 360 - winDegrees - drawDegrees;
  
  // Create the conic gradient string using degrees instead of percentages
  const pieChartBackground = `conic-gradient(
    #28a745 0deg ${winDegrees}deg, 
    #ffc107 ${winDegrees}deg ${winDegrees + drawDegrees}deg, 
    #dc3545 ${winDegrees + drawDegrees}deg 360deg
  )`;
  
  return (
    <div className="card">
      <div className="card-header">
        <h4 className="mb-0">Team Statistics: {team.name}</h4>
      </div>
      <div className="card-body">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              Match History
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              Form Analysis
            </button>
          </li>
        </ul>
        
        {activeTab === 'summary' && (
          <div>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title">Matches</h5>
                    <h2>{stats.totalMatches}</h2>
                    <div className="d-flex justify-content-around mt-2">
                      <div className="text-success">W: {stats.wins}</div>
                      <div className="text-warning">D: {stats.draws}</div>
                      <div className="text-danger">L: {stats.losses}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title">Win Rate</h5>
                    <h2>{stats.winPercentage}%</h2>
                    <div className="progress mt-2">
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${stats.winPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h5 className="card-title">Points</h5>
                    <h2>{stats.points}</h2>
                    <small>({stats.wins} wins × 3) + {stats.draws} draws</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <h5>Goal Statistics</h5>
                <table className="table">
                  <tbody>
                    <tr>
                      <td>Goals Scored</td>
                      <td>{stats.goalsFor}</td>
                    </tr>
                    <tr>
                      <td>Goals Conceded</td>
                      <td>{stats.goalsAgainst}</td>
                    </tr>
                    <tr>
                      <td>Goal Difference</td>
                      <td>{stats.goalDifference}</td>
                    </tr>
                    <tr>
                      <td>Avg. Goals Scored</td>
                      <td>{stats.averageGoalsScored}</td>
                    </tr>
                    <tr>
                      <td>Avg. Goals Conceded</td>
                      <td>{stats.averageGoalsConceded}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h5>Performance Breakdown</h5>
                <div className="chart-container">
                  <div className="d-flex justify-content-center">
                    <div 
                      className="rounded-circle" 
                      style={{ 
                        width: '200px', 
                        height: '200px', 
                        background: pieChartBackground
                      }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-center mt-3">
                    <div className="d-flex align-items-center me-3">
                      <div className="bg-success" style={{ width: '15px', height: '15px', marginRight: '5px' }}></div>
                      <span>Wins ({stats.winPercentage}%)</span>
                    </div>
                    <div className="d-flex align-items-center me-3">
                      <div className="bg-warning" style={{ width: '15px', height: '15px', marginRight: '5px' }}></div>
                      <span>Draws ({stats.drawPercentage}%)</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="bg-danger" style={{ width: '15px', height: '15px', marginRight: '5px' }}></div>
                      <span>Losses ({stats.lossPercentage}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'matches' && (
          <div>
            <h5>Match History</h5>
            {matches.length === 0 ? (
              <p>No match history available.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Opponent</th>
                      <th>Venue</th>
                      <th>Result</th>
                      <th>Score</th>
                      <th>Stadium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map(match => (
                      <tr key={match.id}>
                        <td>{new Date(match.match_date).toLocaleDateString()}</td>
                        <td>{match.opponent}</td>
                        <td>{match.venue === 'home' ? 'Home' : 'Away'}</td>
                        <td>
                          <span className={`badge ${
                            match.result === 'win' ? 'bg-success' : 
                            match.result === 'draw' ? 'bg-warning' : 'bg-danger'
                          }`}>
                            {match.result.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {match.venue === 'home' ? 
                            `${match.home_score} - ${match.away_score}` : 
                            `${match.away_score} - ${match.home_score}`}
                        </td>
                        <td>{match.stadium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'form' && (
          <div>
            <h5>Recent Form</h5>
            <div className="d-flex mb-4">
              {stats.recentForm.map((result, index) => (
                <div 
                  key={index} 
                  className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${
                    result === 'W' ? 'bg-success' : 
                    result === 'D' ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: '40px', height: '40px', color: 'white', fontWeight: 'bold' }}
                >
                  {result}
                </div>
              ))}
            </div>
            
            <h5>Performance Trends</h5>
            <p>The team has won {stats.wins} out of the last {stats.totalMatches} matches, with a win percentage of {stats.winPercentage}%.</p>
            
            <div className="row mt-4">
              <div className="col-md-12">
                <h6>Goals Scored vs Conceded</h6>
                <div className="chart-container p-3 border rounded">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Goals Scored: {stats.goalsFor}</span>
                    <span>Goals Conceded: {stats.goalsAgainst}</span>
                  </div>
                  <div className="progress" style={{ height: '25px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${(stats.goalsFor / (stats.goalsFor + stats.goalsAgainst)) * 100}%` }}
                    >
                      {stats.goalsFor}
                    </div>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: `${(stats.goalsAgainst / (stats.goalsFor + stats.goalsAgainst)) * 100}%` }}
                    >
                      {stats.goalsAgainst}
                    </div>
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

export default TeamStatistics;
