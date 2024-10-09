require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
const path = require('path');
const pool = require(path.join(__dirname, '../../db'));


async function fetchDatabaseSongs(userID) {
    try{
        const client = await pool.connect();
        const userSongsInfoQuery = `
            SELECT 
                s.id, 
                s.track_id, 
                s.title, 
                s.artist, 
                s.artwork_url, 
                s.permalink_url, 
                us.active, 
                us.scan_time
            FROM 
                user_songs us
            JOIN 
                songs s 
            ON 
                s.id = us.song_id
            WHERE 
                us.user_id = $1;
        `
        const res = await client.query(userSongsInfoQuery, [userID])
        client.release()
        return res.rows
        
    } catch(err) {
        console.log(err)
    }
    
}

router.get('/', async (req, res) => {
    try {
        const currUserID = req.query.userid;
        const dbLikes = await fetchDatabaseSongs(currUserID);
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