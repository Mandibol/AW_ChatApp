const express = require("express");
const app = express();
app.use(express.static("public"));
//implementera route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/socket.html")
});

//Behöver http.paket
const http = require("http");
const server = http.createServer(app);
server.listen(3000);
console.log("kör servern på localhost:3000");

//importera socket.io
const { Server, Socket } = require("socket.io")
const io = new Server(server);

//När en klient ansluter och skapar en socket
io.on("connection", (socket) => {
    console.log("en klient anslöt till servern");
    console.log("Klientens id: "+ socket.id);
    socket.user = "egetUserName";
    console.log("klientens användarnamn: " + socket.user);

    //Triggas när en användare avslutar uppkopplingen
    socket.on("disconnect", (socket) => {
        console.log("En klient har stängt ner")
    });

    socket.on("klientknackning", () => {
        console.log("En klient knackade!");
        socket.emit("serverknackning");
    });

    socket.on("message", (data) => {
        console.log("Meddelande från klient: " + data);
        socket.emit("message", "Servern hälsar tillbaka");
    });

    socket.emit("dataFromServer", {language: "svenska", text:"Hejsan"});

    socket.on("chat-message", (data) => {
        console.log(data);
        socket.broadcast.emit("chat-message", data);
    });
});

