const express = require("express");
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const PORT = 3000;

app.use(express.static("public"));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));

let users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
let chats = JSON.parse(fs.readFileSync('chats.json', 'utf8'));
let sessions = JSON.parse(fs.readFileSync('sessions.json', 'utf8'));

app.use((req, res, next) => {
    req.users = users;
    req.chats = chats;
    req.theSessions = sessions;
    next();
});

const auth = require("./routes/auth");
app.use("/auth", auth);

const chat = require("./chat.js");
app.use("/chat", chat);

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
})

app.get("/home", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public", "home.html"));
})

app.get("/user", (req, res) => {
    const user = req.session.user;
    if(user) {
        const userToSend = { ...user };
        delete userToSend.password;

        res.status(200).json(userToSend);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.get("/test", (req, res) => {
    res.status(200).send("It works");
})

app.get("/testprofile", (req, res) => {
    const user = req.session.user;
    if(user) {
        res.status(200).send(`Welcome ${user.username} to your profile!`);
    } else {
        res.status(400).sendFile(path.join(__dirname, "public", "index.html"));
    }
})

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, () => {
    console.log("Listening to port", PORT);
})