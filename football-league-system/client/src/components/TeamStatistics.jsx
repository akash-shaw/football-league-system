import { useState } from 'react';
import { usePDF } from 'react-to-pdf';

function TeamStatistics({ statistics }) {
  const [activeTab, setActiveTab] = useState('summary');
  const { toPDF, targetRef } = usePDF({
    filename: `${statistics?.team?.name || 'team'}_statistics.pdf`,
    page: { margin: 10 }
  });
  
  if (!statistics) {
    return <div>Loading statistics...</div>;
  }
  
  const { team, matches, stats } = statistics;
  
  // Convert percentages to degrees for the conic gradient
  const winDegrees = Math.round(3.6 * stats.winPercentage);
  const drawDegrees = Math.round(3.6 * stats.drawPercentage);
  
  // Create the conic gradient string using degrees
  const pieChartBackground = `conic-gradient(
    #28a745 0deg ${winDegrees}deg, 
    #ffc107 ${winDegrees}deg ${winDegrees + drawDegrees}deg, 
    #dc3545 ${winDegrees + drawDegrees}deg 360deg
  )`;
  
  return (
    <>
      {/* Hidden component containing all content for PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }} ref={targetRef}>
        <div style={{ padding: '20px', maxWidth: '800px' }}>
          <h2>Team Statistics: {team.name}</h2>
          
          <h3 style={{ marginTop: '20px' }}>Summary</h3>
          <div style={{ marginBottom: '20px' }}>
            <h4>Match Statistics</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Total Matches</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.totalMatches}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Wins</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.wins}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Draws</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.draws}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Losses</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.losses}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Win Percentage</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.winPercentage}%</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Points</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.points}</td>
                </tr>
              </tbody>
            </table>
            
            <h4>Goal Statistics</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Goals Scored</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.goalsFor}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Goals Conceded</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.goalsAgainst}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Goal Difference</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.goalDifference}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Avg. Goals Scored</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.averageGoalsScored}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Avg. Goals Conceded</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.averageGoalsConceded}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3 style={{ marginTop: '20px', pageBreakBefore: 'always' }}>Match History</h3>
          {matches.length === 0 ? (
            <p>No match history available.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>Date</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>Opponent</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>Venue</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>Result</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>Score</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f2f2f2' }}>Stadium</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(match => (
                  <tr key={match.id}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(match.match_date).toLocaleDateString()}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{match.opponent}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{match.venue === 'home' ? 'Home' : 'Away'}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{match.result.toUpperCase()}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                      {match.venue === 'home' ? 
                        `${match.home_score} - ${match.away_score}` : 
                        `${match.away_score} - ${match.home_score}`}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{match.stadium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <h3 style={{ marginTop: '20px', pageBreakBefore: 'always' }}>Form Analysis</h3>
          <div style={{ marginBottom: '20px' }}>
            <h4>Recent Form</h4>
            <div style={{ display: 'flex', marginBottom: '20px' }}>
              {stats.recentForm.map((result, index) => (
                <div 
                  key={index} 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: result === 'W' ? '#28a745' : result === 'D' ? '#ffc107' : '#dc3545',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  {result}
                </div>
              ))}
            </div>
            
            <h4>Performance Trends</h4>
            <p>The team has won {stats.wins} out of the last {stats.totalMatches} matches, with a win percentage of {stats.winPercentage}%.</p>
            
            <h4>Win-Loss-Draw Distribution</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Wins</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.wins} ({stats.winPercentage}%)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Draws</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.draws} ({stats.drawPercentage}%)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>Losses</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{stats.losses} ({stats.lossPercentage}%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Visible component with tabs */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Team Statistics: {team.name}</h4>
          <button 
            className="btn btn-primary" 
            onClick={() => toPDF()}
          >
            Export as PDF
          </button>
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
                  <h6>Win-Loss-Draw Distribution</h6>
                  <div className="progress" style={{ height: '25px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${stats.winPercentage}%` }}
                    >
                      Wins ({stats.wins})
                    </div>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: `${stats.drawPercentage}%` }}
                    >
                      Draws ({stats.draws})
                    </div>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: `${stats.lossPercentage}%` }}
                    >
                      Losses ({stats.losses})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TeamStatistics;
