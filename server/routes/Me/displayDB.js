require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
//const path = require('path');
//const pool = require(path.join(__dirname, '../../db'));
const { supabase } = require('../../utils/authenticate');



async function fetchDatabaseSongs(userID) {
    try{
        const { data, error } = await supabase
        .from('user_songs')
            .select(`
                song_id,
                active,
                scan_time,
                songs (
                    id,
                    track_id,
                    title,
                    artist,
                    artwork_url,
                    permalink_url
                )
            `)
            .eq('user_id', userID)
            .order('scan_time', { ascending: true });

        if (error) {
            console.error('Error fetching songs from Supabase:', error);
            return null;
        }

        const formattedData = data.map((item) => ({
            id: item.songs.id,
            track_id: item.songs.track_id,
            title: item.songs.title,
            artist: item.songs.artist,
            artwork_url: item.songs.artwork_url,
            permalink_url: item.songs.permalink_url,
            active: item.active,
            scan_time: item.scan_time,
        }));

        return formattedData;
    } catch (err) {
        console.error('Error in fetchDatabaseSongs:', err);
        return null;
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