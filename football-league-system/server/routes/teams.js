const express = require('express');
const pool = require('../db');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await pool.query('SELECT * FROM teams');
    res.json(teams.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const team = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (team.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create team (League Admin only)
router.post('/', auth, checkRole(['league_admin']), async (req, res) => {
  try {
    const { name, manager_id, formation, strategy } = req.body;
    
    const newTeam = await pool.query(
      'INSERT INTO teams (name, manager_id, formation, strategy) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, manager_id, formation, strategy]
    );
    
    res.status(201).json(newTeam.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update team (Team Manager only)
router.put('/:id', auth, checkRole(['team_manager', 'league_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, formation, strategy } = req.body;
    
    // Check if user is the team manager
    if (req.user.role === 'team_manager') {
      const teamCheck = await pool.query(
        'SELECT * FROM teams WHERE id = $1 AND manager_id = $2',
        [id, req.user.id]
      );
      
      if (teamCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You can only update your own team' });
      }
    }
    
    const updatedTeam = await pool.query(
      'UPDATE teams SET name = $1, formation = $2, strategy = $3 WHERE id = $4 RETURNING *',
      [name, formation, strategy, id]
    );
    
    if (updatedTeam.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(updatedTeam.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team players
router.get('/:id/players', async (req, res) => {
  try {
    const { id } = req.params;
    
    const players = await pool.query(
      'SELECT p.*, u.name, u.username, u.email FROM players p JOIN users u ON p.user_id = u.id WHERE p.team_id = $1',
      [id]
    );
    
    res.json(players.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add player to team (Team Manager only)
router.post('/:id/players', auth, checkRole(['team_manager', 'league_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { player_id } = req.body;
    
    // Check if user is the team manager
    if (req.user.role === 'team_manager') {
      const teamCheck = await pool.query(
        'SELECT * FROM teams WHERE id = $1 AND manager_id = $2',
        [id, req.user.id]
      );
      
      if (teamCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You can only update your own team' });
      }
    }
    
    // Update player's team
    const updatedPlayer = await pool.query(
      'UPDATE players SET team_id = $1 WHERE id = $2 RETURNING *',
      [id, player_id]
    );
    
    if (updatedPlayer.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json(updatedPlayer.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove player from team (Team Manager only)
router.delete('/:id/players/:playerId', auth, checkRole(['team_manager', 'league_admin']), async (req, res) => {
  try {
    const { id, playerId } = req.params;
    
    // Check if user is the team manager
    if (req.user.role === 'team_manager') {
      const teamCheck = await pool.query(
        'SELECT * FROM teams WHERE id = $1 AND manager_id = $2',
        [id, req.user.id]
      );
      
      if (teamCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You can only update your own team' });
      }
    }
    
    // Check if player is in the team
    const playerCheck = await pool.query(
      'SELECT * FROM players WHERE id = $1 AND team_id = $2',
      [playerId, id]
    );
    
    if (playerCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found in team' });
    }
    
    // Remove player from team
    const updatedPlayer = await pool.query(
      'UPDATE players SET team_id = NULL WHERE id = $1 RETURNING *',
      [playerId]
    );
    
    res.json(updatedPlayer.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team statistics (Team Manager or League Admin only)
router.get('/:id/statistics', auth, checkRole(['team_manager', 'league_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is the team manager (if not admin)
    if (req.user.role === 'team_manager') {
      const teamCheck = await pool.query(
        'SELECT * FROM teams WHERE id = $1 AND manager_id = $2',
        [id, req.user.id]
      );
      
      if (teamCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You can only view statistics for your own team' });
      }
    }
    
    // Get basic team info
    const teamInfo = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (teamInfo.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Get match history
    const matchHistory = await pool.query(
      `SELECT 
        m.id, m.match_date, m.home_score, m.away_score, m.status,
        CASE WHEN m.home_team_id = $1 THEN 'home' ELSE 'away' END AS venue,
        CASE 
          WHEN m.home_team_id = $1 AND m.home_score > m.away_score THEN 'win'
          WHEN m.away_team_id = $1 AND m.away_score > m.home_score THEN 'win'
          WHEN m.home_score = m.away_score THEN 'draw'
          ELSE 'loss'
        END AS result,
        CASE WHEN m.home_team_id = $1 THEN ot.name ELSE ht.name END AS opponent,
        s.name AS stadium
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams ot ON m.away_team_id = ot.id
      JOIN stadiums s ON m.stadium_id = s.id
      WHERE (m.home_team_id = $1 OR m.away_team_id = $1) 
        AND m.status = 'completed'
      ORDER BY m.match_date DESC`,
      [id]
    );
    
    // Calculate statistics
    const stats = await pool.query(
      `SELECT
        COUNT(*) AS total_matches,
        SUM(CASE 
          WHEN (m.home_team_id = $1 AND m.home_score > m.away_score) OR 
               (m.away_team_id = $1 AND m.away_score > m.home_score) THEN 1 
          ELSE 0 
        END) AS wins,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) AS draws,
        SUM(CASE 
          WHEN (m.home_team_id = $1 AND m.home_score < m.away_score) OR 
               (m.away_team_id = $1 AND m.away_score < m.home_score) THEN 1 
          ELSE 0 
        END) AS losses,
        SUM(CASE WHEN m.home_team_id = $1 THEN m.home_score ELSE m.away_score END) AS goals_for,
        SUM(CASE WHEN m.home_team_id = $1 THEN m.away_score ELSE m.home_score END) AS goals_against
      FROM matches m
      WHERE (m.home_team_id = $1 OR m.away_team_id = $1) AND m.status = 'completed'`,
      [id]
    );
    
    // Get recent form (last 5 matches)
    const recentForm = await pool.query(
      `SELECT 
        CASE 
          WHEN (m.home_team_id = $1 AND m.home_score > m.away_score) OR 
               (m.away_team_id = $1 AND m.away_score > m.home_score) THEN 'W'
          WHEN m.home_score = m.away_score THEN 'D'
          ELSE 'L'
        END AS result
      FROM matches m
      WHERE (m.home_team_id = $1 OR m.away_team_id = $1) 
        AND m.status = 'completed'
      ORDER BY m.match_date DESC
      LIMIT 5`,
      [id]
    );
    
    // Calculate additional metrics
    const totalMatches = parseInt(stats.rows[0].total_matches) || 0;
    const wins = parseInt(stats.rows[0].wins) || 0;
    const draws = parseInt(stats.rows[0].draws) || 0;
    const losses = parseInt(stats.rows[0].losses) || 0;
    const goalsFor = parseInt(stats.rows[0].goals_for) || 0;
    const goalsAgainst = parseInt(stats.rows[0].goals_against) || 0;
    
    const winPercentage = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : 0;
    const drawPercentage = totalMatches > 0 ? ((draws / totalMatches) * 100).toFixed(2) : 0;
    const lossPercentage = totalMatches > 0 ? ((losses / totalMatches) * 100).toFixed(2) : 0;
    const averageGoalsScored = totalMatches > 0 ? (goalsFor / totalMatches).toFixed(2) : 0;
    const averageGoalsConceded = totalMatches > 0 ? (goalsAgainst / totalMatches).toFixed(2) : 0;
    
    // Compile and return all statistics
    res.json({
      team: teamInfo.rows[0],
      matches: matchHistory.rows,
      stats: {
        totalMatches,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        winPercentage,
        drawPercentage,
        lossPercentage,
        averageGoalsScored,
        averageGoalsConceded,
        points: wins * 3 + draws,
        recentForm: recentForm.rows.map(m => m.result)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
