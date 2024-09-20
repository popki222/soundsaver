require('dotenv').config();
const express = require("express")
const axios = require('axios')
const router = express.Router()
delete require.cache[require.resolve('soundcloud.ts')];
const Soundcloud = require('soundcloud.ts').default;

const soundcloud = new Soundcloud(process.env.SOUNDCLOUD_CLIENT_ID, process.env.SOUNDCLOUD_OAUTH_TOKEN);


  
async function fetchUser() {
    try {
        const user = await soundcloud.users.likes("<userid goes here>")
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}
router.get("/", async (req, res) => {
    try {
        const user = await fetchUser();
        res.json({
            user
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

module.exports = router

