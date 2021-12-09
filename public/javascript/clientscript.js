//Trigga "connection"
const socket = io({ autoConnect: false });

function parseMessage(data){
    let html = `<h6>${data.sender} ${data.time.substring(11,16)}</h6><p>${data.message}</p>`
    return html;     
};

window.onload = () => {   
    const output = document.getElementById("outputInner");
    const input = document.getElementById("inputInner");
    const inputForm = document.getElementById("inputOuter");
    const usersDisplay = document.getElementById("usersInner");
    const userName = prompt("Välj Ett användarnamn");
    socket.auth = { userName };
    socket.connect();
    
    //Send Message
    inputForm.addEventListener("submit", (evt) =>{
        evt.preventDefault();
        let message = input.value;
        socket.emit("message", message);
        input.value = "";

        const msgObj = {};
        msgObj.sender = userName;
        msgObj.time = new Date().toISOString()
        msgObj.message = message;
        output.innerHTML += parseMessage(msgObj);
    });

    //Recieve Message
    socket.on("message", (data) => {
        output.innerHTML += parseMessage(data); 
    });

    //A user connected
    socket.on("user_action", (data) => {
        output.innerHTML += '<h5>' + data + '</h5>';
    });

    //get list of all users
    socket.on("users_online", (data) => {
        let html = "";
        data.forEach(element => {
            html += '<p>' + element + '</p>';
        });
        usersDisplay.innerHTML = html;
    });

    socket.onAny((event, ...args) => {
        console.log(event, args);
      });
}
