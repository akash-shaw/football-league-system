const express = require('express');
const pool = require('../db');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await pool.query(
      'SELECT p.*, u.username, u.email, t.name as team_name FROM players p ' +
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
      'SELECT p.*, u.username, u.email, t.name as team_name FROM players p ' +
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
    const { position, age, height, weight } = req.body;
    
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
    
    const updatedPlayer = await pool.query(
      'UPDATE players SET position = $1, age = $2, height = $3, weight = $4 WHERE id = $5 RETURNING *',
      [position, age, height, weight, id]
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

// Get player profile for logged in user
router.get('/profile/me', auth, checkRole(['player']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const player = await pool.query(
      'SELECT p.*, t.name as team_name FROM players p ' +
      'LEFT JOIN teams t ON p.team_id = t.id ' +
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

module.exports = router;
