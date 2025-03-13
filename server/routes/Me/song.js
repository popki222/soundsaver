require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
const { supabase } = require('../../utils/authenticate');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
const bucketName = process.env.S3_BUCKET_NAME;

//if song is unliked (not deleted) - you shouldnt be able to reupload.
//but since its just download for now its ok
async function reuploadSong(songId) {
    try {

        const { data, error } = await supabase
            .from('songs')
            .select("title")
            .eq('id', songId);
        
        const songTitle = data[0]?.title;

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: songId,
            ResponseContentDisposition: `attachment; filename=${songTitle}.mp3rs`
        });

        const url = await getSignedUrl(client, command, { expiresIn: 600 });
        return url;

    } catch (error) {
        console.error("Error generating download URL:", error);
        return null;
    }
}


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

router.get("/download", async (req, res) => {
    try {
        const currUserID = req.user.id;
        const { songId } = req.query;
        if (!songId) {
            return res.status(400).json({ error: "Missing song ID" });
        }

        const result = await reuploadSong(songId);
        if (!result) {
            return res.status(500).json({ error: "Failed to generate download URL" });
        }

        res.json({ downloadUrl: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to reupload song" });
    }
});




// use userid to find the sc id in users db and then retrieve username from this 
//so it can say which user did it in te description maybe
module.exports = router;