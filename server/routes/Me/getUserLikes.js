require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
delete require.cache[require.resolve('soundcloud.ts')];
const Soundcloud = require('soundcloud.ts').default;
const path = require('path');
const pool = require(path.join(__dirname, '../../db'));
const { supabase } = require('../../utils/authenticate');


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
        const { data, error } = await supabase
            .from('users')
            .select('soundcloud_id')
            .eq('id', userid);
        if (error) {
            console.error('Error fetching soundcloudId from users table', error);
            return null;
        }
        if (data && data.length > 0) {
            const soundcloudId = data[0].soundcloud_id
            const likes = await soundcloud.users.likes(soundcloudId);
            return likes;
        } else {
            console.error('No user found with the provided userid');
            return null;
        }
    } catch (error) {
        console.error('Error fetching likes:', error);
        return null;
    }
}

async function saveScannedSongs(likedSongs, userid) {
    try {
        await Promise.all(
            likedSongs.map(async (song) => {
                const parsedSong = parseTrackData(song);
                const { track_id, title, artist, artwork_url, permalink_url } = parsedSong;

                const { data: songData, error: songError } = await supabase
                    .from('songs')
                    .upsert({
                        track_id,
                        title,
                        artist,
                        artwork_url,
                        permalink_url,
                        scan_time: new Date().toISOString(),
                    }, { 
                        onConflict: ['track_id'],
                        returning: 'representation'
                    })
                    .select('id', 'scan_time')
                    .single();

                if (songError) {
                    console.error('Error inserting/updating song:', songError);
                    return;
                }


                const songPkey = songData.id;
                const scanTime = songData.scan_time;

                const { error: userSongsError } = await supabase
                    .from('user_songs')
                    .upsert({
                        user_id: userid,
                        song_id: songPkey,
                        added_at: scanTime,
                        active: true,
                        scan_time: scanTime,
                    }, { 
                        onConflict: ['user_id', 'song_id'],
                        returning: 'representation'
                    });

                if (userSongsError) {
                    console.error('Error inserting/updating user_songs:', userSongsError);
                }

            })
        );
        const { error } = await supabase
            .from('users')
            .update({ last_scan: new Date().toISOString() })
            .eq('id', userid);

        if (error) {
            console.error('Error updating last_scan on user table', error);
        }
        
        return true;

    } catch (error) {
        console.error('Error saving songs:', error.stack);
        return false;
    }
}

async function deactivateOldSongs(userid) {
    try {
        const { error } = await supabase
            .from('user_songs')
            .update({ active: false })
            .lt('scan_time', new Date(Date.now() - 2 * 60 * 1000).toISOString()) 
            .eq('active', true)
            .eq('user_id', userid);

        if (error) {
            console.error('Error deactivating old songs:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in deactivateOldSongs:', error.stack);
    }
}

async function fetchLastScan(userId) {
    try {
        const { data, error } = await supabase.rpc('is_user_scannable', { user_id: userId });
    
        if (error) {
          console.error('Error running RPC:', error);
          return null;
        }
    
        return data;
      } catch (err) {
        console.error('Unexpected error:', err);
        return null;
      }
}

router.get('/scan', async (req, res) => {
    const userid = req.user.id;
    
    try {
        const canScan = await fetchLastScan(userid);
        if (!canScan) {
            return res.status(400).json({ error: 'User already scanned today' });
        }

        const userLikes = await fetchLikes(userid);
        if (!userLikes) {
            return res.status(500).send('Error fetching user likes from SoundCloud');
        }

        console.log("Likes successfully fetched");

        const songsSavedSuccessfully = await saveScannedSongs(userLikes, userid);
        if (!songsSavedSuccessfully) {
            return res.status(500).send('Error saving songs to database');
        }

        const deactivated = await deactivateOldSongs(userid);
        if (!deactivated) {
            return res.status(500).send('Error deactivating missing songs');
        }

        res.status(200).send('Songs fetched and stored successfully');
    } catch (error) {
        console.error('Unexpected error in scan route:', error);
        res.status(500).json({ error: 'Failed to process scan' });
    }
});



module.exports = router;
