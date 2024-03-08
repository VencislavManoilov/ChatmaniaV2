const express = require("express");
const router = express.Router();
const session = require("express-session");
const emailVal = require("email-validator");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const { error } = require("console");

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = req.users;
    const user = users.find(u => u.username === username && u.password === password);
    if(user) {
        req.session.user = user;

        // Sessions are for next time

        // const session = uuidv4(), sessions = req.theSessions;
        // sessions.push({ username: username, session: session });
        
        // fs.writeFileSync(path.join(__dirname, "../sessions"), JSON.stringify(sessions), (err) => {
        //     if(err) {
        //         console.log(err);
        //     }
        // });

        // res.status(200).json({ session: session });

        res.status(200).json({ success: "Login successfull" });
    } else {
        res.status(401).json({ error: "Invalid username or password" });
    }
});

router.post("/session", (req, res) => {
    const { session } = req.body;
    const users = req.users;
    const sessions = req.theSessions;
    const userUsername = sessions.find(s => s.session === session);

    if(userUsername) {
        req.session.user = users.find(u => u.username === userUsername.username);
        res.status(200).json({ success: "Success!" });
    } else {
        res.status(400).json({ error: "An error occurred"});
    }
})

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.status(200).json({ success: "Logged out successfully" });
});

router.post("/signin", (req, res) => {
    const { username, password, email } = req.body;
    let users = req.users;

    console.log(username);
    console.log(password);
    console.log(email);
    
    if(users.find(u => u.username === username)) {
        return res.status(400).json({ error: "Username is taken!" });
    }

    if(!emailVal.validate(email)) {
        return res.status(400).json({ error: "Email is incorrect!" });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@$!%*?&]{8,}$/;
    if(!passwordRegex.test(password)) {
        return res.status(400).json({ error: "Password must contain at least 8 characters, including at least one number, one uppercase letter, one lowercase letter, and one special character." });
    }

    const newUser = { username: username, password: password, email: email, chats: [] };
    users.push(newUser);

    saveUsers(users);

    res.status(200).json({ success: "Profile created successfully!" });
})

router.delete("/delete", (req, res) => {
    const { username, password } = req.body;
    let users = req.users;

    const index = users.findIndex(u => u.username === username);
    if(index !== -1) {
        if(password != users[index].password) {
            return res.status(400).json({ error: "Password is incorrect!" });
        }

        users.splice(index, 1);

        saveUsers(users);
        res.status(200).json({ success: "Deleted successfully" })
    } else {
        res.status(400).json({ error: "Username is incorrect!" });
    }
})

function saveUsers(users) {
    fs.writeFileSync(path.join(__dirname, "../users.json"), JSON.stringify(users), (err) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: "Error saving data" });
        }
    })
}

module.exports = router;