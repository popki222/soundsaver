const express = require("express")
const router = express.Router()
const path = require('path');
const pool = require(path.join(__dirname, '../../db'));


router.post('/addUser', async (req, res) => {
    console.log(req.body)
    const { id, email, created_at } = req.body;
  
    try {
      const result = await pool.query(
        'INSERT INTO users (id, email, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [id, email, created_at]
      );
      res.status(200).send('User added successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding user');
    }
  });

module.exports = router;