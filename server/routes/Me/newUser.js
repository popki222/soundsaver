const express = require("express")
const router = express.Router()
const path = require('path');
const pool = require(path.join(__dirname, '../../db'));
const { supabase } = require('../../utils/authenticate');


router.post('/addUser', async (req, res) => {
    const { id, email, created_at } = req.body;
    try {
      const { error } = await supabase
        .rpc('insert_user',
        { p_id: id, p_email: email, p_created_at: created_at })
      if (error) {
        console.error('error adding new user: ', error );
        throw new Error(`new user insert error for user ${id}`);
      }
      res.status(200).send('User added successfully');
    } 
     catch (err) {
      console.error(err);
      res.status(500).send('Error adding user');
    }
  });

router.get('/checkUser', async (req, res) => {
  try {
    const email = req.query.email;

    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);

    if (error) {
      console.error('Error fetching user email:', error);
      res.status(500).send('Error fetching user email');
      return;
    }
    const userExists = userExists = data.length > 0;

    if (userExists) {
      res.status(200).send(userExists);
    } else {
      res.status(404).send('User not in Database');
    }} catch (err) {
    res.status(500).send('User not in Database');
  }
})

module.exports = router;