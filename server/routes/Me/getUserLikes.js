require('dotenv').config();
const express = require("express")
const router = express.Router()
delete require.cache[require.resolve('soundcloud.ts')];
const Soundcloud = require('soundcloud.ts').default;
const { supabase } = require('../../utils/authenticate');

const soundcloud = new Soundcloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN);


const parseTrackData = (track) => ({
    track_id: track.id, 
    title: track.title,
    artist: track.user.username,
    artwork_url: track.artwork_url,
    permalink_url: track.permalink_url,
    timestamp: track.timestamp,
});

async function fetchLikes(userid) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('soundcloud_id')
            .eq('id', userid);
        
        const soundcloudID = data[0]?.soundcloud_id;
        const likes = await soundcloud.users.likes(soundcloudID);
        return likes;
    } catch (error) {
        console.error('Error fetching likes:', error);
        return null;
    }
}

async function fetchAndSaveUserInfo(userid) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('soundcloud_id')
            .eq('id', userid);
        
        const soundcloudID = data[0]?.soundcloud_id;
        const userInfo = await soundcloud.users.get(soundcloudID);

        const updateData = {
            username: userInfo.username,
            city: userInfo.city,
            avatar_url: userInfo.avatar_url,
            likes_count: userInfo.likes_count,
            permalink_url: userInfo.permalink_url,
          };
          
          const { data: profileData, error: profileError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userid);
        
        if (profileError) {
          console.error('Error updating user info:', profileError);
        } else {
          console.log('User info updated:', profileData);
        }
        
        
    } catch (error) {
        console.error('Error fetching likes:', error);
        return null;
    }
}

async function saveScannedSongs(likedSongs, userid) {
    const chunkSize = 1000;
    for (let i = 0; i < likedSongs.length; i += chunkSize) {
        const chunk = likedSongs.slice(i, i + chunkSize);

        try {
            const results = await Promise.allSettled(chunk.map(async (song) => {
                const parsedSong = parseTrackData(song);
                const { track_id, title, artist, artwork_url, permalink_url, timestamp } = parsedSong;
    
                const { data: song_id, error: songError } = await supabase
                    .rpc('insert_or_update_song', { p_track_id: track_id, p_title: title, p_artist: artist, p_artwork_url: artwork_url, p_permalink_url: permalink_url, p_timestamp: timestamp });
                if (songError) {
                    console.error('Error inserting/updating song:', songError);
                    throw new Error(`Song insert error for track_id ${track_id}`);
                }
    
                const { error: userSongError } = await supabase
                    .rpc('insert_or_update_user_song', { p_user_id: userid, p_song_id: song_id, p_timestamp: timestamp });
                if (userSongError) {
                    console.error('Error inserting/updating user-song relationship:', userSongError);
                    throw new Error(`User-song insert error for track_id ${track_id}`);
                }
            }));

            const failed = results.filter((r) => r.status === "rejected");
            if (failed.length > 0) {
                console.error(`Chunk processed with ${failed.length} failures.`);
            }

        } catch (error) {
            console.error("error with upserting: ", error.stack);
            return false;
        }}

        const { error: updateScanTimeError } = await supabase
                .rpc('update_user_last_scan', { user_id: userid });
            if (updateScanTimeError) {
                console.error('Error updating user last scan:', updateScanTimeError);
                return false;
            }
            return true;    
    }

async function deactivateOldSongs(userid) {
    try {
        const { error } = await supabase
            .rpc('deactivate_old_songs', { p_user_id: userid });
        if (error) {
            console.error('Error deactivating old songs:', error);
        }
    } catch (error) {
        console.error('Error deactivating old songs:', error);
    }
}

async function fetchLastScan(userID) {
    try {
        const { data, error } = await supabase
            .rpc('fetch_last_scan', { input_user_id: userID });
        if (error) {
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Error deactivating old songs:', error);
    }
}


router.get('/scan', async (req, res) => {
    const userid = req.user.id;
    const canScan = await fetchLastScan(userid);

    if (canScan) {
        try {
            const userLikes = await fetchLikes(userid);
            if (userLikes) {
                console.log("likes successfully fetched");
                const success = await saveScannedSongs(userLikes, userid);
                if (success) {
                    await deactivateOldSongs(userid);
                    await fetchAndSaveUserInfo(userid);
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
