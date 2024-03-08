const express = require("express");
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
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

app.use((req, res, next) => {
    req.users = users;
    req.chats = chats;
    next();
});

const auth = require("./routes/auth");
app.use("/auth", auth);

const chat = require("./chat.js");
app.use("/chat", chat);

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
})

app.get("/navbar", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public", "navbar.html"));
})

app.get("/css/main", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "public", "main.css"));
})

app.get("/test", (req, res) => {
    res.status(200).send("It works");
})

app.get("/testprofile", (req, res) => {
    const user = req.session.user;
    if(user) {
        res.status(200).send(`Welcome ${user.username} to your profile!`);
    } else {
        res.status(400).send("What are you doing?!");
    }
})

app.listen(PORT, () => {
    console.log("Listening to port", PORT);
})