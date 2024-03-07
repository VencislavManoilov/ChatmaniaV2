const express = require("express");
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const PORT = 3000;

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
    next();
});

const auth = require("./routes/auth");
app.use("/auth", auth);

app.post("/newchat", (req, res) => {
    const { username, username2 } = req.body;
    const user = req.session.user;

    const index1 = users.findIndex(u => u.username === username), index2 = users.findIndex(u => u.username === username2);

    if(index1 !== -1 && username === user.username) {
        if(index2 !== -1) {
            // Generate random string, create new json file with the messages and save the new chat in the users profiles
            const name = uuidv4();
            const data = {
                dateCreated: new Date(),
                users: [username, username2],
                messages: []
            };

            fs.writeFileSync(path.join(__dirname, "chats", name + ".json"), JSON.stringify(data), (err) => {
                if(err) {
                    console.error(err);
                    return res.status(500).json({ error: "Error saving data" });
                }
            });

            users[index1].chats.push(name);
            users[index2].chats.push(name);
            chats.push(name);

            fs.writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(users), (err) => {
                if(err) {
                    console.error(err);
                    return res.status(500).json({ error: "Error saving data" });
                }
            })

            fs.writeFileSync(path.join(__dirname, "chats.json"), JSON.stringify(chats), (err) => {
                if(err) {
                    console.error(err);
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

app.get("/chat", (req, res) => {
    const { name } = req.body;
    
    let chat = ""
    if(name) {
        chat = JSON.parse(fs.readFileSync(path.join(__dirname, "chats", name + ".json"), "utf8", (err, data) => {
            if(err) {
                return res.status(400).json({ error: "No such chat" });
            }
        }))
    } else {
        return res.status(400).json({ error: "No such chat" });
    }

    res.status(200).json(chat);
})

app.post("/send", (req, res) => {
    const { chat, who, text } = req.body;

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