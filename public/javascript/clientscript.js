//Trigga "connection"
let socket = io();

//Trigga en "klientknackning"
socket.emit("klientknackning");

//lyssna på serverknackning
socket.on("serverknackning", () => {
    console.log("servern knackade tillbaka");
});

socket.emit("message", "Klienten säger hej");

socket.on("message", (data) => {
    console.log("Meddelande från server: " + data);
});

socket.on("dataFromServer", (data) => {
    console.log("Meddelande från server: " + data.language + ": " +data.text);
});
/*
let message = prompt("Skriv Något!");
socket.emit("chat-message", message);

socket.on("chat-message", (data) => {
    console.log("En annan klient:" + data);
});
*/

window.onload = () => {   
    let output = document.getElementById("output");
    
    document.getElementById("form").addEventListener("submit", (evt) =>{
        evt.preventDefault();
        let message = document.getElementById("message").value;
        socket.emit("chat-message", message);
        document.getElementById("message").value = "";

        let tid = new Date().toISOString().substring(11,16);
        let html = `<p>Du skrev (${tid}): ${message}</p>`
        output.innerHTML = html;  
    });

    socket.on("chat-message", (data) => {
        let tid = new Date().toISOString().substring(11,16);
        let html = `<p>En annan klient skrev (${tid}): ${data}</p>`
        output.innerHTML = html; 
    });
}
