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

async function fetchLikes(userid) {
    try {
        const response = await pool.query(
            `SELECT soundcloud_id FROM users WHERE id = $1`, [userid]
        );
        const soundcloudID = response.rows[0]?.soundcloud_id;
        const likes = await soundcloud.users.likes(soundcloudID);
        return likes;
    } catch (error) {
        console.error('Error fetching likes:', error);
        return null;
    }
}

async function saveScannedSongs(likedSongs, userid) {
    try {
        const client = await pool.connect();
        await Promise.all(likedSongs.map(async (song) => {
            const parsedSong = parseTrackData(song);
            const { track_id, title, artist, artwork_url, permalink_url } = parsedSong;

            const query = `
                INSERT INTO songs (track_id, title, artist, artwork_url, permalink_url)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (track_id) DO UPDATE SET scan_time = CURRENT_TIMESTAMP
                RETURNING id;
            `;
            const songResult = await client.query(query, [track_id, title, artist, artwork_url, permalink_url]);
            const songPkey = songResult.rows[0].id;
            const userSongsQuery = `
                INSERT INTO user_songs (user_id, song_id, added_at, active, scan_time)
                VALUES ($1, $2, CURRENT_TIMESTAMP, true, CURRENT_TIMESTAMP )
                ON CONFLICT (user_id, song_id) DO UPDATE SET active = true, scan_time = CURRENT_TIMESTAMP;
            `
            await client.query(userSongsQuery, [userid, songPkey]);
        }));

        const updateScanTime = `
            UPDATE users
            SET last_scan = CURRENT_TIMESTAMP
            WHERE id = $1;
        `;
        await client.query(updateScanTime, [userid]);

        await client.release();
        return true;
    } catch (error) {
        console.error('Error saving songs:', error.stack);
        return false;
    } finally {
        await client.release();
    }
}

async function deactivateOldSongs(userid) {
    const client = await pool.connect();
    try {
        const searchActive = `
            UPDATE user_songs
            SET active = false
            WHERE scan_time < NOW() - INTERVAL '2 minutes' AND active = true AND user_id = $1 ;
        `;
        await client.query(searchActive, [userid]);
    } catch (error) {
        console.error('Error deactivating old songs:', error);
    } finally {
        await client.release();
    }
}

async function fetchLastScan(userid) {
    const client = await pool.connect();
    try {
        const fetchLastScan = `
            SELECT CASE 
                WHEN last_scan < CURRENT_DATE THEN true
                ELSE false
            END AS scannable
            FROM users
            WHERE id = $1;
        `;

        const result = await client.query(fetchLastScan, [userid]);
        return result.rows[0]?.scannable || false;
    } catch (error) {
        console.error('Error deactivating old songs:', error);
    } finally {
        await client.release();
    }
}

router.get('/scan', async (req, res) => {
    const userid = req.query.userid;
    const canScan = await fetchLastScan(userid);

    if (canScan) {
        try {
            const userLikes = await fetchLikes(userid);
            if (userLikes) {
                console.log("likes successfully fetched");
                const success = await saveScannedSongs(userLikes, userid);
                if (success) {
                    await deactivateOldSongs(userid);
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
    } else {
        res.status(400).json({ error: 'User already scanned today' });
    }
});



module.exports = router;
