const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server);

//use public folder
app.use(express.static("public"));

//implement route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/ChatApp.html")
});

//Start Server
server.listen(3000);
console.log("kör servern på localhost:3000");

let usersOnline = [];
let chatLog = [];

//Function to escape bad html
function escapeHTML(obj) {
    const tempObj = obj;
    for (let x in obj) {
        tempObj[x] = (obj[x]).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    return tempObj;
}


//User connects
io.on("connection", (socket) => {
    //Set userName
    socket.userName = socket.handshake.auth.userName;

    //Create userObj
    userObj = {};
    userObj.userName = socket.userName;
    userObj.id = socket.id;

    //Store userObj in Array
    usersOnline.push(userObj);

    //Broadcast that a user has joined the chat 
    socket.broadcast.emit('user_action', socket.userName + ' joined');
    console.log(socket.userName + " Connected")

    //Send Chatlog
    socket.emit("chat_log", chatLog);

    //Send Welcome Message from server
    socket.emit("user_action", "Välkommen " + socket.userName + "!");

    //User Disconnects
    socket.on("disconnect", () => {
        usersOnline = usersOnline.filter(item => item.id !== socket.id);
        console.log(socket.userName + " Disconnected")
        socket.broadcast.emit('user_action', socket.userName + ' disconnected');
    });

    //Manage messages
    socket.on("message", (data) => {
        data = escapeHTML(data);
        chatLog.push(data);
        socket.broadcast.emit("message", data);
    });

    socket.on("private_message", (data) => {
        socket.to(data.id).emit("private_message", data);
    });

    //Send userOnline
    socket.on("users_online", () => {
        let users = usersOnline.filter(item => item.id !== socket.id);
        socket.emit("users_online",users);
    });

    //Send user is writing
    socket.on("user_writing", (data) => {
        let msg = (data) ? socket.userName + " skriver...":"";
        socket.broadcast.emit("user_action", msg);
    });
});



