const express = require('express');
const pool = require('../db');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all stadiums
router.get('/', async (req, res) => {
  try {
    const stadiums = await pool.query('SELECT * FROM stadiums');
    res.json(stadiums.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stadium by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const stadium = await pool.query('SELECT * FROM stadiums WHERE id = $1', [id]);
    
    if (stadium.rows.length === 0) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    
    res.json(stadium.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create stadium (League Admin only)
router.post('/', auth, checkRole(['league_admin']), async (req, res) => {
  try {
    const { name, location, capacity, manager_id } = req.body;
    
    const newStadium = await pool.query(
      'INSERT INTO stadiums (name, location, capacity, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, location, capacity, manager_id]
    );
    
    res.status(201).json(newStadium.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stadium (Stadium Manager or League Admin only)
router.put('/:id', auth, checkRole(['stadium_manager', 'league_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, capacity } = req.body;
    
    // Check if user is the stadium manager
    if (req.user.role === 'stadium_manager') {
      const stadiumCheck = await pool.query(
        'SELECT * FROM stadiums WHERE id = $1 AND manager_id = $2',
        [id, req.user.id]
      );
      
      if (stadiumCheck.rows.length === 0) {
        return res.status(403).json({ message: 'You can only update stadiums you manage' });
      }
    }
    
    const updatedStadium = await pool.query(
      'UPDATE stadiums SET name = $1, location = $2, capacity = $3 WHERE id = $4 RETURNING *',
      [name, location, capacity, id]
    );
    
    if (updatedStadium.rows.length === 0) {
      return res.status(404).json({ message: 'Stadium not found' });
    }
    
    res.json(updatedStadium.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stadiums managed by logged in user
router.get('/managed/me', auth, checkRole(['stadium_manager']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stadiums = await pool.query(
      'SELECT * FROM stadiums WHERE manager_id = $1',
      [userId]
    );
    
    res.json(stadiums.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
