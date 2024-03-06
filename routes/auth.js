const express = require("express");
const router = express.Router();
const session = require("express-session");
const emailVal = require("email-validator");
const path = require("path");
const fs = require("fs");
const { error } = require("console");

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = req.users;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.status(200).json({ success: "Login successful" });
    } else {
        res.status(401).json({ error: "Invalid username or password" });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.status(200).json({ success: "Logged out successfully" });
});

router.post("/signin", (req, res) => {
    const { username, password, email } = req.body;
    let users = req.users;
    
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

    const newUser = { username: username, password: password, email: email };
    users.push(newUser);

    saveUsers(users);

    res.status(200).json({ success: "I am genius!!!" });
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