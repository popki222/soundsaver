require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
const { supabase } = require('../../utils/authenticate');


async function deleteSong(userId, songId) {
    try {
        const { error, status } = await supabase
            .from('user_songs')
            .delete()
            .eq('user_id', userId)
            .eq('song_id', songId);
        
        if (error) throw error;
        return status;
    } catch (error) {
        console.error('Error Deleting song:', error);
        return null;
    }
}

router.delete('/delete', async (req, res) => {
    try {
        const currUserID = req.user.id;
        const { songId } = req.body;

        const removeSong = await deleteSong(currUserID, songId);
        if (removeSong !== null) {
            return res.sendStatus(204);
        } else {
            return res.status(500).json({ error: "Error removing song from user_songs" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Error removing song from user_songs" });
    }
});

module.exports = router;