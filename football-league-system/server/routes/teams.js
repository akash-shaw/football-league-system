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

module.exports = router;
