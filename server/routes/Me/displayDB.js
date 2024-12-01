require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
const { supabase } = require('../../utils/authenticate');


async function fetchDatabaseSongs(userID) {
    try {
        const { data, error } = await supabase
            .rpc('fetch_user_songs', { input_user_id: userID });

        if (error) {
            throw error;
        }

        return data;
        
    } catch (err) {
        console.log(err);
    }
}



router.get('/', async (req, res) => {
    try {
        const currUserID = req.user.id;
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