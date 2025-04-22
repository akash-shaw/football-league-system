const express = require('express');
const pool = require('../db');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await pool.query(
      'SELECT p.*, u.username, u.email, u.name, t.name as team_name FROM players p ' +
      'LEFT JOIN users u ON p.user_id = u.id ' +
      'LEFT JOIN teams t ON p.team_id = t.id'
    );
    res.json(players.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await pool.query(
      'SELECT p.*, u.username, u.email, u.name, t.name as team_name FROM players p ' +
      'LEFT JOIN users u ON p.user_id = u.id ' +
      'LEFT JOIN teams t ON p.team_id = t.id ' +
      'WHERE p.id = $1',
      [id]
    );
    
    if (player.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    res.json(player.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create player (League Admin only)
router.post('/', auth, checkRole(['league_admin']), async (req, res) => {
  try {
    const { user_id, team_id, position, age, height, weight } = req.body;
    
    const newPlayer = await pool.query(
      'INSERT INTO players (user_id, team_id, position, age, height, weight) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, team_id, position, age, height, weight]
    );
    
    res.status(201).json(newPlayer.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update player (Player or League Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, age, height, weight } = req.body;
    
    // Check if user is the player or league admin
    if (req.user.role !== 'league_admin') {
      const playerCheck = await pool.query(
        'SELECT * FROM players WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      
      if (playerCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You can only update your own profile' });
      }
    }
    
    // First update the user's name in the users table
    if (name) {
      await pool.query(
        'UPDATE users SET name = $1 WHERE id = (SELECT user_id FROM players WHERE id = $2)',
        [name, id]
      );
    }
    
    // Then update the player profile
    const updatedPlayer = await pool.query(
      'UPDATE players SET position = $1, age = $2, height = $3, weight = $4 WHERE id = $5 RETURNING *',
      [position, age, height, weight, id]
    );
    
    if (updatedPlayer.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Get the updated player with the user's name
    const playerWithName = await pool.query(
      'SELECT p.*, u.name, u.username FROM players p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [id]
    );
    
    res.json(playerWithName.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player profile for logged in user
router.get('/profile/me', auth, checkRole(['player']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const player = await pool.query(
      'SELECT p.*, t.name as team_name, u.name, u.username FROM players p ' +
      'LEFT JOIN teams t ON p.team_id = t.id ' +
      'LEFT JOIN users u ON p.user_id = u.id ' +
      'WHERE p.user_id = $1',
      [userId]
    );
    
    if (player.rows.length === 0) {
      return res.status(404).json({ message: 'Player profile not found' });
    }
    
    res.json(player.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get player statistics (Player or League Admin only)
router.get('/:id/statistics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is the player or league admin
    if (req.user.role !== 'league_admin') {
      const playerCheck = await pool.query(
        'SELECT * FROM players WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      
      if (playerCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You can only view your own statistics' });
      }
    }
    
    // Get basic player info
    const playerInfo = await pool.query(
      'SELECT p.*, u.username, u.name, t.name as team_name FROM players p ' +
      'LEFT JOIN users u ON p.user_id = u.id ' +
      'LEFT JOIN teams t ON p.team_id = t.id ' +
      'WHERE p.id = $1',
      [id]
    );
    
    if (playerInfo.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Get match participation
    const matchParticipation = await pool.query(
      `SELECT 
        m.id, m.match_date, m.home_score, m.away_score, m.status,
        ht.name as home_team, at.name as away_team,
        s.name as stadium,
        CASE WHEN p.team_id = m.home_team_id THEN 'home' ELSE 'away' END AS venue,
        CASE 
          WHEN (p.team_id = m.home_team_id AND m.home_score > m.away_score) OR 
               (p.team_id = m.away_team_id AND m.away_score > m.home_score) THEN 'win'
          WHEN m.home_score = m.away_score THEN 'draw'
          ELSE 'loss'
        END AS result
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN stadiums s ON m.stadium_id = s.id
      JOIN players p ON p.team_id IN (m.home_team_id, m.away_team_id)
      WHERE p.id = $1 AND m.status = 'completed'
      ORDER BY m.match_date DESC`,
      [id]
    );
    
    // Calculate statistics
    const stats = await pool.query(
      `SELECT
        COUNT(m.id) AS total_matches,
        SUM(CASE 
          WHEN (p.team_id = m.home_team_id AND m.home_score > m.away_score) OR 
               (p.team_id = m.away_team_id AND m.away_score > m.home_score) THEN 1 
          ELSE 0 
        END) AS wins,
        SUM(CASE WHEN m.home_score = m.away_score THEN 1 ELSE 0 END) AS draws,
        SUM(CASE 
          WHEN (p.team_id = m.home_team_id AND m.home_score < m.away_score) OR 
               (p.team_id = m.away_team_id AND m.away_score < m.home_score) THEN 1 
          ELSE 0 
        END) AS losses
      FROM matches m
      JOIN players p ON p.team_id IN (m.home_team_id, m.away_team_id)
      WHERE p.id = $1 AND m.status = 'completed'`,
      [id]
    );
    
    // Get recent form (last 5 matches)
    const recentForm = await pool.query(
      `SELECT 
        CASE 
          WHEN (p.team_id = m.home_team_id AND m.home_score > m.away_score) OR 
               (p.team_id = m.away_team_id AND m.away_score > m.home_score) THEN 'W'
          WHEN m.home_score = m.away_score THEN 'D'
          ELSE 'L'
        END AS result
      FROM matches m
      JOIN players p ON p.team_id IN (m.home_team_id, m.away_team_id)
      WHERE p.id = $1 AND m.status = 'completed'
      ORDER BY m.match_date DESC
      LIMIT 5`,
      [id]
    );
    
    // Calculate additional metrics
    const totalMatches = parseInt(stats.rows[0]?.total_matches) || 0;
    const wins = parseInt(stats.rows[0]?.wins) || 0;
    const draws = parseInt(stats.rows[0]?.draws) || 0;
    const losses = parseInt(stats.rows[0]?.losses) || 0;
    
    const winPercentage = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : 0;
    const drawPercentage = totalMatches > 0 ? ((draws / totalMatches) * 100).toFixed(2) : 0;
    const lossPercentage = totalMatches > 0 ? ((losses / totalMatches) * 100).toFixed(2) : 0;
    
    // Compile and return all statistics
    res.json({
      player: playerInfo.rows[0],
      matches: matchParticipation.rows,
      stats: {
        totalMatches,
        wins,
        draws,
        losses,
        winPercentage,
        drawPercentage,
        lossPercentage,
        points: wins * 3 + draws,
        recentForm: recentForm.rows.map(m => m.result)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics for current player
router.get('/statistics/me', auth, checkRole(['player']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get player ID
    const playerResult = await pool.query(
      'SELECT id FROM players WHERE user_id = $1',
      [userId]
    );
    
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Player profile not found' });
    }
    
    const playerId = playerResult.rows[0].id;
    
    // Redirect to the player statistics endpoint
    res.redirect(`/api/players/${playerId}/statistics`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
