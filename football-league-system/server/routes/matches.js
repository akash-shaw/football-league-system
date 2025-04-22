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
    // This is a complex query to calculate points table using nested queries
    // For each team, we calculate:
    // - Matches played
    // - Wins
    // - Draws
    // - Losses
    // - Goals for
    // - Goals against
    // - Goal difference
    // - Points (3 for win, 1 for draw)
    
    const pointsTable = await pool.query(`
      WITH match_results AS (
        SELECT 
          m.id AS match_id,
          m.home_team_id,
          m.away_team_id,
          m.home_score,
          m.away_score,
          m.status,
          CASE 
            WHEN m.home_score > m.away_score THEN m.home_team_id
            WHEN m.away_score > m.home_score THEN m.away_team_id
            ELSE NULL
          END AS winner_id,
          CASE 
            WHEN m.home_score = m.away_score THEN TRUE
            ELSE FALSE
          END AS is_draw
        FROM matches m
        WHERE m.status = 'completed'
      ),
      team_stats AS (
        SELECT 
          t.id AS team_id,
          t.name AS team_name,
          COUNT(DISTINCT m.match_id) AS matches_played,
          SUM(CASE WHEN m.home_team_id = t.id THEN m.home_score ELSE m.away_score END) AS goals_for,
          SUM(CASE WHEN m.home_team_id = t.id THEN m.away_score ELSE m.home_score END) AS goals_against,
          COUNT(CASE WHEN m.winner_id = t.id THEN 1 END) AS wins,
          SUM(CASE WHEN m.is_draw THEN 1 ELSE 0 END) AS draws,
          (COUNT(DISTINCT m.match_id) - COUNT(CASE WHEN m.winner_id = t.id THEN 1 END) - SUM(CASE WHEN m.is_draw THEN 1 ELSE 0 END)) AS losses
        FROM teams t
        LEFT JOIN (
          SELECT match_id, home_team_id, away_team_id, home_score, away_score, winner_id, is_draw
          FROM match_results
          UNION ALL
          SELECT match_id, away_team_id AS home_team_id, home_team_id AS away_team_id, away_score AS home_score, home_score AS away_score, winner_id, is_draw
          FROM match_results
        ) m ON t.id = m.home_team_id
        GROUP BY t.id, t.name
      )
      SELECT 
        team_id,
        team_name,
        matches_played AS played,
        wins,
        draws,
        losses,
        goals_for,
        goals_against,
        (goals_for - goals_against) AS goal_difference,
        (wins * 3 + draws) AS points
      FROM team_stats
      ORDER BY points DESC, goal_difference DESC, goals_for DESC
    `);
    
    res.json(pointsTable.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
