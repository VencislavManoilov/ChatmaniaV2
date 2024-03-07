const express = require("express");
const router = express.Router();
const session = require('express-session');
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

router.post("/new", (req, res) => {
    const { username, username2, name } = req.body;
    const user = req.session.user;
    
    let users = req.users;
    let chats = req.chats;

    const index1 = users.findIndex(u => u.username === username), index2 = users.findIndex(u => u.username === username2);

    if(typeof user === 'undefined' || typeof user.username === 'undefined') {
        return res.status(400).json({ error: "Lost connection" });
    }

    if(index1 !== -1 && username === user.username) {
        if(index2 !== -1) {
            const chat = uuidv4();
            const data = {
                name: name,
                dateCreated: new Date(),
                users: [username, username2],
                messages: []
            };

            fs.writeFileSync(path.join(__dirname, "chats", chat + ".json"), JSON.stringify(data), (err) => {
                if(err) {
                    console.log(err);
                    return res.status(500).json({ error: "Error saving data" });
                }
            });

            users[index1].chats.push(chat);
            users[index2].chats.push(chat);
            chats.push(chat);

            fs.writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(users), (err) => {
                if(err) {
                    console.log(err);
                    return res.status(500).json({ error: "Error saving data" });
                }
            })

            fs.writeFileSync(path.join(__dirname, "chats.json"), JSON.stringify(chats), (err) => {
                if(err) {
                    console.log(err);
                    return res.status(500).json({ error: "Error saving data" });
                }
            })

            return res.status(200).json({ success: "Chat created successfully!" });

        } else {
            return res.status(400).json({ error: "Your friend's username doesn't exist!" });
        }
    } else {
        return res.status(400).json({ error: "Your username doesn't exists!" });
    }
})

router.get("/get", (req, res) => {
    const { chat } = req.body;
    
    let chatJson = "";
    if(chat) {
        chatJson = JSON.parse(fs.readFileSync(path.join(__dirname, "chats", chat + ".json"), "utf8", (err, data) => {
            if(err) {
                return res.status(400).json({ error: "No such chat" });
            }
        }))
    } else {
        return res.status(400).json({ error: "No such chat" });
    }

    res.status(200).json(chatJson);
})

router.post("/send", (req, res) => {
    const { chat, who, text } = req.body;

    let chats = req.chats;

    // This needs to be optimized
    if(chats.find(c => c === chat)) {
        let chatJson = JSON.parse(fs.readFileSync(path.join(__dirname, "chats", chat + ".json"), "utf8"));

        if(chatJson.users.find(u => u === who)) {
            chatJson.messages.push({ who: who, text: text, date: new Date() });

            fs.writeFileSync(path.join(__dirname, "chats", chat + ".json"), JSON.stringify(chatJson), (err) => {
                if(err) {
                    console.log(err);
                    return res.status(400).json({ error: "Error saving data" });
                }
            })

            return res.status(200).json(chatJson);
        } else {
            return res.status(400).json({ error: "Wrong username" });
        }
    } else {
        return res.status(400).json({ error: "No such chat" });
    }
})

module.exports = router;