require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
const Soundcloud = require('soundcloud.ts').default;
const { supabase } = require('../../utils/authenticate');

const soundcloud = new Soundcloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN);

async function fetchUser() {
    try {
        const user = await soundcloud.me.get()
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}


async function fetchUserProfile(userid) {
    try {
        const { data, error } = await supabase
            .rpc('get_user_profile', { input_user_id: userid });
        if (error) {
            throw error;
        }
        return data;
        
    } catch (error) {
        console.error('Error fetching profile from users:', error);
    }
}


router.get("/", async (req, res) => {
    const userid = req.user.id;

    try {
        const user = await fetchUserProfile(userid);
        res.json({
            user
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});




module.exports = router
