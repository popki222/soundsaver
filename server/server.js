require('dotenv').config()
const express = require('express')
const app = express()




app.listen(5000, ()=> {console.log("Server started on port 5000")})

const meFunctions = require("./routes/Me/meFunctions")
const getUserLikes = require("./routes/Me/getUserLikes")

app.use("/me", meFunctions)
app.use("/test", getUserLikes)

// need to setup db models idk how yet but also gonna make a form on the frontend to just do email (for user) and oauth , this way can test the scans

// need to connect db , need to find a way to get all liked tracks , i think limit is 50 at a time