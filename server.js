const express = require("express");
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const PORT = 3000;

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: false }));

// Dummy database of users
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid username or password');
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
        res.status(400).send("What are you doing?!");
    }
})

app.listen(PORT, () => {
    console.log("Listening to port", PORT);
})