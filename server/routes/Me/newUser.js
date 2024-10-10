const express = require("express")
const router = express.Router()
const path = require('path');
const pool = require(path.join(__dirname, '../../db'));


router.post('/addUser', async (req, res) => {
    const { id, email, created_at } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO users (id, email, created_at, soundcloud_id) VALUES ($1, $2, $3, NULL) ON CONFLICT DO NOTHING',
        [id, email, created_at]
      );
      res.status(200).send('User added successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding user');
    }
  });

router.get('/checkUser', async (req, res) => {
  try {
    const email = req.query.email;
    const result = await pool.query(
      'SELECT COUNT(*) FROM users WHERE email = $1',
      [email]
    );
    const userExists = Number(result.rows[0].count) === 1;

    if (userExists) {
      res.status(200).send(userExists);
    } else {
      res.status(404).send('User not in Database');
    }} catch (err) {
    res.status(500).send('User not in Database');
  }
})

module.exports = router;