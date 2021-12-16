//Trigga "connection"
const socket = io({ autoConnect: false });

function parseMessage(data){
    let html = `<h6>${data.sender} ${data.time.substring(11,16)}</h6><p>${data.message}</p>`
    return html;     
};

//Function to escape bad html
function escapeHTML(obj) {
    const tempObj = obj;
    for (let x in obj) {
        tempObj[x] = (obj[x]).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    return tempObj;
}

window.onload = () => {  
    const userNameInputForm = document.getElementById("userNameInputForm");
    const userNameInput = document.getElementById("userNameInput");
    const serverMsgTD = document.getElementById("serverMsgTD");
    const chat = document.getElementById("chat");
    const output = document.getElementById("chatOutput");
    const input = document.getElementById("chatInput");
    const inputForm = document.getElementById("chatInputForm");
    const usersDisplay = document.getElementById("usersDisplay");
    const selectUser = document.getElementById("selectUser");
    let userList = [];
    
    //Scrolla
    let prevScrollTop = 0;
    function autoScroll(){
        if (prevScrollTop <= output.scrollTop){
            output.scrollTop = output.scrollHeight;
            prevScrollTop = output.scrollTop;
        }
    }

    //Login
    let userName = false;
    userNameInputForm.addEventListener("submit", (evt) =>{
        evt.preventDefault();
        userName = userNameInput.value;
        socket.auth = { userName };
        socket.connect();
        socket.emit("users_online", false);   
        //Show Chat and hide login
        userNameInputForm.reset();
        userNameInputForm.style.display = "none";
        chat.style.display = "table";
    });
    
    //User is writing
    input.addEventListener("input", () => {
        if (input.value !== "") {
            socket.emit("user_writing", true);
        }
        else {
            socket.emit("user_writing", false); 
        }
    });

    //Send Message
    inputForm.addEventListener("submit", (evt) =>{
        evt.preventDefault();
        if (input.value){
            let message = input.value;
            input.value = "";
            const msgObj = {};
            msgObj.sender = userName;
            msgObj.time = new Date().toISOString()
            msgObj.message = message;
            //send message to all
            if (selectUser.value === "none"){
                socket.emit("message", msgObj);
                msgObj.sender = "Du skrev:";
            }
            //send private message
            else{
                msgObj.id = selectUser.value;
                msgObj.sender = `${msgObj.sender} viskar:`
                socket.emit("private_message", msgObj)
                let user = userList.find(obj => obj.id === selectUser.value);
                msgObj.sender = `Du viskar till: ${user.userName}`
            }
            msgObj = escapeHTML(msgObj);
            output.innerHTML += parseMessage(msgObj);
            autoScroll();
            socket.emit("user_writing", false);
        }   
    });

    //Recieve Message
    socket.on("message", (data) => {
        output.innerHTML += parseMessage(data);
        autoScroll();
    });

    //Recieve private Chat
    socket.on("private_message", (data) => {
        output.innerHTML += parseMessage(data);
        autoScroll();
    });

    //A user connected/disconnected
    socket.on("user_action", (data) => {
        serverMsgTD.innerHTML = '<h5>' + data + '</h5>';
        if (data.includes("connected")){
            socket.emit("users_online", false);    
        }   
    });

    //get Chatlog
    socket.on("chat_log", (data) => {
        data.forEach(obj => {
            output.innerHTML += parseMessage(obj);
            autoScroll();
        });
    });

    //get list of all users
    socket.on("users_online", (data) => {

        userList = data;
        let html = `<p>${userName}</p>`;
        //Show who is Online
        data.forEach(element => {
            html += `<p>${element.userName}</p>`;
        });
        usersDisplay.innerHTML = html;

        //Create Select list for channels
        html = `<option value="none">Alla</option>`
        data.forEach(user => {
            console.log(user)
            html += `<option value="${user.id}">${user.userName}</option>`;
        });
        selectUser.innerHTML = html;
    });
}