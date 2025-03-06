require('dotenv').config();
const express = require('express');
const authenticate = require('./middleware/authenticate');
const listenToChanges = require('./realtime');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

listenToChanges();


app.listen(5000, ()=> {console.log("Server started on port 5000")});

const meFunctions = require("./routes/Me/meFunctions");
const getUserLikes = require("./routes/Me/getUserLikes");
const getDbLikes = require("./routes/Me/displayDB");
const addUser = require("./routes/Me/newUser");
const getUserID = require("./routes/Me/getUserID");
const sendMessage = require("./routes/Me/sqs");
const removeSong = require("./routes/Me/song");

app.use("/song", authenticate, removeSong);
app.use("/send-message", sendMessage);
app.use("/getUser", authenticate, getUserID);
app.use("/user", addUser);
app.use("/db", authenticate, getDbLikes);
app.use("/me", authenticate, meFunctions);
app.use("/get", authenticate, getUserLikes);


//maybe use authenticate on send-message