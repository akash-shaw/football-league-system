const express = require('express');
const pool = require('../db');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all matches
router.get('/', async (req, res) => {
  try {
    const matches = await pool.query(
      'SELECT m.*, ht.name as home_team, at.name as away_team, s.name as stadium, ' +
      'u.name as referee_name, u.username as referee FROM matches m ' +
      'JOIN teams ht ON m.home_team_id = ht.id ' +
      'JOIN teams at ON m.away_team_id = at.id ' +
      'JOIN stadiums s ON m.stadium_id = s.id ' +
      'LEFT JOIN users u ON m.referee_id = u.id ' +
      'ORDER BY m.match_date'
    );
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming matches
router.get('/upcoming', async (req, res) => {
  try {
    const matches = await pool.query(
      'SELECT m.*, ht.name as home_team, at.name as away_team, s.name as stadium, ' +
      'u.name as referee_name, u.username as referee FROM matches m ' +
      'JOIN teams ht ON m.home_team_id = ht.id ' +
      'JOIN teams at ON m.away_team_id = at.id ' +
      'JOIN stadiums s ON m.stadium_id = s.id ' +
      'LEFT JOIN users u ON m.referee_id = u.id ' +
      'WHERE m.match_date > NOW() ' +
      'ORDER BY m.match_date'
    );
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get past matches
router.get('/past', async (req, res) => {
  try {
    const matches = await pool.query(
      'SELECT m.*, ht.name as home_team, at.name as away_team, s.name as stadium, ' +
      'u.name as referee_name, u.username as referee FROM matches m ' +
      'JOIN teams ht ON m.home_team_id = ht.id ' +
      'JOIN teams at ON m.away_team_id = at.id ' +
      'JOIN stadiums s ON m.stadium_id = s.id ' +
      'LEFT JOIN users u ON m.referee_id = u.id ' +
      'WHERE m.match_date <= NOW() ' +
      'ORDER BY m.match_date DESC'
    );
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await pool.query(
      'SELECT m.*, ht.name as home_team, at.name as away_team, s.name as stadium, ' +
      'u.name as referee_name, u.username as referee FROM matches m ' +
      'JOIN teams ht ON m.home_team_id = ht.id ' +
      'JOIN teams at ON m.away_team_id = at.id ' +
      'JOIN stadiums s ON m.stadium_id = s.id ' +
      'LEFT JOIN users u ON m.referee_id = u.id ' +
      'WHERE m.id = $1',
      [id]
    );
    
    if (match.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(match.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create match (League Admin only)
router.post('/', auth, checkRole(['league_admin']), async (req, res) => {
  try {
    const { home_team_id, away_team_id, stadium_id, referee_id, match_date } = req.body;
    
    const newMatch = await pool.query(
      'INSERT INTO matches (home_team_id, away_team_id, stadium_id, referee_id, match_date) ' +
      'VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [home_team_id, away_team_id, stadium_id, referee_id, match_date]
    );
    
    res.status(201).json(newMatch.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update match score (League Admin only)
router.put('/:id/score', auth, checkRole(['league_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { home_score, away_score, status } = req.body;
    
    const updatedMatch = await pool.query(
      'UPDATE matches SET home_score = $1, away_score = $2, status = $3 WHERE id = $4 RETURNING *',
      [home_score, away_score, status || 'completed', id]
    );
    
    if (updatedMatch.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    res.json(updatedMatch.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get matches for a referee
router.get('/referee/me', auth, checkRole(['referee']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matches = await pool.query(
      'SELECT m.*, ht.name as home_team, at.name as away_team, s.name as stadium ' +
      'FROM matches m ' +
      'JOIN teams ht ON m.home_team_id = ht.id ' +
      'JOIN teams at ON m.away_team_id = at.id ' +
      'JOIN stadiums s ON m.stadium_id = s.id ' +
      'WHERE m.referee_id = $1 ' +
      'ORDER BY m.match_date',
      [userId]
    );
    
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming matches for a referee
router.get('/referee/me/upcoming', auth, checkRole(['referee']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matches = await pool.query(
      'SELECT m.*, ht.name as home_team, at.name as away_team, s.name as stadium ' +
      'FROM matches m ' +
      'JOIN teams ht ON m.home_team_id = ht.id ' +
      'JOIN teams at ON m.away_team_id = at.id ' +
      'JOIN stadiums s ON m.stadium_id = s.id ' +
      'WHERE m.referee_id = $1 AND m.match_date > NOW() ' +
      'ORDER BY m.match_date',
      [userId]
    );
    
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get past matches for a referee
router.get('/referee/me/past', auth, checkRole(['referee']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matches = await pool.query(
      'SELECT m.*, ht.name as home_team, at.name as away_team, s.name as stadium ' +
      'FROM matches m ' +
      'JOIN teams ht ON m.home_team_id = ht.id ' +
      'JOIN teams at ON m.away_team_id = at.id ' +
      'JOIN stadiums s ON m.stadium_id = s.id ' +
      'WHERE m.referee_id = $1 AND m.match_date <= NOW() ' +
      'ORDER BY m.match_date DESC',
      [userId]
    );
    
    res.json(matches.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get points table
router.get('/table/points', async (req, res) => {
  try {
    // Use the points_table instead of the complex query
    const pointsTable = await pool.query(`
      SELECT 
        p.team_id,
        t.name AS team_name,
        p.played,
        p.wins,
        p.draws,
        p.losses,
        p.goals_for,
        p.goals_against,
        p.goal_difference,
        p.points
      FROM points_table p
      JOIN teams t ON p.team_id = t.id
      ORDER BY p.points DESC, p.goal_difference DESC, p.goals_for DESC
    `);
    
    res.json(pointsTable.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
