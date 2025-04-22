const express = require('express');
const pool = require('../db');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userResult = await pool.query(
      'SELECT id, username, email, role, name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, name } = req.body;
    
    const updatedUser = await pool.query(
      'UPDATE users SET username = $1, email = $2, name = $3 WHERE id = $4 RETURNING id, username, email, role, name',
      [username, email, name, userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all team managers
router.get('/managers', async (req, res) => {
  try {
    const managers = await pool.query(
      'SELECT id, username, email, name FROM users WHERE role = $1',
      ['team_manager']
    );
    res.json(managers.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all players with profile data
router.get('/players', async (req, res) => {
  try {
    const players = await pool.query(
      'SELECT u.id, u.username, u.email, u.name, u.role, p.position, p.age, p.height, p.weight, t.name as team_name ' +
      'FROM users u ' +
      'LEFT JOIN players p ON u.id = p.user_id ' +
      'LEFT JOIN teams t ON p.team_id = t.id ' +
      'WHERE u.role = $1',
      ['player']
    );
    res.json(players.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all stadium managers
router.get('/stadium-managers', async (req, res) => {
  try {
    const stadiumManagers = await pool.query(
      'SELECT id, username, email, name FROM users WHERE role = $1',
      ['stadium_manager']
    );
    res.json(stadiumManagers.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all referees
router.get('/referees', async (req, res) => {
  try {
    const referees = await pool.query(
      'SELECT id, username, email, name FROM users WHERE role = $1',
      ['referee']
    );
    res.json(referees.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with player role
router.get('/player-users', async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT u.* FROM users u WHERE u.role = $1',
      ['player']
    );
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
