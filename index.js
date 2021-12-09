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


//User connects
io.on("connection", (socket) => {
    socket.userName = socket.handshake.auth.userName;
    usersOnline.push(socket.userName); 
    socket.broadcast.emit('user_action', socket.userName + ' joined');
    console.log(socket.userName + " Connected")
    //Send usersonline
    console.log(usersOnline)
    io.emit("users_online",usersOnline);

    //User Disconnects
    socket.on("disconnect", () => {
        usersOnline = usersOnline.filter(item => item !== socket.userName);
        console.log(socket.userName + " Disconnected")
        console.log(usersOnline)
        //Send usersonline
        io.emit("users_online",usersOnline);
        socket.broadcast.emit('user_action', socket.userName + ' disconnected');
    });

    //Manage messages
    socket.on("message", (data) => {
        const msgObj = {};
        msgObj.sender = socket.userName;
        msgObj.time = new Date().toISOString();
        msgObj.message = data;
        socket.broadcast.emit("message", msgObj);
    });
});



