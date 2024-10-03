require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
const path = require('path');
const pool = require(path.join(__dirname, '../../db'));


async function fetchDatabaseSongs() {
    try{
        const client = await pool.connect();
        const res = await client.query(`SELECT * FROM songs`)
        client.release()
        return res.rows
        
    } catch(err) {
        console.log(err)
    }
    
}

router.get('/', async (req, res) => { //prob gonna query userid and filter with that
    try {
        const dbLikes = await fetchDatabaseSongs();
        if (dbLikes) {
            res.status(200).send(dbLikes);
        } else {
            res.status(500).send('Error fetching user likes from Database');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user likes from Database' });
    }
});

module.exports = router;