require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
delete require.cache[require.resolve('soundcloud.ts')];
const Soundcloud = require('soundcloud.ts').default;
const path = require('path');
const pool = require(path.join(__dirname, '../../db'));

const soundcloud = new Soundcloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN);


const parseTrackData = (track) => ({
    track_id: track.id, 
    title: track.title,
    artist: track.user.username,
    artwork_url: track.artwork_url,
    permalink_url: track.permalink_url,
});

async function fetchLikes() {
    try {
        const user = await soundcloud.users.likes(process.env.USERID);
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Save scanned songs to the database
async function saveScannedSongs(likedSongs) {
    try {
        const client = await pool.connect();
        await Promise.all(likedSongs.map(async (song) => {
            const parsedSong = parseTrackData(song);
            const { track_id, title, artist, artwork_url, permalink_url } = parsedSong;

            const query = `
                INSERT INTO songs (track_id, title, artist, artwork_url, permalink_url, active)
                VALUES ($1, $2, $3, $4, $5, 'true')
                ON CONFLICT (track_id) DO UPDATE SET active = 'true', scan_time = CURRENT_TIMESTAMP;
            `;
            await client.query(query, [track_id, title, artist, artwork_url, permalink_url]);
        }));
        await client.release();
        return true;
    } catch (error) {
        console.error('Error saving songs:', error.stack);
        return false;
    }
}

async function deactivateOldSongs() {
    const client = await pool.connect();
    try {
        const deactivateQuery = `
            UPDATE songs
            SET active = 'false'
            WHERE scan_time < NOW() - INTERVAL '2 minutes' AND active = 'true';
        `;
        await client.query(deactivateQuery);
    } catch (error) {
        console.error('Error deactivating old songs:', error);
    } finally {
        await client.end();
    }
}

// GET route for fetching and scanning user likes
router.get('/scan', async (req, res) => {
    try {
        const userLikes = await fetchLikes();
        if (userLikes) {
            const success = await saveScannedSongs(userLikes);
            if (success) {
                await deactivateOldSongs();
                res.status(200).send('Songs fetched and stored successfully');
            } else {
                res.status(500).send('Error saving songs to database');
            }
        } else {
            res.status(500).send('Error fetching user likes from SoundCloud');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to process scan' });
    }
});

module.exports = router;

//create create a function that takes the SoundcloudTrack object and extracts only the properties you need for your application (e.g., title, artist, artwork_url, id, and permalink_url).
// then make a post req to your database